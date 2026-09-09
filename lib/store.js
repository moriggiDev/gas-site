import fs from "fs";
import path from "path";

const DEFAULT_DATA = {
  updatedAt: null,
  whatsapp: "5577998492816",
  cylinders: [
    { id: "p13", label: "Botijão P13 (13kg)", price: 110 },
    { id: "p20", label: "Botijão P20 (20kg)", price: 165 },
    { id: "p45", label: "Botijão P45 (45kg)", price: 340 },
  ],
  deliveryFee: 0,
  deliveryNote: "Entrega grátis em toda a área atendida",
  neighborhoods: ["Centro", "Novo Horizonte", "Morada Nobre", "Cidade Nova"],
  hours: "Segunda a sábado, 7h às 20h",
};

const LOCAL_FILE = path.join(process.cwd(), ".local-data.json");

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasKv = Boolean(REDIS_URL && REDIS_TOKEN);

async function getKvClient() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
}

export async function getData() {
  if (hasKv) {
    const kv = await getKvClient();
    const data = await kv.get("gas:data");
    return data || DEFAULT_DATA;
  }
  // Fallback local (rodando "npm run dev" sem banco configurado ainda)
  try {
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DATA;
  }
}

export async function saveData(data) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  if (hasKv) {
    const kv = await getKvClient();
    await kv.set("gas:data", payload);
    return payload;
  }
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(payload, null, 2));
  return payload;
}
