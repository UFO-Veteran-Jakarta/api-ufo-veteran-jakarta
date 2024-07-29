const request = require("supertest");
const { deleteUserByUsername } = require("../../src/models/userModel");
const app = require("../../src/app");
const { deleteContentAll } = require("../../src/models/contentModel");
require("dotenv").config();

const TEST_USERNAME = process.env.TEST_USERNAME;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

const createTestSuite = ({
  app,
  request,
  deleteUserByUsername,
  deleteContentAll,
}) => {
  const cleanDatabase = async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteContentAll();
  };

  const registerAndLogin = async (username, password) => {
    const data = { username, password };
    await request(app).post("/api/v1/register").send(data);
    return await request(app).post("/api/v1/login").send(data);
  };

  const authenticateUser = async () => {
    const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
    return login.body.authorization.token;
  };

  const createContent = async (token, { link }) => {
    return await request(app)
      .post("/api/v1/contents")
      .set("Cookie", `token=${token}`)
      .set("Authorization", `Bearer ${token}`)
      .field("link", link);
  };

  const validateResponse = (res, statusCode, status, message) => {
    expect(res.statusCode).toEqual(statusCode);
    expect(res.body.status).toEqual(status);
    if (message) expect(res.body.message).toBe(message);
  };

  const validateErrorResponse = (res, statusCode, status, errorMessage) => {
    expect(res.statusCode).toEqual(statusCode);
    expect(res.body.status).toEqual(status);
    expect(res.body.errors[0].msg).toBe(errorMessage);
  };

  const validatePropertiesDefined = (obj, properties) => {
    properties.forEach((property) => {
      expect(obj[property]).toBeDefined();
    });
  };

  describe("Content Controller", () => {
    beforeEach(async () => {
      await cleanDatabase();
    });

    describe("POST /api/v1/contents", () => {
      it("should be rejected if link field not https", async () => {
        const token = await authenticateUser();
        const contentData = { link: "http://blablabla.com" };
        const res = await createContent(token, contentData);
        validateErrorResponse(
          res,
          500,
          500,
          "The link must be a string and a link evidenced by https:// at the beginning"
        );
      }, 60000);

      it("should be rejected if link field not valid url", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://bla" };
        const res = await createContent(token, contentData);
        validateErrorResponse(res, 500, 500, "The link must valid a url");
      }, 60000);

      it("should be rejected if user not authenticated", async () => {
        const res = await request(app).post("/api/v1/contents");
        validateResponse(res, 401, 401, "Unauthorized");
      }, 60000);

      it("should be able to add content", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        const res = await createContent(token, contentData);
        validateResponse(res, 200, 200, "Successfully Add New Content");
      }, 60000);
    });

    describe("GET /api/v1/contents", () => {
      it("should be able get contents", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        await createContent(token, contentData);
        const res = await request(app).get("/api/v1/contents");
        validateResponse(res, 200, 200, "Successfully Get All Contents");
        validatePropertiesDefined(res.body.data[0], [
          "link",
          "created_at",
          "updated_at",
          "deleted_at",
        ]);
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
        validateResponse(res, 200, 200, "Successfully Get All Contents");
        validatePropertiesDefined(res.body.data[0], [
          "link",
          "created_at",
          "updated_at",
          "deleted_at",
        ]);
      }, 60000);
    });

    describe("PUT /api/v1/contents?id=id_content", () => {
      it("should be rejected if user not authenticated", async () => {
        const res = await request(app).post("/api/v1/contents");
        validateResponse(res, 401, 401, "Unauthorized");
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
        validateResponse(res, 404, 404, "Content Not Found");
      }, 60000);

      it("should be rejected if link is not https", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        const content = await createContent(token, contentData);
        const res = await request(app)
          .put(`/api/v1/contents?id=${content.body.data[0].id}`)
          .set("Cookie", `token=${token}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ link: "http://safljsal" });
        validateErrorResponse(
          res,
          500,
          500,
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
        validateErrorResponse(res, 500, 500, "The link must valid a url");
      }, 60000);

      it("should be rejected because content not found", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        await createContent(token, contentData);
        const res = await request(app)
          .put(`/api/v1/contents?id=asdf`)
          .set("Cookie", `token=${token}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ link: "https://dewii.com" });
        validateResponse(res, 404, 404, "Content Not Found");
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
        validateResponse(res, 200, 200, "Successfully Update Content");
        validatePropertiesDefined(res.body.data[0], [
          "link",
          "created_at",
          "updated_at",
          "deleted_at",
        ]);
      }, 60000);
    });

    describe("DELETE /api/v1/contents?id=id_content", () => {
      it("should be rejected if user not authenticated", async () => {
        const res = await request(app).post("/api/v1/contents");
        validateResponse(res, 401, 401, "Unauthorized");
      }, 60000);

      it("should be rejected if id params null", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        await createContent(token, contentData);
        const res = await request(app)
          .delete(`/api/v1/contents?id=`)
          .set("Cookie", `token=${token}`)
          .set("Authorization", `Bearer ${token}`);
        validateResponse(res, 404, 404, "Content Not Found");
      }, 60000);

      it("should be rejected because content not found", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        await createContent(token, contentData);
        const res = await request(app)
          .delete(`/api/v1/contents?id=asdf`)
          .set("Cookie", `token=${token}`)
          .set("Authorization", `Bearer ${token}`);
        validateResponse(res, 404, 404, "Content Not Found");
      }, 60000);

      it("should be able to delete content", async () => {
        const token = await authenticateUser();
        const contentData = { link: "https://blablabla.com" };
        const content = await createContent(token, contentData);
        const res = await request(app)
          .delete(`/api/v1/contents?id=${content.body.data[0].id}`)
          .set("Cookie", `token=${token}`)
          .set("Authorization", `Bearer ${token}`);
        validateResponse(res, 200, 200, "Successfully Delete Content");
      }, 60000);
    });
  });
};

createTestSuite({
  app,
  request,
  deleteUserByUsername,
  deleteContentAll,
});
