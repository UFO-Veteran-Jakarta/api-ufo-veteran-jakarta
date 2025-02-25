const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllFounderMembers } = require('../../src/models/founderMemberModel');
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

const createFounderMemberHelper = async ({ headers, name, imagePath = '../test-small.webp' }) => {
  const filePathImage = path.resolve(__dirname, imagePath);
  return await request(app)
    .post('/api/v1/founder-members')
    .set(headers)
    .attach('image', filePathImage)
    .field({ name });
};

const updateFounderMemberHelper = async ({ headers, id, data }) => {
  return await request(app)
    .patch(`/api/v1/founder-members/${id}`)
    .set(headers)
    .send(data);
};

const deleteFounderMemberHelper = async ({ headers, id }) => {
  return await request(app).delete(`/api/v1/founder-members/${id}`).set(headers);
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

const getAllFounderMembersSuccess = (res) => {
  expect(res.body.data.founders).toBeDefined();
  expect(Array.isArray(res.body.data.founders)).toBe(true);
  expect(res.body.data.pagination).toBeDefined();
};

describe('Founder Member Controller', () => {
  let authHeaders;

  beforeAll(async () => {
    const auth = await setupAuthHeaders();
    authHeaders = auth.headers;
  });

  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllFounderMembers();
  });

  describe('GET /api/v1/founder-members', () => {
    it('should return 204 if no founder members found', async () => {
      const res = await request(app).get('/api/v1/founder-members');
      expect(res.status).toBe(204);
    });

    it('should return 200 if founder members found', async () => {
      const { headers } = await setupAuthHeaders();
      await createFounderMemberHelper({ headers, name: 'Test Founder' });
      const res = await request(app).get('/api/v1/founder-members');
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully get all founder members data.'
      );
      getAllFounderMembersSuccess(res);
    });
  });

  describe('GET /api/v1/founder-members/:id', () => {
    it('should return 404 if founder member not found', async () => {
      const res = await request(app).get('/api/v1/founder-members/999');
      validateErrorResponse(res, 404, 404, 'Founder member not found');
    });

    it('should return 200 if founder member found', async () => {
      const { headers } = await setupAuthHeaders();
      const founder = await createFounderMemberHelper({
        headers,
        name: 'Test Founder',
      });

      const founderId = founder.body.data.id;
      const res = await request(app).get(`/api/v1/founder-members/${founderId}`);
      validateSuccessResponse(res, 200, 200, 'Successfully get founder member data');
    });
  });

  describe('POST /api/v1/founder-members', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).post('/api/v1/founder-members');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 400 if image is more than 5 MB', async () => {
      const { headers } = await setupAuthHeaders();
      const filePathImage = path.resolve(__dirname, '../test-over-5mb.jpg');
      const res = await request(app)
        .post('/api/v1/founder-members')
        .set(headers)
        .attach('image', filePathImage)
        .field({ name: 'Test Founder' });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'Image must be smaller than 5MB.'
        )).toBeTruthy();
    });

    it('should return 400 if name is missing', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createFounderMemberHelper({
        headers,
        name: '',
        image: 'path/to/image.webp',
      });

      console.log(res);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name is required. No data provided.'
      )).toBeTruthy();
    });

    it('should return 400 if name exceeds 255 characters', async () => {
      const { headers } = await setupAuthHeaders();
      const longName = 'a'.repeat(256);

      const res = await createFounderMemberHelper({
        headers,
        name: longName,
        image: 'path/to/image.webp',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name must be no more than 255 characters.'
      )).toBeTruthy();
    });

    it('should return 400 if name contains invalid characters', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidChar = '!Test123'

      const res = await createFounderMemberHelper({
        headers,
        name: invalidChar,
        image: 'path/to/image.webp',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name can only contain letters and spaces.'
      )).toBeTruthy();
    });

    it('should return 200 and create founder member successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createFounderMemberHelper({
        headers,
        name: 'Test Founder',
        image: 'path/to/image.webp',
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Creating a Founder Member'
      );
    });
  });

  describe('PATCH /api/v1/founder-members/:id', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).patch('/api/v1/founder-members/1');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if founder member not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .patch('/api/v1/founder-members/999')
        .set(headers)
        .send({ name: 'Updated Founder Member' });

      validateErrorResponse(res, 404, 404, 'Founder Member not found');
    });

    it('should return 400 if name exceeds 255 characters during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createFounderMemberHelper({
        headers,
        name: 'Test Founder',
      });
      const id = createRes.body.data.id;

      const res = await updateFounderMemberHelper({
        headers,
        id,
        data: { name: 'a'.repeat(256) },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name must be no more than 255 characters.'
      )).toBeTruthy();
    });

    it('should return 400 if name contains invalid characters during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createFounderMemberHelper({
        headers,
        name: 'Test Founder',
      });
      const id = createRes.body.data.id;

      const res = await updateFounderMemberHelper({
        headers,
        id,
        data: { name: 'Test123!' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name can only contain letters and spaces.'
      )).toBeTruthy();
    });

    it('should return 200 and update founder member successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createFounderMemberHelper({
        headers,
        name: 'Test Founder',
      });
      const id = createRes.body.data.id;
      
      const updatedImage = path.resolve(__dirname, '../test-1080.webp');
      const res = await request(app)
        .patch(`/api/v1/founder-members/${id}`)
        .set(headers)
        .attach('image', updatedImage)
        .field({ name: 'Founder Name' });

        validateSuccessResponse(
          res,
          200,
          200,
          'Successfully updated founder_members name and image.'
        );
      });
  });

  describe('DELETE /api/v1/founder-members/:id', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).delete('/api/v1/founder-members/1');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if founder member not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await deleteFounderMemberHelper({ headers, id: 999 });
      validateErrorResponse(res, 404, 404, 'founder member not found.');
    });

    it('should return 200 and delete founder member successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const founder = await createFounderMemberHelper({ headers, name: 'Test Founder' });

      const res = await deleteFounderMemberHelper({
        headers,
        id: founder.body.data.id,
      });

      validateSuccessResponse(res, 200, 200, 'Successfully delete founder member data');

      const getRes = await request(app).get(
        `/api/v1/founder-members/${founder.body.data.id}`
      );
      validateErrorResponse(getRes, 404, 404, 'Founder member not found');
    });
  });
});