import "dotenv/config";
import mongoose from "mongoose";
import { Ticket, PRIORITIES, STATUSES } from "./models/Ticket.js";

const subjects = [
  "Cannot log in to dashboard", "Invoice PDF missing logo", "Payment declined twice", "Export to CSV times out",
  "Wrong timezone on reports", "Request: dark mode", "Email notifications delayed", "Account locked",
  "Mobile app crashes on launch", "Duplicate subscription charge", "Search returns no results", "Cannot upload avatar",
  "API rate limit too strict", "Password reset email not received", "Typo on pricing page", "Change billing address",
  "Webhook not firing", "Slow page loads", "Refund request", "2FA codes rejected", "Invite team member fails",
  "Chart colors unclear", "SSO setup help", "Data missing after sync", "Cancel subscription", "Printer labels blank",
  "Language settings reset", "Bulk edit not saving", "Is data encrypted at rest?", "Checkout button unresponsive",
];
const domains = ["acme.com", "globex.com", "initech.com", "umbrella.com", "hooli.com"];

export function buildSeed(now = Date.now()) {
  return subjects.map((title, i) => {
    const createdAt = new Date(now - i * 7 * 3600_000);
    return {
      title,
      description: `Customer reports: ${title.toLowerCase()}. Please investigate and follow up.`,
      customerEmail: `customer${i + 1}@${domains[i % domains.length]}`,
      priority: PRIORITIES[(i * 2) % 3],
      status: STATUSES[i % 3],
      createdAt,
      updatedAt: createdAt,
    };
  });
}

import path from "path";
import { fileURLToPath } from "url";

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/support_tickets");
  await Ticket.deleteMany({});
  await Ticket.insertMany(buildSeed(), { timestamps: false });
  console.log(`Seeded ${subjects.length} tickets`);
  await mongoose.disconnect();
}
