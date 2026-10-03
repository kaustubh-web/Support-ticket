import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { PRIORITIES, STATUSES } from "../constants.js";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";
import CreateTicketForm from "../components/CreateTicketForm.jsx";

export default function TicketList() {
  const [params, setParams] = useSearchParams();
  const query = Object.fromEntries(params);
  const [q, setQ] = useState(query.q || "");
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reload, setReload] = useState(0);

  const update = (patch) => {
    const next = { ...query, page: undefined, ...patch };
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)));
  };

  useEffect(() => {
    const t = setTimeout(() => (query.q || "") !== q && update({ q }), 300);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.list(query)
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((e) => alive && setState({ loading: false, error: e.message, data: null }));
    return () => { alive = false; };
  }, [params.toString(), reload]); // eslint-disable-line

  useEffect(() => { api.summary().then(setSummary).catch(() => setSummary(null)); }, [reload]);

  const page = Number(query.page || 1);
  const { data } = state;
  const filtered = query.q || query.status || query.priority;

  return (
    <main className="wrap">
      <header className="row between">
        <div><p className="eyebrow">Support desk</p><h1>Tickets</h1></div>
        <button className="accent" onClick={() => setShowForm((v) => !v)}>+ New ticket</button>
      </header>

      {showForm && <CreateTicketForm onCancel={() => setShowForm(false)} onCreated={() => { setShowForm(false); setReload((n) => n + 1); }} />}

      <section className="stats">
        {[["Total", summary?.total], ["Open", summary?.open], ["In Progress", summary?.inProgress], ["Resolved", summary?.resolved]].map(([l, v]) => (
          <div key={l}><span>{l}</span><strong>{v ?? "…"}</strong></div>
        ))}
      </section>

      <section className="filters">
        <input placeholder="Search title or customer email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={query.status || ""} onChange={(e) => update({ status: e.target.value })}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={query.priority || ""} onChange={(e) => update({ priority: e.target.value })}>
          <option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={query.sort || "newest"} onChange={(e) => update({ sort: e.target.value === "newest" ? "" : e.target.value })}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
        </select>
      </section>

      <section className="card list">
        {state.loading && !data ? <p className="muted pad">Loading tickets…</p>
          : state.error ? <div className="pad center"><p>Couldn't load tickets: {state.error}</p><button onClick={() => setReload((n) => n + 1)}>Retry</button></div>
          : data.items.length === 0 ? <div className="pad center"><p>{filtered ? "No tickets match these filters." : "No tickets yet."}</p>{filtered && <button className="ghost" onClick={() => { setQ(""); setParams({}); }}>Clear filters</button>}</div>
          : (
            <ul style={{ opacity: state.loading ? 0.6 : 1 }}>
              {data.items.map((t) => (
                <li key={t.id}>
                  <Link to={`/tickets/${t.id}`}>
                    <div className="grow"><strong>{t.title}</strong><span className="muted">{t.customerEmail}</span></div>
                    <PriorityBadge priority={t.priority} /><StatusBadge status={t.status} />
                    <time className="muted mono">{new Date(t.createdAt).toLocaleDateString()}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </section>

      {data && data.total > 0 && (
        <nav className="row between pager">
          <span className="muted">{data.total} tickets · page {page} of {data.pageCount}</span>
          <div className="row">
            <button className="ghost" disabled={page <= 1} onClick={() => update({ page: page - 1 > 1 ? String(page - 1) : "" })}>‹ Prev</button>
            <button className="ghost" disabled={page >= data.pageCount} onClick={() => update({ page: String(page + 1) })}>Next ›</button>
          </div>
        </nav>
      )}
    </main>
  );
}
