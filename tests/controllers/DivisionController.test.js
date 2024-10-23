const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllDivisions } = require('src/models/divisionModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

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

const createDivisionHelper = async ({ headers, name, imagePath = '../test-small.webp' }) => {
  const filePathImage = path.resolve(__dirname, imagePath);
  return await request(app)
    .post('/api/v1/divisions')
    .set(headers)
    .attach('image', filePathImage)
    .field({ name });
};

const updateDivisionHelper = async ({ headers, slug, data }) => {
  return await request(app)
    .patch(`/api/v1/divisions/${slug}`)
    .set(headers)
    .send(data);
};

const deleteDivisionHelper = async ({ headers, slug }) => {
  return await request(app)
    .delete(`/api/v1/divisions/${slug}`)
    .set(headers);
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

const getAllDivisionsSuccess = (res) => {
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0].name).toBeDefined();
};

const validateDivision = (res) => {
  expect(res.body.data.name).toBeDefined();
};

describe('Division Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllDivisions();
  });

  describe('POST /api/v1/divisions', () => {
    it('should return 401 if user is not authenticated when attempting to create a division', async () => {
      const res = await request(app).post('/api/v1/divisions');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

      it('should return 413 if image is more than 500KB', async () => {
        const { headers } = await setupAuthHeaders();
        const filePathImage = path.resolve(__dirname, '../tes-large.webp');
        const res = await request(app)
          .post('/api/v1/divisions')
          .set(headers)
          .attach('image', filePathImage)
          .field({ name: 'Marketing' });

        validateErrorResponse(res, 413, 413, 'image size is more than 500 KB.');
      });

    it('should return 400 when division name is not provided during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createDivisionHelper({
        headers,
        name: '',
        image: 'path/to/image.webp',
      });

      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Division name is required. No data provided.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when division name exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const longName = 'a'.repeat(256);
      const res = await createDivisionHelper({
        headers,
        name: longName,
        image: 'path/to/image.webp',
      });

      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Division name must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 200 and create a division successfully when valid data is provided', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createDivisionHelper({ headers, name: 'Marketing' });

      validateSuccessResponse(
        res,
        201,
        201,
        'Successfully insert division data',
      );
    });
  });

  describe('GET /api/v1/divisions', () => {

  it('should return 204 if no divisions are found', async () => {
    const { headers } = await setupAuthHeaders();

    const res = await request(app).get('/api/v1/divisions').set(headers);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

    it('should return 200 and all divisions when the request is successful', async () => {
      const { headers } = await setupAuthHeaders();
      await createDivisionHelper({ headers, name: 'Marketing' });

      const res = await request(app).get('/api/v1/divisions').set(headers);

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully retrieved all divisions data',
      );
      getAllDivisionsSuccess(res);
    });
  });

  describe('GET /api/v1/divisions/:slug', () => {
    it('should return 404 if the division with the specified slug is not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .get('/api/v1/divisions/non-existent-slug')
        .set(headers);

      validateErrorResponse(res, 404, 404, 'Division not found');
    });

    it('should return 200 and the division when the division with the specified slug is found', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createDivisionHelper({ headers, name: 'Marketing' });
      const slug = createRes.body.data.slug;
      
      const res = await request(app).get(`/api/v1/divisions/${slug}`).set(headers);

      validateSuccessResponse(res, 200, 200, 'Successfully Get Division');
      validateDivision(res);
    });
  });
});

  describe('PATCH /api/v1/divisions/:slug', () => {

    it('should return 401 if user is not authenticated when attempting to update a division', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createDivisionHelper({ headers, name: 'Marketing' });
      const slug = createRes.body.data.slug;

      const res = await request(app).patch(`/api/v1/divisions/${slug}`).send({
        name: 'Updated Division',
      });

      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });
      
    it('should return 404 if the division with the specified slug is not found during update', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .patch('/api/v1/divisions/non-existent-slug')
        .set(headers)
        .send({ name: 'Updated Division' });

      validateErrorResponse(res, 404, 404, 'Division not found');
    });

    it('should return 400 if data is not provided when updating a division', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createDivisionHelper({
        headers,
        name: 'Marketing',
      });
      const slug = createRes.body.data.slug;
      
      const res = await updateDivisionHelper({
        headers,
        slug,
        data: { name: '' }
      });

      validateErrorResponse(res, 400, 400, 'No update data provided');
    });

    it('should return 400 if division name exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createDivisionHelper({
        headers,
        name: 'Marketing',
      });
      const slug = createRes.body.data.slug;

      const res = await updateDivisionHelper({
        headers,
        slug,
        data: { name: 'a'.repeat(256) },
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Division name must be no more than 255 characters',
        ),
      ).toBeTruthy();
    });

    it('should return 200 if and update division name successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const currentDivision = await createDivisionHelper({
        headers,
        name: 'Marketing',
      });
      const slug = currentDivision.body.data.slug;
      
      const res = await updateDivisionHelper({
        headers,
        slug,
        data: { name: 'Updated Division' }
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully update division name',
      );
    });

 it('should return 200 and update the division image successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createDivisionHelper({
        headers,
        name: 'Marketing',
      });
      const slug = createRes.body.data.slug;
      
      const updatedImage = path.resolve(__dirname, '../test-cc-2000-1047.webp');

      const res = await request(app)
        .patch(`/api/v1/divisions/${slug}`)
        .set(headers)
        .attach('image', updatedImage);

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully update division image'
      );
    });
    

    it('should return 200 and update the division successfully when valid data is provided', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createDivisionHelper({
        headers,
        name: 'Marketing',
      });
      const slug = createRes.body.data.slug;
      
      const updatedImage = path.resolve(__dirname, '../test-1080.webp');
      const res = await request(app)
        .patch(`/api/v1/divisions/${slug}`)
        .set(headers)
        .attach('image', updatedImage)
        .field({ name: 'Updated Division' });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully update division name and image'
      );
    });
  });

  describe('DELETE /api/v1/divisions/:slug', () => {

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app).delete('/api/v1/divisions/123');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if the division with the specified slug is not found during deletion', async () => {
      const { headers } = await setupAuthHeaders();

      const res = await deleteDivisionHelper({ headers, slug: 'non-existent-slug' });

      validateErrorResponse(res, 404, 404, 'Division not found.');
    });

    it('should return 200 and delete the division successfully when the division with the specified slug is found', async () => {
      const { headers } = await setupAuthHeaders();

      const createRes = await createDivisionHelper({
        headers,
        name: 'Marketing',
      });

      const res = await deleteDivisionHelper({ headers, slug: createRes.body.data.slug });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully delete division data',
      );
    });
  });

describe('Soft Delete Division', () => {
  it('should soft delete a division by setting the deleted_at timestamp and return 200', async () => {
    const { headers } = await setupAuthHeaders();

    const createRes = await createDivisionHelper({
      headers,
      name: 'Marketing',
    });

    const deleteRes = await deleteDivisionHelper({ headers, slug: createRes.body.data.slug });

    validateSuccessResponse(
      deleteRes,
      200,
      200,
      'Successfully delete division data',
    );

    expect(deleteRes.body.data).toBeDefined();
    expect(deleteRes.body.data.deleted_at).toBeDefined();
    expect(deleteRes.body.data.deleted_at).not.toBeNull();
  });
});
