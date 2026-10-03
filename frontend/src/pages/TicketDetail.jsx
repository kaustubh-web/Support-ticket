import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { PRIORITIES, STATUSES } from "../constants.js";
import { PriorityBadge, StatusBadge } from "../components/Badges.jsx";

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => { api.get(id).then(setTicket).catch((e) => setError(e)); }, [id]);

  async function change(patch) {
    setSaving(true); setNotice("");
    try { setTicket(await api.update(id, patch)); setNotice("Saved"); }
    catch (e) { setNotice(e.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="wrap narrow">
      <Link to="/" className="back">← All tickets</Link>
      {error ? <div className="card pad center"><p>{error.status === 404 ? "Ticket not found." : error.message}</p></div>
        : !ticket ? <p className="muted">Loading…</p>
        : (
          <article className="card">
            <div className="pad bb">
              <div className="row"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div>
              <h1>{ticket.title}</h1>
              <a href={`mailto:${ticket.customerEmail}`}>{ticket.customerEmail}</a>
            </div>
            <div className="pad bb grid2">
              <label>Status<select disabled={saving} value={ticket.status} onChange={(e) => change({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
              <label>Priority<select disabled={saving} value={ticket.priority} onChange={(e) => change({ priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
              {notice && <p className="muted">{notice}</p>}
            </div>
            <p className="pad bb pre">{ticket.description}</p>
            <dl className="pad grid2 mono muted">
              <div><dt>Created</dt><dd>{new Date(ticket.createdAt).toLocaleString()}</dd></div>
              <div><dt>Updated</dt><dd>{new Date(ticket.updatedAt).toLocaleString()}</dd></div>
            </dl>
          </article>
        )}
    </main>
  );
}
