const request = require('supertest');
const app = require('../../src/app');
const { deleteUserByUsername } = require('../../src/models/userModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

describe('Division Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
  });

  const registerAndLogin = async (username, password) => {
    const data = { username, password };
    await request(app).post('/api/v1/register').send(data);
    return await request(app).post('/api/v1/login').send(data);
  };

  const authenticateUser = async () => {
    const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
    const { token } = login.body.authorization;
    return token;
  };

  const createDivision = async (token, { name }) =>
    await request(app)
      .post('/api/v1/divisions')
      .set('Cookie', [`token=${token}`])
      .set('Authorization', `Bearer ${token}`)
      .send({ name });

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

  describe('POST /api/v1/divisions', () => {
    it('should be rejected if user not authenticated', async () => {
      const res = await request(app).post('/api/v1/divisions');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    }, 60000);

    it('should be rejected if name is not provided', async () => {
      const token = await authenticateUser();
      const divisionData = { name: '' };
      const res = await createDivision(token, divisionData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === 'name is required'),
      ).toBeTruthy();
    }, 60000);

    it('should return error if name exceeds max length', async () => {
      const token = await authenticateUser();
      const longName = 'a'.repeat(256); 
      const res = await createDivision(token, { name: longName });

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Latest activity title must be no more than 255 characters',
        ),
      ).toBeTruthy();
    }, 60000);

    it('should create division successfully', async () => {
      const token = await authenticateUser();
      const divisionData = { name: 'Marketing' };
      const res = await createDivision(token, divisionData);

      validateSuccessResponse(res, 200, 200, 'Successfully Add New Division');
    });

    //  it('should fail to add a division with server error', async () => {
    //    // Mock the addDivision function to throw an error
    //    jest
    //      .spyOn(require('../../src/models/divisionModel'), 'addDivision')
    //      .mockImplementation(() => {
    //        throw new Error('Database error');
    //      });

    //    const token = await authenticateUser();
    //    const res = await createDivision(token, { name: 'New Division' });

    //   //  Check if the response status code is 500 and contains the correct error message
    //    validateErrorResponse(res, 500, 'error', 'Database error');
    //  });
  });

  describe('GET /api/v1/divisions', () => {
    it('should get all divisions successfully', async () => {
      const token = await authenticateUser();
      const res = await request(app)
        .get('/api/v1/divisions')
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`);

      validateSuccessResponse(res, 200, 200, 'Successfully Get All Divisions');
      getAllDivisionsSuccess(res);
    }, 60000);
  });

  describe('GET /api/v1/divisions?id=id_division', () => {
    it('should be rejected if division not found', async () => {
      const token = await authenticateUser();
      const res = await request(app)
        .get('/api/v1/divisions?id=99')
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`);

      validateSuccessResponse(res, 404, 404, 'Division with id 99 not found');
    }, 60000);

    it('should get division by id successfully', async () => {
      const token = await authenticateUser();
      const res = await request(app)
        .get(`/api/v1/divisions?id=1`)
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`);

      validateSuccessResponse(res, 200, 200, 'Successfully Get Division');
      validateDivision(res);
    }, 60000);
  });

  describe('PUT /api/v1/divisions?id', () => {
    it('should be rejected if division not found', async () => {
      const token = await authenticateUser();
      const res = await request(app)
        .put('/api/v1/divisions?id=99')
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Division' });

      validateErrorResponse(res, 404, 404, 'Division with id 99 not found');
    }, 60000);

    it('should reject if name is not provided', async () => {
      const token = await authenticateUser();
      const divisionData = { name: '' };
      const res = await request(app)
        .put(`/api/v1/divisions?id=1`)
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`)
        .send(divisionData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === 'name is required'),
      ).toBeTruthy();
    }, 60000);

    it('should update division by id successfully', async () => {
      const token = await authenticateUser();
      const divisionData = { name: 'Web Development' };
      const createRes = await createDivision(token, divisionData);
      const divisionId = createRes.body.data.id;

      const updatedDivisionData = { name: 'Updated Division' };
      const res = await request(app)
        .put(`/api/v1/divisions?id=${divisionId}`)
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`)
        .send(updatedDivisionData);

      validateSuccessResponse(res, 200, 200, 'Successfully Update Division');
      validateDivision(res);
    }, 60000);
  });

  describe('DELETE /api/v1/divisions?id', () => {
    it('should be rejected if division not found', async () => {
      const token = await authenticateUser();
      const res = await request(app)
        .delete('/api/v1/divisions?id=99')
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`);

      validateErrorResponse(res, 404, 404, 'Division with id 99 not found');
    }, 60000);

    it('should delete division by id successfully', async () => {
      const token = await authenticateUser();
      const divisionData = { name: 'Test Division' };
      const createRes = await createDivision(token, divisionData);
      const divisionId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/divisions?id=${divisionId}`)
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`);

      validateSuccessResponse(res, 200, 200, 'Successfully Delete Division');
    }, 60000);
  });
});
