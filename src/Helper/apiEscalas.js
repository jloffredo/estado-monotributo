export function apiFetchEscalas() {
  return fetch("/api/escalas")
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      return [data, null];
    })
    .catch((err) => {
      return [null, err.message];
    });
}
