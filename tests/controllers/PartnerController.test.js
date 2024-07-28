const { deleteUserByUsername } = require("src/models/userModel");
const request = require("supertest");
const app = require("src/app");
const path = require("path");
require("dotenv").config();

const registerAndLogin = async (userData) => {
  await request(app).post("/api/v1/register").send(userData);
  const loginResponse = await request(app).post("/api/v1/login").send(userData);
  return loginResponse.body.authorization.token;
};

const makeRequest = (method, token, endpoint, data = {}, logoPath) => {
  let req = request(app)
    [method](endpoint)
    .set("Cookie", `token=${token}`)
    .set("Authorization", `Bearer ${token}`);

  if (method === "post" || method === "put") {
    if (logoPath) {
      req = req.field("name", data.name).attach("logo", logoPath);
    } else {
      req = req.send(data);
    }
  }

  return req;
};

const postPartner = (token, logoPath, partnerData = { name: "Default Name" }) =>
  makeRequest("post", token, "/api/v1/partners", partnerData, logoPath);

const getPartnerById = (token, id) =>
  makeRequest("get", token, `/api/v1/partners/?id=${id}`);

const updatePartner = (token, id, updateData) =>
  makeRequest("put", token, `/api/v1/partners?id=${id}`, updateData);

const deletePartner = (token, id) =>
  makeRequest("delete", token, `/api/v1/partners?id=${id}`);

describe("Partner Controller", () => {
  let data;
  let token;

  beforeEach(async () => {
    await deleteUserByUsername(process.env.TEST_USERNAME);
    data = {
      username: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
    };
    token = await registerAndLogin(data);
  });

  describe("POST /api/v1/partner", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/partners");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("logo should be provided", async () => {
      const res = await postPartner(token);
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Partner logo are required");
    });

    it("logo should be webp", async () => {
      const filePathLogo = path.resolve(__dirname, "../test.jpg");
      const res = await postPartner(token, filePathLogo, {
        name: "Test Partner",
      });
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Partner logo must be in WEBP format");
    });

    it("should be accept if logo partner is less than 500kb", async () => {
      const filePathLogo = path.resolve(__dirname, "../tes-large.webp");
      const res = await postPartner(token, filePathLogo, {
        name: "Test Partner",
      });
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Partner logo size is too big, please upload a file smaller than 500 KB"
      );
    }, 60000);

    it("should be upload partner logo", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const res = await postPartner(token, filePathLogo, partnerData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Partner");
    });
  });

  describe("GET /api/v1/partners", () => {
    it("should return all partners", async () => {
      const res = await request(app).get("/api/v1/partners");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Get All Partners");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/partners/?id=id_partner", () => {
    it("should return partner by id", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const partnerResponse = await postPartner(
        token,
        filePathLogo,
        partnerData
      );

      const res = await getPartnerById(token, partnerResponse.body.data.id);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get Partner");
      expect(res.body.data).toBeDefined();
      expect(res.body.data.slug).toBe(partnerResponse.body.data.slug);
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
      const updateData = { name: "Tes update partner" };
      const res = await updatePartner(token, "123123", updateData);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Partner not found");
    });

    it("should update partner", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const partnerResponse = await postPartner(
        token,
        filePathLogo,
        partnerData
      );

      const updateData = { name: "Tes update partner" };
      const res = await updatePartner(
        token,
        partnerResponse.body.data.id,
        updateData
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Update Partner");
    });
  });

  describe("DELETE /api/v1/partners?id=id_partner", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/partners");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("should return 404 if partner not found", async () => {
      const res = await deletePartner(token, "123123");
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Partner not found");
    });

    it("should delete partner", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const partnerResponse = await postPartner(
        token,
        filePathLogo,
        partnerData
      );

      const res = await deletePartner(token, partnerResponse.body.data.id);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Delete Partner");
    });
  });
});
