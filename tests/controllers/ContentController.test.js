const request = require("supertest");

const { deleteUserByUsername } = require("../../src/models/userModel");
const app = require("../../src/app");
const { deleteContentAll } = require("../../src/models/contentModel");
require("dotenv").config();

const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

describe("Content Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteContentAll();
  });

  const registerAndLogin = async (username, password) => {
    const data = { username, password };
    await request(app).post("/api/v1/register").send(data);
    return await request(app).post("/api/v1/login").send(data);
  };

  const authenticateUser = async () => {
    const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
    const token = login.body.authorization.token;
    return token;
  };

  const createContent = async (token, { link }) => {
    return await request(app)
      .post("/api/v1/contents")
      .set("Cookie", `token=${token}`)
      .set("Authorization", `Bearer ${token}`)
      .field("link", link);
  };

  describe("POST /api/v1/contents", () => {
    it("should be rejected if link field not https", async () => {
      const token = await authenticateUser();

      const contentData = { link: "http://blablabla.com" };

      const res = await createContent(token, contentData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "The link must be a string and a link evidenced by https:// at the beginning"
      );
    }, 60000);
    it("should be rejected if link field not valid url", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://bla" };

      const res = await createContent(token, contentData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe("The link must valid a url");
    }, 60000);

    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

    it("should be able to add content", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      const res = await createContent(token, contentData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Content");
    }, 60000);
  });

  describe("GET /api/v1/contents", () => {
    it("should be able get contents", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      await createContent(token, contentData);

      const res = await request(app).get("/api/v1/contents");

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Get All Contents");
      expect(res.body.data[0].id).toBeDefined();
      expect(res.body.data[0].link).toBeDefined();
      expect(res.body.data[0].created_at).toBeDefined();
      expect(res.body.data[0].updated_at).toBeDefined();
      expect(res.body.data[0].deleted_at).toBeDefined();
    }, 60000);
  });
  describe("GET /api/v1/contents?id=id_content", () => {
    it("should be able get contents by id", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      await createContent(token, contentData);

      const content = await request(app).get("/api/v1/contents");
      const res = await request(app).get(
        `/api/v1/contents?id=${content.body.data[0].id}`
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Get All Contents");
      expect(res.body.data[0].id).toBeDefined();
      expect(res.body.data[0].link).toBeDefined();
      expect(res.body.data[0].created_at).toBeDefined();
      expect(res.body.data[0].updated_at).toBeDefined();
      expect(res.body.data[0].deleted_at).toBeDefined();
    }, 60000);
  });

  describe("PUT /api/v1/contents?id=id_content", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

    it("should be rejected if id params null", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      await createContent(token, contentData);

      const res = await request(app)
        .put(`/api/v1/contents?id=`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ link: "https://blablabla.com" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toBe("Content Not Found");
    }, 60000);

    it("should be rejected if link is not http", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      const content = await createContent(token, contentData);

      const res = await request(app)
        .put(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ link: "http://safljsal" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "The link must be a string and a link evidenced by https:// at the beginning"
      );
    }, 60000);
    it("should be rejected if link is not valid url", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      const content = await createContent(token, contentData);

      const res = await request(app)
        .put(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ link: "https://safljsal" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe("The link must valid a url");
    }, 60000);

    it("should be reject cause content not found", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      await createContent(token, contentData);

      const res = await request(app)
        .put(`/api/v1/contents?id=asdf`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ link: "https://dewii.com" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toBe("Content Not Found");
    }, 60000);

    it("should be able to edit content", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      const content = await createContent(token, contentData);

      const res = await request(app)
        .put(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ link: "https://dewii.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.data[0].link).toBeDefined();
      expect(res.body.data[0].created_at).toBeDefined();
      expect(res.body.data[0].updated_at).toBeDefined();
      expect(res.body.data[0].deleted_at).toBeDefined();
    }, 60000);
  });
  describe("DELETE /api/v1/contents?id=id_content", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

    it("should be rejected if id params null", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      await createContent(token, contentData);

      const res = await request(app)
        .delete(`/api/v1/contents?id=`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toBe("Content Not Found");
    }, 60000);
    it("should be able to delete content", async () => {
      const token = await authenticateUser();

      const contentData = { link: "https://blablabla.com" };

      const content = await createContent(token, contentData);

      const res = await request(app)
        .delete(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${token}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ link: "https://blablabla.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Delete Content");
    }, 60000);
  });
});
