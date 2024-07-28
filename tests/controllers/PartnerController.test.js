const { deleteUserByUsername } = require("src/models/userModel");
const request = require("supertest");
const app = require("src/app");
const path = require("path");
const fs = require("fs");

describe("Partner Controller", () => {
  let data;
  let login;

  const registerAndLogin = async () => {
    await request(app).post("/api/v1/register").send(data);
    login = await request(app).post("/api/v1/login").send(data);
  };

  const postPartners = async (logoPath) => {
    if (logoPath && !fs.existsSync(logoPath)) {
      throw new Error(`File does not exist: ${logoPath}`);
    }

    let req = request(app)
      .post("/api/v1/partners")
      .set("Cookie", `token=${login.body.authorization.token}`)
      .set("Authorization", `Bearer ${login.body.authorization.token}`);

    if (logoPath) {
      req = req.attach("logo", logoPath);
    }

    return await req;
  };

  beforeEach(async () => {
    await deleteUserByUsername("admin");
    data = {
      username: "admin",
      password: "Admin@12345",
    };
    await registerAndLogin();
  });

  describe("POST /api/v1/partner", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/partners");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("logo should be provided", async () => {
      const res = await postPartners();
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Partner logo are required");
    });

    it("logo should be webp", async () => {
      const filePathLogo = path.resolve(__dirname, "../test.jpg");
      const res = await postPartners(filePathLogo);
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Partner logo must be in WEBP format");
    });

    it("should be accept if logo partner is less than 500kb", async () => {
      const filePathLogo = path.resolve(__dirname, "../tes-large.webp");
      const res = await postPartners(filePathLogo);
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Partner logo size is too big, please upload a file smaller than 500 KB"
      );
    }, 60000);

    it("should be upload partner logo", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
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

  describe("GET /api/v1/partners", () => {
    it("should be return all partners", async () => {
      const res = await request(app).get("/api/v1/partners");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Get All Partners");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/partners/?id=id_partner", () => {
    it("should be return partner by id", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = {
        name: "Test Partner",
        logo: filePathLogo,
      };

      const partner = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", partnerData.name)
        .attach("logo", partnerData.logo);

      const res = await request(app).get(
        `/api/v1/partners/?id=${partner.body.data.id}`
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get Partner");
      expect(res.body.data).toBeDefined();
      expect(res.body.data.slug).toBe(partner.body.data.slug);
    });
  });

  describe("PUT /api/v1/partners?id=id_partner", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/partners");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("should return 404 if partner not found", async () => {
      const updateData = {
        name: "Tes update partner",
      };

      const res = await request(app)
        .put(`/api/v1/partners?id=123123`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Partner not found");
    });

    it("should be update partner", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = {
        name: "Test Partner",
        logo: filePathLogo,
      };

      const partner = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", partnerData.name)
        .attach("logo", partnerData.logo);

      const updateData = {
        name: "Tes update partner",
      };

      const res = await request(app)
        .put(`/api/v1/partners?id=${partner.body.data.id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Update Partner");
    });
  });

  describe("DELET /api/v1/partners?id=id_partner", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/partners");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("should return 404 if partner not found", async () => {
      const updateData = {
        name: "Tes update partner",
      };

      const res = await request(app)
        .put(`/api/v1/partners?id=123123`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Partner not found");
    });

    it("should be delete partner", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = {
        name: "Test Partner",
        logo: filePathLogo,
      };

      const partner = await request(app)
        .post("/api/v1/partners")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", partnerData.name)
        .attach("logo", partnerData.logo);

      const res = await request(app)
        .delete(`/api/v1/partners?id=${partner.body.data.id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Delete Partner");
    });
  });
});
