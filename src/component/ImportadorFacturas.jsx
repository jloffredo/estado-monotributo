import { useState } from "react";

const TIPO_MAP = { 11: "C", 19: "E" };

function parseRow(line) {
  const result = [];
  let i = 0;
  while (i <= line.length) {
    if (i === line.length) {
      result.push("");
      break;
    }
    if (line[i] === '"') {
      const end = line.indexOf('"', i + 1);
      result.push(end === -1 ? line.slice(i + 1) : line.slice(i + 1, end));
      i = end === -1 ? line.length : end + 1;
      if (i < line.length && line[i] === ";") i++;
    } else {
      const end = line.indexOf(";", i);
      if (end === -1) {
        result.push(line.slice(i));
        break;
      }
      result.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return result;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseRow(lines[0]).map((h) => h.trim());
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const values = parseRow(line);
      return Object.fromEntries(
        headers.map((h, i) => [h, (values[i] ?? "").trim()]),
      );
    });
}

function rowToFactura(row) {
  console.log(row);
  const tipo = TIPO_MAP[row["Tipo de Comprobante"]];
  if (!tipo) return null;

  const pv = String(row["Punto de Venta"]).padStart(4, "0");
  const num = String(row["Número Desde"]).padStart(8, "0");
  const monto = parseFloat(row["Imp. Total"].replace(",", "."));
  if (!monto || monto <= 0) return null;

  return {
    tipo,
    fecha: row["Fecha de Emisión"],
    cuit: row["Nro. Doc. Receptor"],
    destinatario: row["Denominación Receptor"],
    descripcion: `Factura ${tipo} ${pv}-${num}`,
    monto,
  };
}

const ImportadorFacturas = () => {
  const [filas, setFilas] = useState([]);
  const [progreso, setProgreso] = useState(null);
  const [resultados, setResultados] = useState([]);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(ev.target.result);
      setFilas(parseCSV(text));
      setProgreso(null);
      setResultados([]);
    };
    reader.readAsArrayBuffer(file);
  }

  async function importar() {
    const facturas = filas.map(rowToFactura).filter(Boolean);
    setProgreso({ actual: 0, total: facturas.length, errores: 0 });
    const res = [];
    for (let i = 0; i < facturas.length; i++) {
      let entry;
      try {
        const resp = await fetch("/api/facturas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(facturas[i]),
        });
        const data = await resp.json();
        entry = resp.ok
          ? { ok: true, factura: facturas[i], id: data.id }
          : {
              ok: false,
              factura: facturas[i],
              error: data.error || resp.statusText,
            };
      } catch (err) {
        entry = { ok: false, factura: facturas[i], error: err.message };
      }
      res.push(entry);
      const errores = res.filter((r) => !r.ok).length;
      setProgreso({ actual: i + 1, total: facturas.length, errores });
      setResultados([...res]);
    }
  }

  const facturasParsed = filas.map(rowToFactura).filter(Boolean);
  const omitidas = filas.length - facturasParsed.length;
  const terminado = progreso && progreso.actual === progreso.total;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Importar Facturas</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="block"
      />

      {filas.length > 0 && (
        <p className="text-sm text-gray-700">
          {facturasParsed.length} factura
          {facturasParsed.length !== 1 ? "s" : ""} para importar
          {omitidas > 0 &&
            `, ${omitidas} fila${omitidas !== 1 ? "s" : ""} omitida${omitidas !== 1 ? "s" : ""} (tipo no reconocido)`}
        </p>
      )}

      {facturasParsed.length > 0 && !progreso && (
        <button
          onClick={importar}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Importar
        </button>
      )}

      {progreso && (
        <p className="text-sm font-medium">
          {progreso.actual} / {progreso.total} procesadas
          {progreso.errores > 0 &&
            ` — ${progreso.errores} error${progreso.errores !== 1 ? "es" : ""}`}
          {terminado && " — Listo"}
        </p>
      )}

      {resultados.length > 0 && (
        <ul className="text-sm space-y-1 max-h-64 overflow-y-auto border rounded p-2">
          {resultados.map((r, i) => (
            <li key={i} className={r.ok ? "text-green-700" : "text-red-700"}>
              {r.factura.descripcion}
              {" — "}
              {r.ok ? `OK (#${r.id})` : r.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImportadorFacturas;
