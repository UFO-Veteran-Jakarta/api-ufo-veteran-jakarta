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
  describe("POST /api/v1/contents", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });
    it("should be rejected if link field not https", async () => {
      const res = await request(app)
        .post("/api/v1/contents")
        .send({ link: "http://dslafalsd.com" });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "link must be a string and a link evidenced by https:// at the beginning"
      );
    });

    it("should be able to add content", async () => {
      await deleteUserByUsername("admin");
      await deleteContentAll();
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
    });
  });
  describe("GET /api/v1/contents", () => {
    it("should be able get contents", async () => {
      await deleteUserByUsername("admin");
      await deleteContentAll();
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

      const res = await request(app).get("/api/v1/contents");

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Get All Contents");
      expect(res.body.data[0].id).toBeDefined();
      expect(res.body.data[0].link).toBe(content);
      expect(res.body.data[0].created_at).toBeDefined();
      expect(res.body.data[0].updated_at).toBeDefined();
      expect(res.body.data[0].deleted_at).toBeDefined();
    });
  });
  describe("GET /api/v1/contents?id=id_content", () => {
    it("should be able get contents", async () => {
      await deleteContentAll();
      await deleteUserByUsername("admin");
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      await request(app)
        .delete("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app).get("/api/v1/contents");

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Get All Contents");
      expect(res.body.data[0].id).toBeDefined();
      expect(res.body.data[0].link).toBe("https://blablabla.com");
      expect(res.body.data[0].created_at).toBeDefined();
      expect(res.body.data[0].updated_at).toBeDefined();
      expect(res.body.data[0].deleted_at).toBeDefined();
    });
  });

  describe("PUT /api/v1/contents?id=id_content", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });
    it("should be rejected if link field not https", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "link must be a string and a link evidenced by https:// at the beginning"
      );
    });
    it("should be rejected if id params null", async () => {
      await deleteUserByUsername("admin");
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      const content = await request(app)
        .delete("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app).put(`/api/v1/contents?id=`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Failed to Edit This Content");
    });
    it("should be able to edit content", async () => {
      await deleteContentAll();
      await deleteUserByUsername("admin");
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      const content = await request(app)
        .delete("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app).put(
        `/api/v1/contents?id=${content.body[0].id}`
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Edit This Content");
    });
  });
  describe("DELETE /api/v1/contents?id=id_content", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/contents");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("should be rejected if id params null", async () => {
      await deleteUserByUsername("admin");
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      const content = await request(app)
        .delete("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app).delete(`/api/v1/contents?id=`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Failed to Delete This Content");
    });
    it("should be able to delete content", async () => {
      await deleteUserByUsername("admin");
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);
      const content = await request(app)
        .delete("/api/v1/contents")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send({ link: "https://blablabla.com" });

      const res = await request(app).delete(
        `/api/v1/contents?id=${content.body[0].id}`
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Delete This Content");
    });
  });
});
