/**
 * Scraper de escalas vigentes del Monotributo (ARCA/AFIP)
 * Fuente: https://www.afip.gob.ar/monotributo/categorias.asp
 *
 * Dependencias: npm install node-fetch cheerio
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";

const URL_CATEGORIAS = "https://www.afip.gob.ar/monotributo/categorias.asp";

/**
 * Convierte un string de pesos argentinos a número.
 * Ejemplo: "$10.277.988,13" → 10277988.13
 */
function parsePesos(str) {
  if (!str || str.trim() === "" || str.trim() === "-") return null;
  return parseFloat(
    str.replace(/\$/g, "").replace(/\./g, "").replace(",", ".").trim(),
  );
}

/**
 * Convierte un string de superficie o energía a número.
 * Ejemplo: "Hasta 30 m2" → 30 | "Hasta 3330 Kw" → 3330
 */
function parseHasta(str) {
  if (!str) return null;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0].replace(/\./g, "")) : null;
}

async function obtenerCategoriasMonotributo() {
  const response = await fetch(URL_CATEGORIAS);
  if (!response.ok) {
    throw new Error(`Error al obtener la página: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extraer período de vigencia del h3/h4 que lo menciona
  let vigencia = null;
  $("h3, h4, p, strong").each((_, el) => {
    const texto = $(el).text().trim();
    if (texto.toLowerCase().includes("aplicación desde")) {
      vigencia = texto.replace(/\*/g, "").trim();
      return false; // break
    }
  });

  // La tabla principal tiene las categorías
  const tabla = $("table").first();
  const filas = tabla.find("tr");

  const categorias = [];

  filas.each((i, fila) => {
    const celdas = $(fila).find("td, th");
    if (celdas.length < 10) return; // saltar encabezados y filas vacías

    const letra = $(celdas[0]).text().trim();
    if (!letra || !/^[A-K]$/.test(letra)) return; // saltar si no es una categoría válida

    categorias.push({
      categoria: letra,
      ingresos_brutos_anuales_max: parsePesos($(celdas[1]).text()),
      superficie_afectada_max_m2: parseHasta($(celdas[2]).text()),
      energia_electrica_max_kw: parseHasta($(celdas[3]).text()),
      alquileres_anuales_max: parsePesos($(celdas[4]).text()),
      precio_unitario_max_venta: parsePesos($(celdas[5]).text()),
      impuesto_integrado: {
        locaciones_y_servicios: parsePesos($(celdas[6]).text()),
        venta_cosas_muebles: parsePesos($(celdas[7]).text()),
      },
      aportes_sipa: parsePesos($(celdas[8]).text()),
      aportes_obra_social: parsePesos($(celdas[9]).text()),
      cuota_total: {
        locaciones_y_servicios: parsePesos($(celdas[10]).text()),
        venta_cosas_muebles: parsePesos($(celdas[11]).text()),
      },
    });
  });

  return { vigencia, categorias };
}

export { obtenerCategoriasMonotributo };
