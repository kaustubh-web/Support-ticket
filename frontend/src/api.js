const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");


export class ApiError extends Error {
  constructor(status, message, details) { super(message); this.status = status; this.details = details; }
}

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, { headers: { "Content-Type": "application/json" }, ...opts });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error?.message || "Request failed", body.error?.details);
  return body;
}

export const api = {
  list: (params) => req("/tickets?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v))),
  summary: () => req("/tickets/summary"),
  get: (id) => req(`/tickets/${id}`),
  create: (data) => req("/tickets", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => req(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};
