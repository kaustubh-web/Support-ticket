import mongoose from "mongoose";

export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUSES = ["Open", "In Progress", "Resolved"];

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, match: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ },
    priority: { type: String, enum: PRIORITIES, required: true },
    status: { type: String, enum: STATUSES, default: "Open" },
  },
  { timestamps: true } // createdAt / updatedAt generated automatically
);

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1 });

ticketSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Ticket = mongoose.model("Ticket", ticketSchema);
