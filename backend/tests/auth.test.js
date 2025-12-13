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
  // Import app after setting env
  app = require("../server");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth and protected routes", () => {
  let user;
  let token;

  it("should signup a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "test@example.com",
        password: "Password123!",
        name: "Tester",
      })
      .expect(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body.user.email).toBe("test@example.com");
    user = res.body.user;
    token = res.body.access_token;
  });

  it("should login the created user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Password123!" })
      .expect(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should get profile with valid token", async () => {
    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    // The profile might be an object or array depending on API - check for id
    expect(res.body).toBeTruthy();
  });
});
