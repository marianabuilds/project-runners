export async function api(body: Record<string, unknown>) {
  const res = await fetch("/api/mutate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("No se pudo guardar");
  return res.json();
}
