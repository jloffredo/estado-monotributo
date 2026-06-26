import express from "express";
import cors from "cors";
import { obtenerCategoriasMonotributo } from "./afip-scrapper.js";
import { upsertEscalas, getEscalas, insertFactura, getFacturas, updateFactura, deleteFactura, getConfig, setConfig } from "./db.js";

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
      `Escalas sincronizadas: ${categorias.length} categorías (${vigencia})`,
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
  const { tipo, fecha, cuit, destinatario, descripcion, monto } = req.body;

  if (!tipo || !["C", "E"].includes(tipo))
    return res.status(400).json({ error: 'tipo debe ser "C" o "E"' });

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return res
      .status(400)
      .json({ error: "fecha debe tener formato YYYY-MM-DD" });

  if (!destinatario || typeof destinatario !== "string" || !destinatario.trim())
    return res.status(400).json({ error: "destinatario es requerido" });
  if (!cuit || typeof cuit !== "string" || !cuit.trim())
    return res.status(400).json({ error: "cuit es requerido" });
  if (!descripcion || typeof descripcion !== "string" || !descripcion.trim())
    return res.status(400).json({ error: "descripcion es requerido" });

  if (typeof monto !== "number" || monto <= 0)
    return res.status(400).json({ error: "monto debe ser un número positivo" });

  try {
    const result = insertFactura(
      tipo,
      fecha,
      cuit.trim(),
      destinatario.trim(),
      descripcion.trim(),
      monto,
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/facturas/:id
app.put("/api/facturas/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "id inválido" });

  const { tipo, fecha, cuit, destinatario, descripcion, monto } = req.body;

  if (!tipo || !["C", "E"].includes(tipo))
    return res.status(400).json({ error: 'tipo debe ser "C" o "E"' });
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return res.status(400).json({ error: "fecha debe tener formato YYYY-MM-DD" });
  if (!destinatario || typeof destinatario !== "string" || !destinatario.trim())
    return res.status(400).json({ error: "destinatario es requerido" });
  if (!cuit || typeof cuit !== "string" || !cuit.trim())
    return res.status(400).json({ error: "cuit es requerido" });
  if (!descripcion || typeof descripcion !== "string" || !descripcion.trim())
    return res.status(400).json({ error: "descripcion es requerida" });
  if (typeof monto !== "number" || monto <= 0)
    return res.status(400).json({ error: "monto debe ser un número positivo" });

  try {
    const result = updateFactura(id, tipo, fecha, cuit.trim(), destinatario.trim(), descripcion.trim(), monto);
    if (result.changes === 0) return res.status(404).json({ error: "Factura no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/facturas/:id
app.delete("/api/facturas/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "id inválido" });

  try {
    const result = deleteFactura(id);
    if (result.changes === 0) return res.status(404).json({ error: "Factura no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/config
app.get("/api/config", (_req, res) => {
  try {
    res.json(getConfig());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/config
app.put("/api/config", (req, res) => {
  const { modo } = req.body;
  if (!modo || !["anual", "semestral"].includes(modo))
    return res.status(400).json({ error: 'modo debe ser "anual" o "semestral"' });

  try {
    setConfig(modo);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/facturas?anio=2024[&modo=anual|semestral]
// GET /api/facturas?modo=semestral&anio=2024   → 01/07/{anio-1} - 30/06/{anio}
app.get("/api/facturas", (req, res) => {
  const { anio } = req.query;
  let { modo } = req.query;

  if (!modo) {
    modo = getConfig()?.modo ?? "anual";
  }

  if (!["anual", "semestral"].includes(modo))
    return res
      .status(400)
      .json({ error: 'modo debe ser "anual" o "semestral"' });

  if (!anio || !/^\d{4}$/.test(anio))
    return res.status(400).json({ error: "anio debe ser un año de 4 dígitos" });

  const year = parseInt(anio, 10);
  const desde = modo === "anual" ? `${year}-01-01` : `${year - 1}-07-01`;
  const hasta = modo === "anual" ? `${year}-12-31` : `${year}-06-30`;

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
