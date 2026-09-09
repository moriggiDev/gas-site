import { getData } from "../lib/store";

export async function getServerSideProps() {
  const data = await getData();
  return { props: { data } };
}

function waLink(phone, text) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function Home({ data }) {
  const cheapest = data.cylinders.reduce(
    (min, c) => (c.price < min.price ? c : min),
    data.cylinders[0]
  );

  return (
    <div>
      {/* HERO */}
      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroText}>
            <p style={styles.brandTag}>São Francisco Gás</p>
            <h1 style={styles.heroTitle}>
              Acabou o gás?
              <br />
              Chega em minutos.
            </h1>
            <p style={styles.heroSub}>
              Entrega de botijão direto na sua casa, todos os dias.
              Peça pelo WhatsApp e receba sem sair de casa.
            </p>
            <div style={styles.priceHighlight}>
              <span style={styles.priceHighlightLabel}>A partir de</span>
              <span style={styles.priceHighlightValue}>
                R$ {cheapest.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <a
              href={waLink(data.whatsapp, "Olá! Quero pedir um botijão de gás.")}
              style={styles.ctaButton}
            >
              Pedir no WhatsApp
            </a>
          </div>
          <div style={styles.heroArt} aria-hidden="true">
            <FlameArt />
          </div>
        </div>
      </header>

      {/* PREÇOS */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Preços</h2>
        <div style={styles.priceList}>
          {data.cylinders.map((c, i) => (
            <div
              key={c.id}
              style={{
                ...styles.priceRow,
                background: i % 2 === 0 ? "var(--azul)" : "var(--vermelho)",
              }}
            >
              <span style={styles.priceRowLabel}>{c.label}</span>
              <span style={styles.priceRowValue}>
                R$ {c.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
          ))}
        </div>
        <p style={styles.deliveryNote}>{data.deliveryNote}</p>
      </section>

      {/* ÁREA DE ENTREGA */}
      <section style={{ ...styles.section, paddingTop: 0 }}>
        <h2 style={styles.sectionTitle}>Área de entrega</h2>
        <div style={styles.chipRow}>
          {data.neighborhoods.map((n) => (
            <span key={n} style={styles.chip}>
              {n}
            </span>
          ))}
        </div>
        <p style={styles.hours}>🕒 {data.hours}</p>
      </section>

      {/* RODAPÉ */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          São Francisco Gás · Luís Eduardo Magalhães - BA
        </p>
        <p style={styles.footerText}>
          WhatsApp: {formatPhone(data.whatsapp)}
        </p>
      </footer>

      {/* BARRA FIXA MOBILE */}
      <a
        href={waLink(data.whatsapp, "Olá! Quero pedir um botijão de gás.")}
        style={styles.stickyBar}
      >
        Pedir agora pelo WhatsApp
      </a>
    </div>
  );
}

function formatPhone(digits) {
  // 5577998492816 -> (77) 99849-2816
  const local = digits.slice(2); // remove 55
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

function FlameArt() {
  return (
    <svg viewBox="0 0 240 280" width="100%" style={{ maxWidth: 260 }}>
      <path
        d="M120 20 C60 90 40 140 60 190 C75 230 115 260 120 260 C125 260 165 230 180 190 C200 140 180 90 120 20 Z"
        fill="var(--vermelho)"
      />
      <path
        d="M120 90 C95 130 88 160 100 190 C108 212 118 228 120 228 C122 228 132 212 140 190 C152 160 145 130 120 90 Z"
        fill="var(--amarelo)"
      />
    </svg>
  );
}

const styles = {
  hero: {
    background: "var(--azul)",
    color: "#fff",
  },
  heroInner: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "56px 24px 72px",
    display: "flex",
    alignItems: "center",
    gap: 32,
    flexWrap: "wrap",
  },
  heroText: {
    flex: "1 1 360px",
    minWidth: 280,
  },
  brandTag: {
    fontFamily: "Baloo 2, sans-serif",
    fontWeight: 600,
    color: "var(--amarelo)",
    margin: "0 0 8px",
    fontSize: 16,
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 52px)",
    color: "#fff",
  },
  heroSub: {
    fontSize: 17,
    color: "#dbe1ff",
    maxWidth: 420,
    margin: "18px 0 24px",
    lineHeight: 1.6,
  },
  priceHighlight: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 10,
    background: "rgba(255,255,255,0.08)",
    border: "2px solid var(--amarelo)",
    borderRadius: 10,
    padding: "10px 18px",
    marginBottom: 24,
  },
  priceHighlightLabel: {
    fontSize: 14,
    color: "#dbe1ff",
  },
  priceHighlightValue: {
    fontFamily: "Baloo 2, sans-serif",
    fontWeight: 700,
    fontSize: 28,
    color: "var(--amarelo)",
  },
  ctaButton: {
    display: "inline-block",
    background: "var(--vermelho)",
    color: "#fff",
    fontFamily: "Baloo 2, sans-serif",
    fontWeight: 600,
    fontSize: 18,
    padding: "14px 28px",
    borderRadius: 10,
    textDecoration: "none",
    border: "2px solid var(--tinta)",
  },
  heroArt: {
    flex: "0 0 220px",
    display: "flex",
    justifyContent: "center",
  },
  section: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "48px 24px",
  },
  sectionTitle: {
    fontSize: 26,
    marginBottom: 20,
    color: "var(--tinta)",
  },
  priceList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 520,
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderRadius: 10,
    border: "2px solid var(--tinta)",
  },
  priceRowLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
  },
  priceRowValue: {
    fontFamily: "Baloo 2, sans-serif",
    fontWeight: 700,
    fontSize: 22,
    color: "var(--amarelo)",
  },
  deliveryNote: {
    marginTop: 16,
    color: "var(--tinta-suave)",
    fontSize: 15,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    background: "#fff",
    border: "2px solid var(--azul)",
    color: "var(--azul)",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
  },
  hours: {
    marginTop: 18,
    fontSize: 15,
    color: "var(--tinta-suave)",
  },
  footer: {
    background: "var(--tinta)",
    color: "#c8c8d0",
    padding: "28px 24px 90px",
    textAlign: "center",
  },
  footerText: {
    margin: "4px 0",
    fontSize: 14,
  },
  stickyBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--vermelho)",
    color: "#fff",
    textAlign: "center",
    padding: "16px",
    fontFamily: "Baloo 2, sans-serif",
    fontWeight: 600,
    fontSize: 16,
    textDecoration: "none",
    borderTop: "2px solid var(--tinta)",
  },
};
