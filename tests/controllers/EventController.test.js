const { deleteUserByUsername } = require("src/models/userModel");
const request = require("supertest");
const app = require("src/app");
const path = require("path");

describe("Event Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername("admin");
  });

  describe("POST /api/v1/events", () => {
    it("should be rejected if token not valid", async () => {
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=asfsf`)
        .set("Authorization", `Bearer asdfsadf`)
        .send({ link: "https://blablabla.com" });

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
    });

    it("should be rejected if cover and cover landscape not exist", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test.jpg");
      const res = await request(app)
        .post("/api/v1/events")
        .attach("file", filePath)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      console.log("eweew", res.body);

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual(400);
      expect(res.body.errors[0].msg).toBe(
        "Cover and Cover Landscape Requirements"
      );
    });

    it("should be rejected if cover and cover landscape is not webp", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test.webp");
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("file", filePath);

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual(400);
      expect(res.body.errors[0].msg).toBe(
        "Cover/Cover Landscape must be in WEBP Format"
      );
    });

    it("should be accepted if cover and cover landscape is less than 500kb", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test.webp");
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePath);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
    });
  });
});
