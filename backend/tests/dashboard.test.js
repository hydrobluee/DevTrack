const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let app;
let mongoServer;

// Increase Jest timeout for slower CI / mongodb-memory-server startups
jest.setTimeout(30000);

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  app = require("../server");
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer && typeof mongoServer.stop === 'function') await mongoServer.stop();
});

describe("Dashboard endpoints", () => {
  let user;
  let token;

  it("signs up and prepares token", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "dash@example.com",
        password: "Password123!",
        name: "Dash",
      })
      .expect(200);
    user = res.body.user;
    token = res.body.access_token;
  });

  it("should upsert contest ranking info", async () => {
    const data = { rating: 1500, contests: [] };
    const res = await request(app)
      .post(`/api/dashboard/${user.id}/contest-ranking`)
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(200);
    expect(res.body).toBeTruthy();
  });

  it("should upsert total questions", async () => {
    const data = { total: 10, breakdown: {} };
    const res = await request(app)
      .post(`/api/dashboard/${user.id}/total-questions`)
      .set("Authorization", `Bearer ${token}`)
      .send(data)
      .expect(200);
    expect(res.body).toBeTruthy();
  });

  it("should fetch combined dashboard", async () => {
    const res = await request(app)
      .get(`/api/dashboard/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty("contest_ranking_info");
    expect(res.body).toHaveProperty("total_questions");
  });

  it("should not overwrite existing totals when nulls are upserted", async () => {
    // initial upsert with some totals
    const initial = { leetcode_total: 12, leetcode_easy: 8, codeforces_total: 5 };
    await request(app)
      .post(`/api/dashboard/${user.id}/total-questions`)
      .set("Authorization", `Bearer ${token}`)
      .send(initial)
      .expect(200);

    // now send a payload with nulls (should NOT overwrite existing non-null values)
    const nullPayload = { leetcode_total: null, codeforces_total: null, codechef_total: null };
    await request(app)
      .post(`/api/dashboard/${user.id}/total-questions`)
      .set("Authorization", `Bearer ${token}`)
      .send(nullPayload)
      .expect(200);

    // fetch dashboard and assert values are preserved
    let res = await request(app)
      .get(`/api/dashboard/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    let totals = res.body.total_questions;
    let doc = Array.isArray(totals) ? totals[0] : totals;
    let q = doc.questionsData || doc;
    expect(q.leetcode_total).toBe(12);
    expect(q.leetcode_easy).toBe(8);
    expect(q.codeforces_total).toBe(5);

    // Now upsert numeric values and ensure they are saved
    const numericUpsert = { leetcode_total: 20, leetcode_easy: 12, leetcode_medium: 6, codechef_total: 7 };
    await request(app)
      .post(`/api/dashboard/${user.id}/total-questions`)
      .set("Authorization", `Bearer ${token}`)
      .send(numericUpsert)
      .expect(200);

    res = await request(app)
      .get(`/api/dashboard/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    totals = res.body.total_questions;
    doc = Array.isArray(totals) ? totals[0] : totals;
    q = doc.questionsData || doc;
    expect(q.leetcode_total).toBe(20);
    expect(q.leetcode_easy).toBe(12);
    expect(q.leetcode_medium).toBe(6);
    expect(q.codechef_total).toBe(7);
  });
});
