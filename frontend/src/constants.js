export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUSES = ["Open", "In Progress", "Resolved"];

/** Client-side validation mirroring the server rules. */
export function validateTicket(t) {
  const e = {};
  if (!t.title.trim()) e.title = "Title is required";
  else if (t.title.trim().length > 120) e.title = "Title must be 120 characters or fewer";
  if (!t.description.trim()) e.description = "Description is required";
  if (!t.customerEmail.trim()) e.customerEmail = "Customer email is required";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.customerEmail.trim())) e.customerEmail = "Enter a valid email address";
  if (!PRIORITIES.includes(t.priority)) e.priority = "Choose a priority";
  return e;
}
