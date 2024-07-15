const request = require("supertest");
const app = require("../../src/app");

describe("Example Controller", () => {
  it("should get example data", async () => {
    const res = await request(app).get("/api/example");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("length");
  });
});
