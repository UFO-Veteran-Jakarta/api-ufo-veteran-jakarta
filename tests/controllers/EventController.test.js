const { deleteUserByUsername } = require("src/models/userModel");
const request = require("supertest");
const app = require("src/app");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

describe("Event Controller", () => {
  beforeEach(async () => {
    await deleteUserByUsername("admin");
  });

  describe("POST /api/v1/events", () => {
    it("should be rejected if token not valid", async () => {
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=asfsf`)
        .set("Authorization", `Bearer asdfsadf`)
        .send({ link: "httpsablabla.com" });

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
    });

    it("should be rejected if cover and cover landscape not exist", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test-small.webp");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const res = await request(app)
        .post("/api/v1/events")
        .attach("cover", undefined)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Cover and Cover Landscape Requirements");
    });

    it("should be rejected if cover and cover landscape is not webp", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test.jpg");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePath)
        .attach("cover_landscape", filePath);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Cover/Cover Landscape must be in WEBP Format"
      );
    });

    it("should be rejected if cover is not 1080px x 1080px", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePath = path.resolve(__dirname, "../test-small.webp");
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePath)
        .attach("cover_landscape", filePath);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe("Cover must in 1080px x 1080px in size");
    });
    it("should be rejected if cover landscape not 2000px x 1047px", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(__dirname, "../test-small.webp");

      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        "Cover Landscape must in 2000px x 1047px in size"
      );
    });
    it("should be accept if cover and cover landscape is less than 500kb", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(
        __dirname,
        "../test-cc-2000-1047.webp"
      );
      const res = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape);
      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("GET /api/v1/events", () => {
    it("should be return all events", async () => {
      const res = await request(app).get("/api/v1/events");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get All Events");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/v1/events/:slug", () => {
    it("should return an event by slug", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(
        __dirname,
        "../test-cc-2000-1047.webp"
      );

      const eventData = {
        name: "Event Test",
        start_event_date: "2024-07-26",
        end_event_date: "2024-07-26",
        start_event_time: "1000",
        end_event_time: "1800",
        registration_start_date: "2024-07-26",
        registration_end_date: "2024-07-26",
        registration_start_time: "1000",
        registration_end_time: "1800",
        body: "Event Test Body",
        link_registration: "https://link-registration.com",
        location: "Test Location",
        snippets: "Test Snippets",
      };

      const event = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape)
        .field(eventData);

      const res = await request(app).get(
        `/api/v1/events/${event.body.data.slug}`
      );
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Successfully Get Event");
      expect(res.body.data).toBeDefined();
      expect(res.body.data.slug).toBe(event.body.data.slug);
    }, 30000);

    it("should return 404 if event is not found", async () => {
      const res = await request(app).get("/api/v1/events/non-existent-slug");
      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toEqual(404);
      expect(res.body.message).toEqual("Event not found");
    });
  });

  describe("PUT /api/v1/events/:slug", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).post("/api/v1/events");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    });

    it("should be able to edit event", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(
        __dirname,
        "../test-cc-2000-1047.webp"
      );

      const eventData = {
        name: "Event Test",
        start_event_date: "2024-07-26",
        end_event_date: "2024-07-26",
        start_event_time: "1000",
        end_event_time: "1800",
        registration_start_date: "2024-07-26",
        registration_end_date: "2024-07-26",
        registration_start_time: "1000",
        registration_end_time: "1800",
        body: "Event Test Body",
        link_registration: "https://link-registration.com",
        location: "Test Location",
        snippets: "Test Snippets",
      };

      const event = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape)
        .field(eventData);

      const updateData = {
        name: "Updated Event",
        start_event_date: "2024-08-26",
        end_event_date: "2024-08-26",
        start_event_time: "1100",
        end_event_time: "1900",
        registration_start_date: "2024-08-26",
        registration_end_date: "2024-08-26",
        registration_start_time: "1100",
        registration_end_time: "1900",
        body: "Updated Event Body",
        link_registration: "https://updated-link-registration.com",
        location: "Updated Location",
        snippets: "Updated Snippets",
      };

      const formattedUpdateData = {
        ...updateData,
        start_event_date: moment(
          updateData.start_event_date,
          "YYYY-MM-DD"
        ).toISOString(),
        end_event_date: moment(
          updateData.end_event_date,
          "YYYY-MM-DD"
        ).toISOString(),
        start_event_time: moment(updateData.start_event_time, "HHmm").format(
          "HH:mm:ss"
        ),
        end_event_time: moment(updateData.end_event_time, "HHmm").format(
          "HH:mm:ss"
        ),
        registration_start_date: moment(
          updateData.registration_start_date,
          "YYYY-MM-DD"
        ).toISOString(),
        registration_end_date: moment(
          updateData.registration_end_date,
          "YYYY-MM-DD"
        ).toISOString(),
        registration_start_time: moment(
          updateData.registration_start_time,
          "HHmm"
        ).format("HH:mm:ss"),
        registration_end_time: moment(
          updateData.registration_end_time,
          "HHmm"
        ).format("HH:mm:ss"),
      };

      const res = await request(app)
        .put(`/api/v1/events/${event.body.data.slug}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.data).toMatchObject(formattedUpdateData);
    }, 30000);

    it("should return 404 if event is not found", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);
      const updateData = {
        name: "Updated Event",
        start_event_date: "2024-08-26",
        end_event_date: "2024-08-26",
        start_event_time: "1100",
        end_event_time: "1900",
        registration_start_date: "2024-08-26",
        registration_end_date: "2024-08-26",
        registration_start_time: "1100",
        registration_end_time: "1900",
        body: "Updated Event Body",
        link_registration: "https://updated-link-registration.com",
        location: "Updated Location",
        snippets: "Updated Snippets",
      };

      const res = await request(app)
        .put(`/api/v1/events/non-existing-slug`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Event Not Found");
    });
  });

  describe("DELETE /api/v1/events/:slug", () => {
    it("should be rejected if user not authenticated", async () => {
      const res = await request(app).delete("/api/v1/events/slug");

      expect(res.statusCode).toEqual(401);
      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 45000);

    it("should be able to delete event", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);
      const login = await request(app).post("/api/v1/login").send(data);

      const filePathCover = path.resolve(__dirname, "../test-1080.webp");
      const filePathLandscape = path.resolve(
        __dirname,
        "../test-cc-2000-1047.webp"
      );

      const eventData = {
        name: "Event Test",
        start_event_date: "2024-07-26",
        end_event_date: "2024-07-26",
        start_event_time: "1000",
        end_event_time: "1800",
        registration_start_date: "2024-07-26",
        registration_end_date: "2024-07-26",
        registration_start_time: "1000",
        registration_end_time: "1800",
        body: "Event Test Body",
        link_registration: "https://link-registration.com",
        location: "Test Location",
        snippets: "Test Snippets",
      };

      const event = await request(app)
        .post("/api/v1/events")
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`)
        .attach("cover", filePathCover)
        .attach("cover_landscape", filePathLandscape)
        .field(eventData);

      if (!event.body.data) {
        throw new Error("Event data is not present in the response");
      }

      const res = await request(app)
        .delete(`/api/v1/events/${event.body.data.slug}`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual("Event deleted successfully");
    }, 45000);

    it("should return 404 if event is not found", async () => {
      const data = {
        username: "admin",
        password: "Admin@12345",
      };
      await request(app).post("/api/v1/register").send(data);

      const login = await request(app).post("/api/v1/login").send(data);

      const res = await request(app)
        .delete(`/api/v1/events/non-existing-slug`)
        .set("Cookie", `token=${login.body.authorization.token}`)
        .set("Authorization", `Bearer ${login.body.authorization.token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Event Not Found");
    }, 45000);
  });
});
