import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import path from "path";

const dbPath =
  process.env.DB_PATH ||
  path.join(path.dirname(fileURLToPath(import.meta.url)), "monotributo.db");

const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS escalas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL UNIQUE,
    ingresos_brutos_anuales_max REAL,
    superficie_afectada_max_m2 REAL,
    energia_electrica_max_kw REAL,
    alquileres_anuales_max REAL,
    precio_unitario_max_venta REAL,
    impuesto_integrado_locaciones REAL,
    impuesto_integrado_venta REAL,
    aportes_sipa REAL,
    aportes_obra_social REAL,
    cuota_total_locaciones REAL,
    cuota_total_venta REAL,
    vigencia TEXT,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('C', 'E')),
    fecha DATE NOT NULL,
    cuit TEXT NOT NULL,
    destinatario TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto REAL NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    modo TEXT NOT NULL CHECK(modo IN ('anual', 'semestral')) DEFAULT 'anual'
  );
`);

db.prepare(`INSERT OR IGNORE INTO config (id, modo) VALUES (1, 'anual')`).run();

const stmtUpsertEscala = db.prepare(`
  INSERT INTO escalas (
    categoria, ingresos_brutos_anuales_max, superficie_afectada_max_m2,
    energia_electrica_max_kw, alquileres_anuales_max, precio_unitario_max_venta,
    impuesto_integrado_locaciones, impuesto_integrado_venta,
    aportes_sipa, aportes_obra_social, cuota_total_locaciones, cuota_total_venta,
    vigencia, actualizado_en
  ) VALUES (
    :categoria, :ingresos_brutos_anuales_max, :superficie_afectada_max_m2,
    :energia_electrica_max_kw, :alquileres_anuales_max, :precio_unitario_max_venta,
    :impuesto_integrado_locaciones, :impuesto_integrado_venta,
    :aportes_sipa, :aportes_obra_social, :cuota_total_locaciones, :cuota_total_venta,
    :vigencia, CURRENT_TIMESTAMP
  )
  ON CONFLICT(categoria) DO UPDATE SET
    ingresos_brutos_anuales_max    = excluded.ingresos_brutos_anuales_max,
    superficie_afectada_max_m2     = excluded.superficie_afectada_max_m2,
    energia_electrica_max_kw       = excluded.energia_electrica_max_kw,
    alquileres_anuales_max         = excluded.alquileres_anuales_max,
    precio_unitario_max_venta      = excluded.precio_unitario_max_venta,
    impuesto_integrado_locaciones  = excluded.impuesto_integrado_locaciones,
    impuesto_integrado_venta       = excluded.impuesto_integrado_venta,
    aportes_sipa                   = excluded.aportes_sipa,
    aportes_obra_social            = excluded.aportes_obra_social,
    cuota_total_locaciones         = excluded.cuota_total_locaciones,
    cuota_total_venta              = excluded.cuota_total_venta,
    vigencia                       = excluded.vigencia,
    actualizado_en                 = CURRENT_TIMESTAMP
`);

export function upsertEscalas(vigencia, categorias) {
  db.exec("BEGIN");
  try {
    for (const cat of categorias) {
      stmtUpsertEscala.run({
        categoria: cat.categoria,
        ingresos_brutos_anuales_max: cat.ingresos_brutos_anuales_max,
        superficie_afectada_max_m2: cat.superficie_afectada_max_m2,
        energia_electrica_max_kw: cat.energia_electrica_max_kw,
        alquileres_anuales_max: cat.alquileres_anuales_max,
        precio_unitario_max_venta: cat.precio_unitario_max_venta,
        impuesto_integrado_locaciones:
          cat.impuesto_integrado?.locaciones_y_servicios ?? null,
        impuesto_integrado_venta:
          cat.impuesto_integrado?.venta_cosas_muebles ?? null,
        aportes_sipa: cat.aportes_sipa,
        aportes_obra_social: cat.aportes_obra_social,
        cuota_total_locaciones: cat.cuota_total?.locaciones_y_servicios ?? null,
        cuota_total_venta: cat.cuota_total?.venta_cosas_muebles ?? null,
        vigencia,
      });
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function getEscalas() {
  return db
    .prepare(
      `SELECT
        categoria                AS categoria,
        ingresos_brutos_anuales_max,
        cuota_total_locaciones   AS cuota_total_locaciones_y_servicios
       FROM escalas
       ORDER BY categoria`
    )
    .all();
}

export function insertFactura(tipo, fecha,cuit, destinatario, descripcion, monto) {
  return db
    .prepare(
      `INSERT INTO facturas (tipo, fecha,cuit, destinatario, descripcion, monto)
       VALUES (?, ?, ?,?,?, ?)`
    )
    .run(tipo, fecha, cuit, destinatario, descripcion, monto);
}

export function getFacturas(desde, hasta) {
  return db
    .prepare(
      `SELECT id, tipo, fecha, destinatario, monto, creado_en
       FROM facturas
       WHERE fecha >= ? AND fecha <= ?
       ORDER BY fecha`
    )
    .all(desde, hasta);
}

export function updateFactura(id, tipo, fecha, cuit, destinatario, descripcion, monto) {
  return db
    .prepare(
      `UPDATE facturas
       SET tipo = ?, fecha = ?, cuit = ?, destinatario = ?, descripcion = ?, monto = ?
       WHERE id = ?`
    )
    .run(tipo, fecha, cuit, destinatario, descripcion, monto, id);
}

export function deleteFactura(id) {
  return db.prepare(`DELETE FROM facturas WHERE id = ?`).run(id);
}

export function getConfig() {
  return db.prepare(`SELECT modo FROM config WHERE id = 1`).get();
}

export function setConfig(modo) {
  return db.prepare(`UPDATE config SET modo = ? WHERE id = 1`).run(modo);
}
