const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllDivisions } = require('src/models/divisionModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

const TEST_PATHS = {
  SMALL_IMAGE: path.resolve(__dirname, '../test-small.webp'),
  LARGE_IMAGE: path.resolve(__dirname, '../tes-large.webp'),
  INVALID_FORMAT: path.resolve(__dirname, '../test.jpg'),
};

const setupAuthHeaders = async () => {
  const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
  const { token } = login.body.authorization;
  return {
    token,
    headers: {
      Cookie: [`token=${token}`],
      Authorization: `Bearer ${token}`,
    },
  };
};

const registerAndLogin = async (username, password) => {
  const data = { username, password };
  await request(app).post('/api/v1/register').send(data);
  return await request(app).post('/api/v1/login').send(data);
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

const createDivisionHelper = async ({ headers, name, image }) => {
  return await request(app)
    .post('/api/v1/divisions')
    .set(headers)
    .attach('image', image)
    .field({ name });
};

const updateDivisionHelper = async ({ headers, slug, data }) => {
  const req = request(app).patch(`/api/v1/divisions/${slug}`).set(headers);

  if (data.image) {
    req.attach('image', data.image);
  }

  const fieldsToUpdate = { ...data };
  delete fieldsToUpdate.image;

  return req.field(fieldsToUpdate);
};

describe('Division Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllDivisions();
  });

  describe('Check File Division Middleware', () => {
    it('should return 400 if image is not provided', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createDivisionHelper({
        headers,
        name: 'Division',
        image: undefined,
      });

      validateErrorResponse(res, 400, 400, 'image is required.');
    });

    it('should return 413 if image is more than 500KB', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createDivisionHelper({
        headers,
        name: 'Division',
        image: TEST_PATHS.LARGE_IMAGE,
      });

      validateErrorResponse(res, 413, 413, 'image size is more than 500 KB.');
    });

    it('should return 415 if image is not in WEBP format', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createDivisionHelper({
        headers,
        name: 'Division',
        image: TEST_PATHS.INVALID_FORMAT,
      });

      validateErrorResponse(res, 415, 415, 'Image must be in WEBP Format.');
    });

    it('should successfully create division with valid image', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createDivisionHelper({
        headers,
        name: 'Division',
        image: TEST_PATHS.SMALL_IMAGE,
      });

      validateSuccessResponse(
        res,
        201,
        201,
        'Successfully insert division data',
      );
      expect(res.body.data.name).toEqual('Division');
    });
  });

  describe('Update Division Middleware', () => {
    let division;
    let headers;

    beforeEach(async () => {
      headers = (await setupAuthHeaders()).headers;
      const createRes = await createDivisionHelper({
        headers,
        name: 'Division',
        image: TEST_PATHS.SMALL_IMAGE,
      });
      division = createRes.body.data;
    });

    it('should return 415 if new logo is not in WEBP format', async () => {
      const res = await updateDivisionHelper({
        headers,
        slug: division.slug,
        data: { image: TEST_PATHS.INVALID_FORMAT },
      });

      validateErrorResponse(res, 415, 415, 'Image must be in WEBP Format.');
    });

    it('should return 413 if new logo size is more than 500KB', async () => {
      const res = await updateDivisionHelper({
        headers,
        slug: division.slug,
        data: { image: TEST_PATHS.LARGE_IMAGE },
      });

      validateErrorResponse(res, 413, 413, 'image size is more than 500 KB.');
    });

    it('should successfully update division with new image', async () => {
      const res = await updateDivisionHelper({
        headers,
        slug: division.slug,
        data: {
          name: 'Updated Division',
          image: TEST_PATHS.SMALL_IMAGE,
        },
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully update division name and image',
      );
    });
  });
});
