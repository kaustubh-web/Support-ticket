import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { Ticket } from "../src/models/Ticket.js";
import { buildSeed } from "../src/seed.js";

let mongo;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Ticket.deleteMany({});
  await Ticket.insertMany(buildSeed(), { timestamps: false });
});

describe("POST /api/tickets (validation)", () => {
  it("creates a ticket with default status Open", async () => {
    const res = await request(app).post("/api/tickets").send({
      title: "Broken", description: "It broke", customerEmail: "a@b.co", priority: "High",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("Open");
    expect(res.body.createdAt).toBeDefined();
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await request(app).post("/api/tickets").send({
      title: "x".repeat(121), description: "", customerEmail: "nope", priority: "Urgent",
    });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details)).toEqual(
      expect.arrayContaining(["title", "description", "customerEmail", "priority"])
    );
  });
});

describe("GET /api/tickets (querying)", () => {
  it("paginates 10 per page", async () => {
    const res = await request(app).get("/api/tickets?page=3");
    expect(res.body.items).toHaveLength(10);
    expect(res.body.total).toBe(30);
    expect(res.body.pageCount).toBe(3);
  });

  it("combines search, filters and sort", async () => {
    const res = await request(app).get("/api/tickets?status=Open&q=acme&sort=oldest");
    expect(res.status).toBe(200);
    for (const t of res.body.items) {
      expect(t.status).toBe("Open");
      expect(t.customerEmail).toMatch(/acme/);
    }
    const dates = res.body.items.map((t) => +new Date(t.createdAt));
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it("summary reflects whole dataset", async () => {
    const res = await request(app).get("/api/tickets/summary");
    expect(res.body).toEqual({ total: 30, open: 10, inProgress: 10, resolved: 10 });
  });
});

describe("PATCH /api/tickets/:id (updates)", () => {
  it("updates status and priority and persists", async () => {
    const t = await Ticket.findOne();
    const res = await request(app).patch(`/api/tickets/${t.id}`).send({ status: "Resolved", priority: "Low" });
    expect(res.status).toBe(200);
    const again = await request(app).get(`/api/tickets/${t.id}`);
    expect(again.body).toMatchObject({ status: "Resolved", priority: "Low" });
  });

  it("rejects invalid status and unknown ids", async () => {
    const t = await Ticket.findOne();
    expect((await request(app).patch(`/api/tickets/${t.id}`).send({ status: "Closed" })).status).toBe(400);
    expect((await request(app).patch(`/api/tickets/${new mongoose.Types.ObjectId()}`).send({ status: "Open" })).status).toBe(404);
  });
});
