const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let app;
let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  app = require("../server");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
});
