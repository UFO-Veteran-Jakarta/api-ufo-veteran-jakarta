const request = require("supertest");
const app = require("src/app");
const path = require("path");

describe("Partner Middleware", () => {
  let token;

  const authenticateUser = async () => {
    const data = {
      username: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
    };
    await request(app).post("/api/v1/register").send(data);
    const loginResponse = await request(app).post("/api/v1/login").send(data);
    return loginResponse.body.authorization.token;
  };

  beforeAll(async () => {
    token = await authenticateUser();
  });

  const postPartner = (
    token,
    logoPath,
    partnerData = { name: "Default Name" }
  ) => {
    let req = request(app)
      .post("/api/v1/partners")
      .set("Cookie", `token=${token}`)
      .set("Authorization", `Bearer ${token}`);

    if (logoPath) {
      req = req.field("name", partnerData.name).attach("logo", logoPath);
    } else {
      req = req.send(partnerData);
    }

    return req;
  };

  describe("checkFile Middleware", () => {
    it("should return 500 if logo is not provided", async () => {
      const res = await postPartner(token);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toBe("Partner logo are required");
    }, 60000);

    it("should return 500 if logo is not in WEBP format", async () => {
      const filePathLogo = path.resolve(__dirname, "../test.jpg");
      const res = await postPartner(token, filePathLogo);
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toBe("Partner logo must be in WEBP format");
    }, 60000);

    it("should return 500 if logo size exceeds 500KB", async () => {
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

    it("should pass if logo is provided in WEBP format and is less than 500KB", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const res = await postPartner(token, filePathLogo, partnerData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Partner");
    }, 60000);
  });

  describe("checkUpdateFile Middleware", () => {
    const updatePartner = (token, id, updateData, logoPath) => {
      let req = request(app)
        .put(`/api/v1/partners?id=${id}`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`);

      if (logoPath) {
        req = req.field("name", updateData.name).attach("logo", logoPath);
      } else {
        req = req.send(updateData);
      }

      return req;
    };

    const prepareTestPartner = async (token, filePathLogo, partnerData) => {
      const partnerResponse = await postPartner(
        token,
        filePathLogo,
        partnerData
      );
      return partnerResponse.body.data;
    };

    it("should return 500 if new logo is not in WEBP format", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const partner = await prepareTestPartner(
        token,
        filePathLogo,
        partnerData
      );

      const newFilePathLogo = path.resolve(__dirname, "../test.jpg");
      const res = await updatePartner(
        token,
        partner.id,
        { name: "Updated Partner" },
        newFilePathLogo
      );
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toBe("Partner logo must be in WEBP format");
    }, 60000);

    it("should return 500 if new logo size exceeds 500KB", async () => {
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

    it("should pass if new logo is provided in WEBP format and is less than 500KB", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const partner = await prepareTestPartner(
        token,
        filePathLogo,
        partnerData
      );

      const updateData = { name: "Tes update partner" };
      const res = await updatePartner(token, partner.id, updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Update Partner");
    }, 60000);

    it("should pass if logo is not provided during update", async () => {
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      const partnerData = { name: "Test Partner" };
      const partner = await prepareTestPartner(
        token,
        filePathLogo,
        partnerData
      );

      const res = await updatePartner(token, partner.id, {
        name: "Updated Partner",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Successfully Update Partner");
    }, 60000);
  });
});
