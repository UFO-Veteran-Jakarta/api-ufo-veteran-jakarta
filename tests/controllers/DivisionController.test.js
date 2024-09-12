const request = require('supertest');
const app = require('../../src/app');
const { deleteUserByUsername } = require('../../src/models/userModel');
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

const createDivision = async (headers, { name }) =>
  await request(app).post('/api/v1/divisions').set(headers).send({ name });

describe('Division Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
  });

  describe('POST /api/v1/divisions', () => {
    it('should return 401 if user is not authenticated when attempting to create a division', async () => {
      const res = await request(app).post('/api/v1/divisions');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 500 when division name is not provided during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const divisionData = { name: '' };
      const res = await createDivision(headers, divisionData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === 'name is required'),
      ).toBeTruthy();
    });

    it('should return 500 when division name exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const longName = 'a'.repeat(256);
      const res = await createDivision(headers, { name: longName });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Latest activity title must be no more than 255 characters',
        ),
      ).toBeTruthy();
    });

    it('should return 200 and create a division successfully when valid data is provided', async () => {
      const { headers } = await setupAuthHeaders();
      const divisionData = { name: 'Marketing' };
      const res = await createDivision(headers, divisionData);

      validateSuccessResponse(res, 200, 200, 'Successfully Add New Division');
    });
  });

  describe('GET /api/v1/divisions', () => {
    it('should return 200 and all divisions when the request is successful', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app).get('/api/v1/divisions').set(headers);

      validateSuccessResponse(res, 200, 200, 'Successfully Get All Divisions');
      getAllDivisionsSuccess(res);
    });
  });

  describe('GET /api/v1/divisions?id=id_division', () => {
    it('should return 404 if the division with the specified id is not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .get('/api/v1/divisions?id=99')
        .set(headers);

      validateErrorResponse(res, 404, 404, 'Division with id 99 not found');
    });

    it('should return 200 and the division when the division with the specified id is found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app).get(`/api/v1/divisions?id=1`).set(headers);

      validateSuccessResponse(res, 200, 200, 'Successfully Get Division');
      validateDivision(res);
    });
  });

  describe('PUT /api/v1/divisions?id', () => {
    it('should return 404 if the division with the specified id is not found during update', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .put('/api/v1/divisions?id=99')
        .set(headers)
        .send({ name: 'Updated Division' });

      validateErrorResponse(res, 404, 404, 'Division with id 99 not found');
    });

    it('should return 500 if name is not provided when updating a division', async () => {
      const { headers } = await setupAuthHeaders();
      const divisionData = { name: '' };
      const res = await request(app)
        .put(`/api/v1/divisions?id=1`)
        .set(headers)
        .send(divisionData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === 'name is required'),
      ).toBeTruthy();
    });

    it('should return 200 and update the division successfully when valid data is provided', async () => {
      const { headers } = await setupAuthHeaders();
      const divisionData = { name: 'Web Development' };
      const createRes = await createDivision(headers, divisionData);
      const divisionId = createRes.body.data.id;

      const updatedDivisionData = { name: 'Updated Division' };
      const res = await request(app)
        .put(`/api/v1/divisions?id=${divisionId}`)
        .set(headers)
        .send(updatedDivisionData);

      validateSuccessResponse(res, 200, 200, 'Successfully Update Division');
      validateDivision(res);
    });
  });

  describe('DELETE /api/v1/divisions?id', () => {
    it('should return 404 if the division with the specified id is not found during deletion', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .delete('/api/v1/divisions?id=99')
        .set(headers);

      validateErrorResponse(res, 404, 404, 'Division with id 99 not found');
    });

    it('should return 200 and delete the division successfully when the division with the specified id is found', async () => {
      const { headers } = await setupAuthHeaders();
      const divisionData = { name: 'Test Division' };
      const createRes = await createDivision(headers, divisionData);
      const divisionId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/divisions?id=${divisionId}`)
        .set(headers);

      validateSuccessResponse(res, 200, 200, 'Successfully Delete Division');
    });
  });
});
