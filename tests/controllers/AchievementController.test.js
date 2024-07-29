const request = require("supertest");

const { deleteUserByUsername } = require("../../src/models/userModel");
const path = require("path");
const app = require("../../src/app");
require("dotenv").config();
const fs = require("fs");

describe("Achievement Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername(process.env.TEST_USERNAME);
  });

  describe("POST /api/v1/achievements", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/achievements");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("should be rejected if name is not provided", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test-small.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        year: "2021",
        logo: filePathLogo,
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("year", achievementData.year)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[1].msg).toBe("Achievement name is required");
    });

    it("should be rejected if name is longer than 255 characters", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test-small.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        name: "a".repeat(256),
        year: "2021",
        logo: filePathLogo,
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .field("year", achievementData.year)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "Achievement name must be no more than 255 characters"
      );
    });

    it("should be rejected if year is more than 4 characters", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test-small.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        name: "tes achievement",
        logo: filePathLogo,
        year: "20211",
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .field("year", achievementData.year)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "Achievement year must be no more than 4 characters"
      );
    });
    it("should be rejected if year is not provided", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test-small.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        name: "2021",
        logo: filePathLogo,
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[1].msg).toBe("Achievement year is required");
    });

    it("should be rejected if logo is not provided", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const achievementData = {
        name: "Achievement",
        year: "2021",
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .field("year", achievementData.year);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Achievement logo are required");
    });

    it("should be rejected if logo is not webp", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test.jpg");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .field("year", achievementData.year)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Achievement logo must be in WEBP format");
    });

    it("should be rejected if logo is larger than 500kb", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../tes-large.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .field("year", achievementData.year)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Achievement logo size is too big, please upload a file smaller than 500 KB"
      );
    });

    it("should be able to add achievement", async () => {
      const data = {
        username: "admin",
        password: "Admin@123456",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test-small.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };

      const res = await request(app)
        .post("/api/v1/achievements")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", achievementData.name)
        .field("year", achievementData.year)
        .attach("logo", achievementData.logo);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Achievement");
    }, 60000);
  });
});