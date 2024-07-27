const { deleteUserByUsername } = require("src/models/userModel");
const request = require("supertest");
const app = require("src/app");
const path = require("path");
const fs = require("fs");

describe("Partner Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername("admin");
  });

  describe("POST /api/v1/partner", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/partners");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("logo should be provided", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const res = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Partner logo are required");
    });

    it("logo should be webp", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };

      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePathLogo = path.resolve(__dirname, "../test.jpg");

      const res = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("logo", filePathLogo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Partner logo must be in WEBP format");
    });

    it("should be accept if logo partner is less than 500kb", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../tes-large.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const res = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("logo", filePathLogo);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Partner logo size is too big, please upload a file smaller than 500 KB"
      );
    }, 60000);

    it("should be upload partner logo", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const filePathLogo = path.resolve(__dirname, "../test-small.webp");

      if (!fs.existsSync(filePathLogo)) {
        throw new Error(`File does not exist: ${filePathLogo}`);
      }

      const partnerData = {
        name: "Test Partner",
        logo: filePathLogo,
      };

      const res = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", partnerData.name)
        .attach("logo", partnerData.logo);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Partner");
    });
  });
});
