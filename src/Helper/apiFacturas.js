export function apiFetchFacturas() {
  const today = new Date();

  return fetch(`/api/facturas?modo=semestral&anio=${today.getFullYear()}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      return [data.facturas, undefined];
    })
    .catch((err) => {
      return [null, err];
    });
}
