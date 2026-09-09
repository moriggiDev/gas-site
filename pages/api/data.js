import { getData, saveData } from "../../lib/store";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await getData();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const providedPassword = req.headers["x-admin-password"];
    if (!process.env.ADMIN_PASSWORD) {
      return res.status(500).json({ error: "ADMIN_PASSWORD não configurada no servidor." });
    }
    if (providedPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Senha incorreta." });
    }
    const saved = await saveData(req.body);
    return res.status(200).json(saved);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} not allowed`);
}
