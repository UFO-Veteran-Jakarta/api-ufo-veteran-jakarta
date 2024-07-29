const request = require("supertest");

const {
  getUserByUsername,
  deleteUserByUsername,
  createUser,
} = require("../../src/models/userModel");
const app = require("../../src/app");
const cookie = require("cookie");
const { deleteContentAll } = require("../../src/models/contentModel");

describe("Content Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername("admin");
    await deleteContentAll();
  });

  describe("POST /api/v1/contents", () => {
    it("should be rejected if link field not https", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const res = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "http://blablabla.com" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "The link must be a string and a link evidenced by https:// at the beginning"
      );
    }, 60000);
    it("should be rejected if link field not valid url", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const res = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabl" });

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
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const res = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Content");
    }, 60000);
  });
  describe("GET /api/v1/contents", () => {
    it("should be able get contents", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

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
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

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
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app)
        .put(`/api/v1/contents?id=`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toBe("Content Not Found");
    }, 60000);

    it("should be rejected if link is not http", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const content = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://safljsalf.com" });

      const res = await request(app)
        .put(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "http://safljsal" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "The link must be a string and a link evidenced by https:// at the beginning"
      );
    }, 60000);
    it("should be rejected if link is not valid url", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const content = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://safljsalf.com" });

      const res = await request(app)
        .put(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://safljsal" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe("The link must valid a url");
    }, 60000);

    it("should be reject cause content not found", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://safljsalf.com" });

      const res = await request(app)
        .put(`/api/v1/contents?id=asdf`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://dewii.com" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toBe("Content Not Found");
    }, 60000);

    it("should be able to edit content", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const content = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://safljsalf.com" });

      const res = await request(app)
        .put(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
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
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app)
        .delete(`/api/v1/contents?id=`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toBe("Content Not Found");
    }, 60000);
    it("should be able to delete content", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const content = await request(app)
        .post("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app)
        .delete(`/api/v1/contents?id=${content.body.data[0].id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Delete Content");
    }, 60000);
  });
});
