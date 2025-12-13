const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let app;
let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.GOOGLE_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-secret";
  process.env.GOOGLE_REDIRECT_URI =
    "http://localhost:3000/api/auth/google/callback";

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  app = require("../server");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("OAuth routes", () => {
  it("redirects to Google OAuth URL", async () => {
    const res = await request(app).get("/api/auth/google").expect(302);
    expect(res.headers.location).toMatch(/accounts.google.com/);
  });
});
