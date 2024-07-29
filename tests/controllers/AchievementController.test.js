const request = require("supertest");
const { deleteUserByUsername } = require("../../src/models/userModel");
const path = require("path");
const app = require("../../src/app");
require("dotenv").config();
const fs = require("fs");
const { deleteAchievementAll } = require("../../src/models/achievementsModel");

const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

describe("Achievement Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
  });

  const registerAndLogin = async (username, password) => {
    const data = { username, password };
    await request(app).post("/api/v1/register").send(data);
    return await request(app).post("/api/v1/login").send(data);
  };

  const createAchievement = async (token, achievementData) => {
    const { name, year, logo } = achievementData;
    return await request(app)
      .post("/api/v1/achievements")
      .set("Cookie", `token=${token}`)
      .set("Authorization", `Bearer ${token}`)
      .field("name", name)
      .field("year", year)
      .attach("logo", logo);
  };

  const fileExists = (filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
  };

  describe("POST /api/v1/achievements", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/achievements");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

    it("should be rejected if name is not provided", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = { name: "", year: "2021", logo: filePathLogo };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      console.log(res.body);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) => error.msg === "Achievement name is required"
        )
      ).toBeTruthy();
    }, 60000);

    it("should be rejected if name is longer than 255 characters", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "a".repeat(256),
        year: "2021",
        logo: filePathLogo,
      };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "Achievement name must be no more than 255 characters"
      );
    }, 60000);

    it("should be rejected if year is more than 4 characters", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "tes achievement",
        logo: filePathLogo,
        year: "20211",
      };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        "Achievement year must be no more than 4 characters"
      );
    }, 60000);

    it("should be rejected if year is not provided", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = { name: "2021", logo: filePathLogo, year: "" };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) => error.msg === "Achievement year is required"
        )
      ).toBeTruthy();
    }, 60000);

    it("should be rejected if logo is not provided", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);

      const achievementData = { name: "Achievement", year: "2021" };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Achievement logo are required");
    }, 60000);

    it("should be rejected if logo is not webp", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test.jpg");
      fileExists(filePathLogo);

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Achievement logo must be in WEBP format");
    }, 60000);

    it("should be rejected if logo is larger than 500kb", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../tes-large.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Achievement logo size is too big, please upload a file smaller than 500 KB"
      );
    }, 60000);

    it("should be able to add achievement", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };
      const res = await createAchievement(
        login.body.authorization.token,
        achievementData
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe("Successfully Add New Achievement");
    }, 60000);
  });

  describe("GET /api/v1/acchievements", () => {
    it("Should get all achievements", async () => {
      const res = await request(app).get("/api/v1/achievements");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get All Achievements");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].logo).toBeDefined();
      expect(res.body.data[0].name).toBeDefined();
      expect(res.body.data[0].year).toBeDefined();
      expect(res.body.data[0].created_at).toBeDefined();
    }, 60000);

    it("Should return 500 if error", async () => {
      await deleteAchievementAll();
      const res = await request(app).get("/api/v1/achievements");
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toEqual(
        "Failed to Get All Achievements: No data found"
      );
    }, 60000);
  });

  describe("GET /api/v1/achievements?id=id_achievement", () => {
    it("Should get achievement by id", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };
      const achievement = await createAchievement(
        login.body.authorization.token,
        achievementData
      );
      const res = await request(app).get(
        `/api/v1/achievements?id=${achievement.body.data.id}`
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get Achievement");
      expect(res.body.data.logo).toBeDefined();
      expect(res.body.data.name).toBeDefined();
      expect(res.body.data.year).toBeDefined();
      expect(res.body.data.created_at).toBeDefined();
    }, 60000);

    it("Should return 404 if achievement not found", async () => {
      const res = await request(app).get("/api/v1/achievements?id=100");
      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toEqual("Achievement not found");
    }, 60000);
  });

  describe("PUT /api/v1/achievements?id=id_achievement", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).put("/api/v1/achievements?id=1");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

    it("Should edit achievement by id", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };
      const achievement = await createAchievement(
        login.body.authorization.token,
        achievementData
      );
      const id = achievement.body.data.id;
      const newFilePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(newFilePathLogo);

      const updatedAchievementData = {
        name: "Updated Achievement",
        year: "2022",
        logo: newFilePathLogo,
      };
      const res = await request(app)
        .put(`/api/v1/achievements?id=${id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", updatedAchievementData.name)
        .field("year", updatedAchievementData.year)
        .attach("logo", updatedAchievementData.logo);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Update Achievement");
    }, 60000);

    it("Should return 404 if achievement not found", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const newFilePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(newFilePathLogo);

      const updatedAchievementData = {
        name: "Updated Achievement",
        year: "2022",
        logo: newFilePathLogo,
      };
      const res = await request(app)
        .put("/api/v1/achievements?id=1")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .field("name", updatedAchievementData.name)
        .field("year", updatedAchievementData.year)
        .attach("logo", updatedAchievementData.logo);

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toEqual("Achievement not found");
    }, 60000);
  });

  describe("DELETE /api/v1/achievements?id=id_achievement", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).delete("/api/v1/achievements?id=1");
      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

    it("Should delete achievement by id", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const filePathLogo = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathLogo);

      const achievementData = {
        name: "Achievement",
        logo: filePathLogo,
        year: "2021",
      };
      const achievement = await createAchievement(
        login.body.authorization.token,
        achievementData
      );
      const id = achievement.body.data.id;
      const res = await request(app)
        .delete(`/api/v1/achievements?id=${id}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Delete Achievement");
    }, 60000);

    it("Should return 404 if achievement not found", async () => {
      const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
      const res = await request(app)
        .delete("/api/v1/achievements?id=1")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toEqual("Achievement not found");
    }, 60000);
  });
});
