import { Router } from "express";
import { Ticket } from "../models/Ticket.js";
import { ApiError } from "../middleware/error.js";
import { createTicketSchema, escapeRegex, listQuerySchema, PAGE_SIZE, updateTicketSchema } from "../validation.js";

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/tickets?q=&status=&priority=&sort=newest|oldest&page=1
router.get("/", wrap(async (req, res) => {
  const { q, status, priority, sort, page } = listQuerySchema.parse(req.query);
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: rx }, { customerEmail: rx }];
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const [items, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: sort === "oldest" ? 1 : -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE),
    Ticket.countDocuments(filter),
  ]);
  res.json({ items, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
}));

// GET /api/tickets/summary — counts over the entire dataset
router.get("/summary", wrap(async (_req, res) => {
  const rows = await Ticket.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  const by = Object.fromEntries(rows.map((r) => [r._id, r.n]));
  const open = by["Open"] ?? 0, inProgress = by["In Progress"] ?? 0, resolved = by["Resolved"] ?? 0;
  res.json({ total: open + inProgress + resolved, open, inProgress, resolved });
}));

router.get("/:id", wrap(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json(ticket);
}));

router.post("/", wrap(async (req, res) => {
  const data = createTicketSchema.parse(req.body);
  const ticket = await Ticket.create(data);
  res.status(201).json(ticket);
}));

router.patch("/:id", wrap(async (req, res) => {
  const patch = updateTicketSchema.parse(req.body);
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
  if (!ticket) throw new ApiError(404, "Ticket not found");
  res.json(ticket);
}));

export default router;
