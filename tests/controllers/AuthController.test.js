const request = require("supertest");

const {
  getUserByUsername,
  deleteUserByUsername,
  createUser,
} = require("../../src/models/userModel");
const app = require("../../src/app");
const cookie = require("cookie");

describe("Auth Controller", () => {
  describe("POST /api/v1/register", () => {
    it("should be rejected if method http is not POST", async () => {
      const data = {
        password: "Ad@123",
      };
      const res = await request(app).put("/api/v1/register").send(data);

      expect(res.statusCode).toEqual(405);
      expect(res.body.status).toEqual(405);
      expect(res.body.message).toBe("Wrong method");
    });
    it("should be rejected if password length not in requirement", async () => {
      const data = {
        username: "admin",
        password: "Ad@123",
      };
      const res = await request(app).post("/api/v1/register").send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "Password must be between 8 and 64 characters"
      );
    });
    it("should be rejected if password not valid in validate", async () => {
      const data = {
        username: "admin",
        password: "admin@123",
      };
      const res = await request(app).post("/api/v1/register").send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "Password must consist of at least one lowercase, one uppercase, one special character, and one number"
      );
    });
    it("should be rejected if username is exist", async () => {
      await createUser({ username: "admin", password: "Admin@12345" });
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      const res = await request(app).post("/api/v1/register").send(data);
      deleteUserByUsername("admin");
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Username already taken");
    });
    // // it("should be rejected if registration fails", async () => {
    // //   const data = {
    // //     username: "admin",
    // //     password: "Admin@12345678",
    // //   };
    // //   const res = await request(app).post("/api/v1/register").send(data);

    // //   expect(res.statusCode).toEqual(500);
    // //   expect(res.body.status).toEqual(500);
    // //   expect(res.body.message).toBe("Failed to register new user!");
    // // });
    it("should be able to register", async () => {
      await deleteUserByUsername("adam");
      const data = {
        username: "adam",
        password: "Admin@12345",
      };
      const res = await request(app).post("/api/v1/register").send(data);
      const result = await getUserByUsername("adam");
      await deleteUserByUsername("adam");
      expect(result?.[0]?.username).toBe("adam");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully registered new user!");
    });
  });

  describe("POST /api/v1/login", () => {
    it("should be rejected if method http is not POST", async () => {
      const data = {
        username: "admin",
        password: "Ad@123",
      };
      const res = await request(app).put("/api/v1/login").send(data);

      expect(res.statusCode).toEqual(405);
      expect(res.body.status).toEqual(405);
      expect(res.body.message).toBe("Wrong method");
    });
    it("should be rejected if username not string", async () => {
      const data = {
        username: 123213,
        password: "Ad@123",
      };
      const res = await request(app).post("/api/v1/login").send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "The username and password must be strings"
      );
    });
    it("should be rejected if password not string", async () => {
      const data = {
        username: "admin",
        password: 12321,
      };
      const res = await request(app).post("/api/v1/login").send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "The username and password must be strings"
      );
    });
    it("should be rejected if login fails or username/password wrong", async () => {
      await deleteUserByUsername("adam");
      const data = {
        username: "adam",
        password: "Admin@123",
      };
      await request(app)
        .post("/api/v1/register")
        .send({ username: "adam", password: "Adsalf@24324" });

      const res = await request(app).post("/api/v1/login").send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Failed to login!");
    });
    it("should be able to login", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345678",
      };
      await request(app)
        .post("/api/v1/register")
        .send({ username: "admin", password: "Admin@12345678" });
      const res = await request(app).post("/api/v1/login").send(data);
      await deleteUserByUsername("admin");

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Successfully logged in!");
      expect(res.body.status).toEqual(200);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.username).toBeDefined();
      expect(res.body.authorization.token).toBeDefined();
      expect(res.body.authorization.type).toBeDefined();
    });
    it("should be exist cookie token", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345678",
      };
      await request(app)
        .post("/api/v1/register")
        .send({ username: "admin", password: "Admin@12345678" });
      const res = await request(app).post("/api/v1/login").send(data);
      await deleteUserByUsername("admin");
      expect(cookie.parse(res.headers["set-cookie"][0]).token).toBeDefined();
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Successfully logged in!");
      expect(res.body.status).toEqual(200);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.username).toBeDefined();
      expect(res.body.authorization.token).toBeDefined();
      expect(res.body.authorization.type).toBeDefined();
    });
  });

  describe("DELETE /api/v1/logout", () => {
    it("should be rejected if token invalid", async () => {
      const res = await request(app)
        .delete("/api/v1/logout")
        .set("Authorization", `bearer 3242432343`);

      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });
    it("should be able to logout", async () => {
      await deleteUserByUsername("admin");
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const res = await request(app)
        .delete("/api/v1/logout")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `bearer ${login.body.authorization.token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Success Logout!");
      expect(cookie.parse(res.headers["set-cookie"][0]).token).toBe("");
    });
  });
});
