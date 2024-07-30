const request = require("supertest");
const { deleteUserByUsername } = require("../../src/models/userModel");
const path = require("path");
const app = require("../../src/app");
require("dotenv").config();
const fs = require("fs");

const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

describe("Work Program Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
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

  const createWorkProgram = async (token, { title, description, image }) => {
    return await request(app)
      .post("/api/v1/work-programs")
      .set("Cookie", [`token=${token}`])
      .set("Authorization", `Bearer ${token}`)
      .field("title", title)
      .field("description", description)
      .attach("image", image);
  };

  const validateErrorResponse = (res, statusCode, status, errorMessage) => {
    expect(res.statusCode).toEqual(statusCode);
    expect(res.body.status).toEqual(status);
    expect(res.body.message).toBeDefined();
    expect(res.body.message).toEqual(errorMessage);
  };

  const validateSuccessResponse = (res, statusCode, status, successMessage) => {
    expect(res.statusCode).toEqual(statusCode);
    expect(res.body.status).toEqual(status);
    expect(res.body.message).toBeDefined();
    expect(res.body.message).toEqual(successMessage);
  };

  const getAllWorkProgramsMessageSuccess = (res) => {
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].title).toBeDefined();
    expect(res.body.data[0].description).toBeDefined();
    expect(res.body.data[0].image).toBeDefined();
    expect(res.body.data[0].created_at).toBeDefined();
  };

  const validateWorkProgram = (res) => {
    expect(res.body.data.title).toBeDefined();
    expect(res.body.data.description).toBeDefined();
    expect(res.body.data.image).toBeDefined();
    expect(res.body.data.created_at).toBeDefined();
  };

  const fileExists = (filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
  };

  describe("POST /api/v1/work-programs", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/achievements");
      validateErrorResponse(res, 401, 401, "Unauthorized");
    }, 60000);

    it("should be rejected if title is not provided", async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathImage);

      const workProgramData = {
        title: "",
        description: "2021",
        image: filePathImage,
      };
      const res = await createWorkProgram(token, workProgramData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === "title is required")
      ).toBeTruthy();
    }, 60000);

    it("Should be rejected if title is more than 255 characters", async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathImage);

      const workProgramData = {
        title: "a".repeat(256),
        description: "2021",
        image: filePathImage,
      };
      const res = await createWorkProgram(token, workProgramData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            "Work program title must be no more than 255 characters"
        )
      ).toBeTruthy();
    }, 60000);

    it("Should be rejected if description is not provided", async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathImage);

      const workProgramData = {
        title: "TES DULU",
        description: "",
        image: filePathImage,
      };
      const res = await createWorkProgram(token, workProgramData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === "description is required")
      ).toBeTruthy();
    }, 60000);

    it("Should be rejected if logo is not provided", async () => {
      const token = await authenticateUser();
      const workProgramData = {
        title: "TES DULU",
        description: "2021",
      };
      const res = await createWorkProgram(token, workProgramData);

      validateErrorResponse(res, 500, 500, "Work program image is required");
    }, 60000);

    it("Should be rejected if image is not wwebp", async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, "../test.jpg");
      fileExists(filePathImage);

      const workProgramData = {
        title: "TES DULU",
        description: "2021",
        image: filePathImage,
      };
      const res = await createWorkProgram(token, workProgramData);

      validateErrorResponse(
        res,
        500,
        500,
        "Work program image must be in WEBP Format"
      );
    }, 60000);

    it("Should be rejected if image is larger than 500kb", async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, "../tes-large.webp");
      fileExists(filePathImage);

      const workProgramData = {
        title: "TES DULU",
        description: "2021",
        image: filePathImage,
      };
      const res = await createWorkProgram(token, workProgramData);

      validateErrorResponse(
        res,
        500,
        500,
        "Work program image size is too big, please upload a file smaller than 500 KB"
      );
    }, 60000);

    it("Should be able to create a work program", async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathImage);

      const workProgramData = {
        title: "TES DULU",
        description: "Ini merupakan sebuah tes",
        image: filePathImage,
      };
      const res = await createWorkProgram(token, workProgramData);

      validateSuccessResponse(
        res,
        200,
        200,
        "Successfully Add New Work Program"
      );
      validateWorkProgram(res);
    }, 60000);
  });

  describe("GET /api/v1/work-programs", () => {
    it("Should get all work programs", async () => {
      const res = await request(app).get("/api/v1/work-programs");

      validateSuccessResponse(
        res,
        200,
        200,
        "Successfully Get All Work Programs"
      );
      getAllWorkProgramsMessageSuccess(res);
    });
  });

  describe("GET /api/v1/work-programs?id=id_work_program", () => {
    it("Should be rejected if work program not found", async () => {
      const res = await request(app).get("/api/v1/work-programs?id=100000");

      validateErrorResponse(res, 404, 404, "Work Program not found");
    }, 60000);

    it("Should get work program by id", async () => {
      const workPrograms = await request(app).get("/api/v1/work-programs");

      const res = await request(app).get(
        `/api/v1/work-programs?id=${workPrograms.body.data[0].id}`
      );

      validateSuccessResponse(res, 200, 200, "Successfully Get Work Program");

      validateWorkProgram(res);
    }, 60000);
  });

  describe("PUT /api/v1/work-programs?id=id_work_program?id=id_work_prorgram", () => {
    it("Should be rejected if work program not found", async () => {
      const res = await request(app).get("/api/v1/work-programs?id=100000");

      validateErrorResponse(res, 404, 404, "Work Program not found");
    }, 60000);

    it("Should be able to update work program by id", async () => {
      const workPrograms = await request(app).get("/api/v1/work-programs");

      const token = await authenticateUser();

      const filePathImage = path.resolve(__dirname, "../test-small.webp");
      fileExists(filePathImage);

      const workProgramUpdated = {
        title: "Updated Title",
        description: "Updated Description",
        image: filePathImage,
      };

      const res = await request(app)
        .put(`/api/v1/work-programs?id=${workPrograms.body.data[0].id}`)
        .set("Cookie", [`token=${token}`])
        .set("Authorization", `Bearer ${token}`)
        .field("title", workProgramUpdated.title)
        .field("description", workProgramUpdated.description)
        .attach("image", workProgramUpdated.image);

      validateSuccessResponse(
        res,
        200,
        200,
        "Successfully Update Work Program"
      );
    }, 60000);
  });

  describe("DELETE /api/v1/work-programs?id=id_work_program", () => {
    it("Should be rejected if work program not found", async () => {
      const res = await request(app).get("/api/v1/work-programs?id=100000");

      validateErrorResponse(res, 404, 404, "Work Program not found");
    }, 60000);

    it("Should be able to delete work program by id", async () => {
      const workPrograms = await request(app).get("/api/v1/work-programs");

      const token = await authenticateUser();

      const res = await request(app)
        .delete(`/api/v1/work-programs?id=${workPrograms.body.data[0].id}`)
        .set("Cookie", [`token=${token}`])
        .set("Authorization", `Bearer ${token}`);

      validateSuccessResponse(
        res,
        200,
        200,
        "Successfully Delete Work Program"
      );
    }, 60000);
  });
});
