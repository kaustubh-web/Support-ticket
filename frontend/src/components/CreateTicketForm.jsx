import { useState } from "react";
import { api } from "../api.js";
import { PRIORITIES, validateTicket } from "../constants.js";

const empty = { title: "", description: "", customerEmail: "", priority: "Medium" };

export default function CreateTicketForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const errs = validateTicket(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await api.create(form);
      setForm(empty);
      onCreated();
    } catch (err) {
      setErrors(err.details || { form: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h2>New ticket</h2>
      <label>Title <small>{form.title.length}/120</small><input value={form.title} onChange={set("title")} /></label>
      {errors.title && <p className="err">{errors.title}</p>}
      <label>Customer email<input type="email" value={form.customerEmail} onChange={set("customerEmail")} /></label>
      {errors.customerEmail && <p className="err">{errors.customerEmail}</p>}
      <label>Priority
        <select value={form.priority} onChange={set("priority")}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
      </label>
      {errors.priority && <p className="err">{errors.priority}</p>}
      <label>Description<textarea rows={5} value={form.description} onChange={set("description")} /></label>
      {errors.description && <p className="err">{errors.description}</p>}
      {errors.form && <p className="err">{errors.form}</p>}
      <div className="row end">
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        <button disabled={saving}>{saving ? "Creating…" : "Create ticket"}</button>
      </div>
    </form>
  );
}
