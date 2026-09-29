import fs from "fs";
import path from "path";

const DEFAULT_DATA = {
  updatedAt: null,
  whatsapp: "5577998492816",
  cylinders: [
    { id: "p13", label: "Botijão P13 (13kg)", price: 110 },
    { id: "agua20", label: "Água Mineral 20L", price: 15 },
  ],
  deliveryFee: 0,
  deliveryNote: "Entrega grátis em toda a área atendida",
  neighborhoods: ["Centro", "Novo Horizonte", "Morada Nobre", "Cidade Nova"],
  hours: "Segunda a sábado, 7h às 20h",
};

const REMOVED_PRODUCT_IDS = ["p20", "p45"];

// Ajusta dados já salvos no banco: remove produtos descontinuados e
// adiciona produtos novos que ainda não existem no registro salvo.
function normalize(data) {
  const saved = Array.isArray(data.cylinders) ? data.cylinders : [];
  const cylinders = saved.filter((c) => !REMOVED_PRODUCT_IDS.includes(c.id));
  for (const def of DEFAULT_DATA.cylinders) {
    if (!cylinders.some((c) => c.id === def.id)) cylinders.push(def);
  }
  return { ...data, cylinders };
}

const LOCAL_FILE = path.join(process.cwd(), ".local-data.json");

const POSTGRES_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const hasPostgres = Boolean(POSTGRES_URL);
const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);

// ---------- Postgres (Neon) ----------
async function getSql() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(POSTGRES_URL);
}

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS gas_site_data (
    id INT PRIMARY KEY DEFAULT 1,
    payload JSONB NOT NULL
  )`;
}

async function getFromPostgres() {
  const sql = await getSql();
  await ensureTable(sql);
  const rows = await sql`SELECT payload FROM gas_site_data WHERE id = 1`;
  if (rows.length === 0) return DEFAULT_DATA;
  return rows[0].payload;
}

async function saveToPostgres(payload) {
  const sql = await getSql();
  await ensureTable(sql);
  await sql`
    INSERT INTO gas_site_data (id, payload) VALUES (1, ${JSON.stringify(payload)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET payload = ${JSON.stringify(payload)}::jsonb
  `;
  return payload;
}

// ---------- Redis (Upstash) ----------
async function getRedisClient() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
}

// ---------- API pública ----------
export async function getData() {
  return normalize(await readData());
}

async function readData() {
  if (hasPostgres) {
    return getFromPostgres();
  }
  if (hasRedis) {
    const redis = await getRedisClient();
    const data = await redis.get("gas:data");
    return data || DEFAULT_DATA;
  }
  try {
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DATA;
  }
}

export async function saveData(data) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  if (hasPostgres) {
    return saveToPostgres(payload);
  }
  if (hasRedis) {
    const redis = await getRedisClient();
    await redis.set("gas:data", payload);
    return payload;
  }
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(payload, null, 2));
  return payload;
}