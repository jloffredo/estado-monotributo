import express from "express";
import cors from "cors";
import { obtenerCategoriasMonotributo } from "./afip-scrapper.js";
import { upsertEscalas, getEscalas, insertFactura, getFacturas } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function sincronizarEscalas() {
  try {
    console.log("Sincronizando escalas desde AFIP...");
    const { vigencia, categorias } = await obtenerCategoriasMonotributo();
    upsertEscalas(vigencia, categorias);
    console.log(
      `Escalas sincronizadas: ${categorias.length} categorías (${vigencia})`
    );
  } catch (err) {
    console.error("Error sincronizando escalas:", err.message);
  }
}

// GET /api/escalas
app.get("/api/escalas", (_req, res) => {
  try {
    res.json(getEscalas());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/escalas/sync — fuerza resincronización con AFIP
app.post("/api/escalas/sync", async (_req, res) => {
  try {
    await sincronizarEscalas();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/facturas
// Body: { tipo: "C"|"E", fecha: "YYYY-MM-DD", destinatario: string, monto: number }
app.post("/api/facturas", (req, res) => {
  const { tipo, fecha, destinatario, monto } = req.body;

  if (!tipo || !["C", "E"].includes(tipo))
    return res.status(400).json({ error: 'tipo debe ser "C" o "E"' });

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return res
      .status(400)
      .json({ error: "fecha debe tener formato YYYY-MM-DD" });

  if (!destinatario || typeof destinatario !== "string" || !destinatario.trim())
    return res.status(400).json({ error: "destinatario es requerido" });

  if (typeof monto !== "number" || monto <= 0)
    return res
      .status(400)
      .json({ error: "monto debe ser un número positivo" });

  try {
    const result = insertFactura(tipo, fecha, destinatario.trim(), monto);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/facturas?modo=anual&anio=2024
// GET /api/facturas?modo=semestral&anio=2024   → 01/07/{anio} - 30/06/{anio+1}
app.get("/api/facturas", (req, res) => {
  const { modo, anio } = req.query;

  if (!modo || !["anual", "semestral"].includes(modo))
    return res
      .status(400)
      .json({ error: 'modo debe ser "anual" o "semestral"' });

  if (!anio || !/^\d{4}$/.test(anio))
    return res.status(400).json({ error: "anio debe ser un año de 4 dígitos" });

  const year = parseInt(anio, 10);
  const desde =
    modo === "anual" ? `${year}-01-01` : `${year}-07-01`;
  const hasta =
    modo === "anual" ? `${year}-12-31` : `${year + 1}-06-30`;

  try {
    const facturas = getFacturas(desde, hasta);
    res.json({ modo, desde, hasta, facturas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
  // Reintenta hasta 3 veces con 10s de espera si AFIP no responde al arrancar
  for (let intento = 1; intento <= 3; intento++) {
    await sincronizarEscalas();
    if (getEscalas().length > 0) break;
    if (intento < 3) {
      console.log(`Base vacía, reintentando en 10s... (${intento}/3)`);
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }
});
