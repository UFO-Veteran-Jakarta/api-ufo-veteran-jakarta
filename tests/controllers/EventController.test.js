const { deleteUserByUsername } = require("src/models/userModel");
const request = require("supertest");
const app = require("src/app");
const path = require("path");
const fs = require("fs");

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
        .send({ link: "httpsablabla.com" });

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
      const filePath = path.resolve(__dirname, "../test-small.webp");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const res = await request(app)
        .post("/api/v1/events")
        .attach("cover", undefined)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Cover and Cover Landscape Requirements");
    });

    it("should be rejected if cover and cover landscape is not webp", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test.jpg");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePath)
        .attach("cover_landscape", filePath);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Cover/Cover Landscape must be in WEBP Format"
      );
    });

    it("should be rejected if cover is not 1080px x 1080px", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test-small.webp");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePath)
        .attach("cover_landscape", filePath);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Cover must in 1080px x 1080px in size");
    });
    it("should be rejected if cover landscape not 2000px x 1047px", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(__dirname, "../test-small.webp");

      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Cover Landscape must in 2000px x 1047px in size"
      );
    });
    it("should be accept if cover and cover landscape is less than 500kb", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(
        __dirname,
        "../test-cc-2000-1047.webp"
      );
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape);
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("GET /api/v1/events", () => {
    it("should be return all events", async () => {
      const res = await request(app).get("/api/v1/events");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get All Events");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
