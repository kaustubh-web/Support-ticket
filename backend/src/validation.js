import { z } from "zod";
import { PRIORITIES, STATUSES } from "./models/Ticket.js";

export const PAGE_SIZE = 10;

export const createTicketSchema = z.object({
  title: z.string({ required_error: "Title is required" }).trim().min(1, "Title is required").max(120, "Title must be 120 characters or fewer"),
  description: z.string({ required_error: "Description is required" }).trim().min(1, "Description is required"),
  customerEmail: z.string({ required_error: "Customer email is required" }).trim().email("Enter a valid email address"),
  priority: z.enum(PRIORITIES, { errorMap: () => ({ message: "Priority must be Low, Medium or High" }) }),
  status: z.enum(STATUSES).default("Open"),
});

export const updateTicketSchema = z
  .object({ status: z.enum(STATUSES).optional(), priority: z.enum(PRIORITIES).optional() })
  .strict()
  .refine((v) => v.status || v.priority, { message: "Provide status and/or priority" });

export const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
