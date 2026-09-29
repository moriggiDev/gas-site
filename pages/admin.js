import { useEffect, useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [neighborhoodsText, setNeighborhoodsText] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-password");
    if (saved) {
      setPassword(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      fetch("/api/data")
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setNeighborhoodsText(d.neighborhoods.join(", "));
        });
    }
  }, [unlocked]);

  function tryUnlock(e) {
    e.preventDefault();
    sessionStorage.setItem("admin-password", password);
    setUnlocked(true);
  }

  async function save() {
    setStatus("Salvando...");
    const neighborhoods = neighborhoodsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...data, neighborhoods };
    const res = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      setStatus("Senha incorreta. Recarregue a página e tente de novo.");
      sessionStorage.removeItem("admin-password");
      return;
    }
    if (!res.ok) {
      setStatus("Erro ao salvar. Tente novamente.");
      return;
    }
    setData(payload);
    setStatus("Salvo! O site já está atualizado.");
    setTimeout(() => setStatus(""), 3000);
  }

  function updateCylinder(id, field, value) {
    setData((d) => ({
      ...d,
      cylinders: d.cylinders.map((c) =>
        c.id === id ? { ...c, [field]: field === "price" ? Number(value) : value } : c
      ),
    }));
  }

  if (!unlocked) {
    return (
      <div style={S.lockScreen}>
        <form onSubmit={tryUnlock} style={S.lockBox}>
          <h1 style={S.lockTitle}>Painel admin</h1>
          <p style={S.lockSub}>Digite a senha para editar preços e entrega.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            style={S.input}
            autoFocus
          />
          <button type="submit" style={S.button}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  if (!data) {
    return <div style={S.loading}>Carregando...</div>;
  }

  return (
    <div style={S.page}>
      <h1 style={S.title}>Painel admin — São Francisco Gás</h1>

      <section style={S.card}>
        <h2 style={S.cardTitle}>Preços dos produtos</h2>
        {data.cylinders.map((c) => (
          <div key={c.id} style={S.row}>
            <input
              style={S.inputInline}
              value={c.label}
              onChange={(e) => updateCylinder(c.id, "label", e.target.value)}
            />
            <div style={S.priceInputWrap}>
              <span>R$</span>
              <input
                style={S.priceInput}
                type="number"
                step="0.01"
                value={c.price}
                onChange={(e) => updateCylinder(c.id, "price", e.target.value)}
              />
            </div>
          </div>
        ))}
      </section>

      <section style={S.card}>
        <h2 style={S.cardTitle}>Entrega</h2>
        <label style={S.label}>Observação sobre a entrega</label>
        <input
          style={S.inputFull}
          value={data.deliveryNote}
          onChange={(e) => setData((d) => ({ ...d, deliveryNote: e.target.value }))}
        />
        <label style={S.label}>Bairros atendidos (separados por vírgula)</label>
        <input
          style={S.inputFull}
          value={neighborhoodsText}
          onChange={(e) => setNeighborhoodsText(e.target.value)}
        />
        <label style={S.label}>Horário de funcionamento</label>
        <input
          style={S.inputFull}
          value={data.hours}
          onChange={(e) => setData((d) => ({ ...d, hours: e.target.value }))}
        />
      </section>

      <section style={S.card}>
        <h2 style={S.cardTitle}>Contato</h2>
        <label style={S.label}>WhatsApp (só números, com DDI 55 e DDD)</label>
        <input
          style={S.inputFull}
          value={data.whatsapp}
          onChange={(e) => setData((d) => ({ ...d, whatsapp: e.target.value }))}
        />
      </section>

      <button onClick={save} style={S.saveButton}>
        Salvar alterações
      </button>
      {status && <p style={S.status}>{status}</p>}
    </div>
  );
}

const S = {
  lockScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--azul)",
  },
  lockBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 32,
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  lockTitle: { fontSize: 22, margin: 0 },
  lockSub: { fontSize: 14, color: "#555", margin: "0 0 8px" },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 15,
  },
  button: {
    background: "var(--vermelho)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  loading: { padding: 40, fontSize: 16 },
  page: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "32px 20px 80px",
  },
  title: { fontSize: 24, marginBottom: 24 },
  card: {
    background: "#fff",
    border: "1px solid #e2e2e8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, marginBottom: 14 },
  row: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  inputInline: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  priceInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: "0 10px",
  },
  priceInput: {
    width: 90,
    padding: "10px 4px",
    border: "none",
    fontSize: 14,
    outline: "none",
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#555",
    margin: "12px 0 6px",
  },
  inputFull: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  saveButton: {
    background: "var(--azul)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  status: { textAlign: "center", marginTop: 12, fontSize: 14 },
};