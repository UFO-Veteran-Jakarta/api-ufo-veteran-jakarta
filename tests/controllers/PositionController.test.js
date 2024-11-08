const request = require('supertest');
const app = require('../../src/app');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllPositions } = require('src/models/positionModel');
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

const createPositionHelper = async ({ headers, name }) => {
  return await request(app)
    .post('/api/v1/positions')
    .set(headers)
    .field({ name });
};

const updatePositionHelper = async ({ headers, id, data }) => {
  return await request(app)
    .patch(`/api/v1/positions/${id}`)
    .set(headers)
    .send(data);
};

const deletePositionHelper = async ({ headers, id }) => {
  return await request(app).delete(`/api/v1/positions/${id}`).set(headers);
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

const getAllPositionsSuccess = (res) => {
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0].name).toBeDefined();
};

const validatePosition = (res) => {
  expect(res.body.data.name).toBeDefined();
};

describe('Position Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllPositions();
  });

  describe('GET /api/v1/positions', () => {
    it('should return 204 if no positions found', async () => {
      const res = await request(app).get('/api/v1/positions');
      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should return 200 if positions found', async () => {
      const { headers } = await setupAuthHeaders();
      await createPositionHelper({ headers, name: 'Ketua Divisi' });
      const res = await request(app).get('/api/v1/positions');
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully retrieved all positions data',
      );
      getAllPositionsSuccess(res);
    });
  });

  describe('GET api/v1/positions/:id', () => {
    it('should return 404 if position not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app).get('/api/v1/positions/1').set(headers);
      validateErrorResponse(res, 404, 404, 'Position Not Found');
    });

    it('should return 200 if position found', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createPositionHelper({
        headers,
        name: 'Ketua Divisi',
      });
      const id = createRes.body.data.id;
      const res = await request(app)
        .get(`/api/v1/positions/${id}`)
        .set(headers);
      validateSuccessResponse(res, 200, 200, 'Successfully Get Position');
      validatePosition(res);
    });
  });

  describe('POST /api/v1/positions', () => {
    it('should return 401 if user is unauthenticated', async () => {
      const res = await request(app).post('/api/v1/positions');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 400 if name is not provided', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createPositionHelper({ headers, name: '' });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Position name is required.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if position name is exceeding 255 characters', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createPositionHelper({
        headers,
        name: 'a'.repeat(256),
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Position name must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 201 if position is created successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createPositionHelper({
        headers,
        name: 'Ketua Divisi',
      });
      validateSuccessResponse(
        res,
        201,
        201,
        'Successfully insert position data',
      );
      validatePosition(res);
    });
  });

    describe('PATCH api/v1/positions/:id', () => {
      it('should return 401 if user is unauthenticated', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes= await createPositionHelper({ headers, name: 'Ketua Divisi' });
        const id = createRes.body.data.id;
        const res = await request(app).patch(`/api/v1/positions/${id}`).send({ name: 'Ketua Divisi' });
        validateErrorResponse(res, 401, 401, 'Unauthorized');
      });

      it('should return 404 if position not found', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await updatePositionHelper({ headers, id: 1, data: { name: 'Ketua Divisi' } });
        validateErrorResponse(res, 404, 404, 'Position Not Found');
      });

      it('should return 400 if name is not provided', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes= await createPositionHelper({ headers, name: 'Ketua Divisi' });
        const id = createRes.body.data.id;
        const res = await updatePositionHelper({ headers, id, data: { name: '' } });
        expect(res.statusCode).toEqual(400);
        expect(
          res.body.errors.some(
            (error) => error.msg === 'Position name is required.',
          ),
        ).toBeTruthy();
      });

      it('should return 400 if position name is exceeding 255 characters', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes= await createPositionHelper({ headers, name: 'Ketua Divisi' });
        const id = createRes.body.data.id;
        const res = await updatePositionHelper({ headers, id, data: { name: 'a'.repeat(256) } });
        expect(res.statusCode).toEqual(400);
        expect(
          res.body.errors.some(
            (error) => error.msg === 'Position name must be no more than 255 characters.',
          ),
        ).toBeTruthy();
      });

      it('should return 200 if position found and position name updated', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes= await createPositionHelper({ headers, name: 'Ketua Divisi' });
        const id = createRes.body.data.id;
        const res = await updatePositionHelper({ headers, id, data: { name: 'Ketua Divisi' } });
        validateSuccessResponse(res, 201, 201, 'Successfully update position name');
        validatePosition(res);
      });
    });

    describe('DELETE api/v1/positions/:id', () => {
      it('should return 401 if user is unauthenticated', async () => {
        const res = await request(app).delete('/api/v1/positions/1');
        validateErrorResponse(res, 401, 401, 'Unauthorized');
      });

      it('should return 404 if position not found', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await deletePositionHelper({ headers, id: 1 });
        validateErrorResponse(res, 404, 404, 'Position Not Found');
      });

      it('should return 204 if position deleted', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes= await createPositionHelper({ headers, name: 'Ketua Divisi' });
        const id = createRes.body.data.id;
        const res = await deletePositionHelper({ headers, id });
        validateSuccessResponse(
          res,
          200,
          200,
          'Successfully delete position data',
        );
      });
    });

    describe('SOFT Delete Position', () => {
      it('should soft delete a position by setting the deleted_at timestamp and return 200', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes= await createPositionHelper({ headers, name: 'Ketua Divisi' });
        const id = createRes.body.data.id;
        const deleteRes = await deletePositionHelper({ headers, id });
         validateSuccessResponse(
           deleteRes,
           200,
           200,
           'Successfully delete position data',
         );

          expect(deleteRes.body.data).toBeDefined();
          expect(deleteRes.body.data.deleted_at).toBeDefined();
          expect(deleteRes.body.data.deleted_at).not.toBeNull();
      });
    });
  });