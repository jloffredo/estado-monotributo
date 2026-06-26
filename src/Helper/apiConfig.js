export function apiSetConfig(modo) {
  return fetch("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return [true, undefined];
    })
    .catch((err) => [null, err]);
}

export function apiFetchConfig() {
  return fetch("/api/config")
    .then((res) => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then((data) => [data, undefined])
    .catch((err) => [null, err]);
}
