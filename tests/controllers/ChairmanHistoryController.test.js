const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllChairmanHistories } = require('../../src/models/chairmanHistoryModel');
const { start } = require('repl');
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

const createChairmanHistoryHelper = async ({ headers, name, start_year, end_year = null, is_active = false, imagePath = '../test-small.webp' }) => {
  const filePathImage = path.resolve(__dirname, imagePath);
  return await request(app)
    .post('/api/v1/chairmen')
    .set(headers)
    .attach('image', filePathImage)
    .field({ 
      name, 
      start_year, 
      end_year: end_year === null ? '' : end_year, 
      is_active: is_active.toString() 
    });
};

const updateChairmanHistoryHelper = async ({ headers, id, data, imagePath }) => {
    const req = request(app)
    .patch(`/api/v1/chairmen/${id}`)
    .set(headers);

  if (imagePath) {
    const filePathImage = path.resolve(__dirname, imagePath);
    req.attach('image', filePathImage);
  }

  return req.field(data);
    
    
};

const deleteChairmanHistoryHelper = async ({ headers, id }) => {
  return await request(app).delete(`/api/v1/chairmen/${id}`).set(headers);
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

const getAllChairmanHistoriesSuccess = (res) => {
  expect(res.body.data.chairmen).toBeDefined();
  expect(Array.isArray(res.body.data.chairmen)).toBe(true);
  expect(res.body.data.pagination).toBeDefined();
};

describe('Chairman History Controller', () => {
  let authHeaders;

  beforeAll(async () => {
    const auth = await setupAuthHeaders();
    authHeaders = auth.headers;
  });

  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllChairmanHistories();
  });

  describe('GET /api/v1/chairmen', () => {
    it('should return 204 if no chairman histories found', async () => {
      const res = await request(app).get('/api/v1/chairmen');
      expect(res.status).toBe(204);
    });

    it('should return 200 if chairman histories found', async () => {
      const { headers } = await setupAuthHeaders();
      await createChairmanHistoryHelper({ 
        headers, 
        name: 'Test Chairman', 
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      const res = await request(app).get('/api/v1/chairmen');
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully get all chairmans data.'
      );
      getAllChairmanHistoriesSuccess(res);
    });
  });

  describe('GET /api/v1/chairmen/:id', () => {
    it('should return 404 if chairman history not found', async () => {
      const res = await request(app).get('/api/v1/chairmen/999');
      validateErrorResponse(res, 404, 404, 'Chairman record not found');
    });

    it('should return 200 if chairman history found', async () => {
      const { headers } = await setupAuthHeaders();
      const chairman = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });

      const chairmanId = chairman.body.data.id;
      const res = await request(app).get(`/api/v1/chairmen/${chairmanId}`);
      validateSuccessResponse(res, 200, 200, 'Successfully get chairman data');
    });
  });

  describe('POST /api/v1/chairmen', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).post('/api/v1/chairmen');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 400 if image is more than 5 MB', async () => {
      const { headers } = await setupAuthHeaders();
      const filePathImage = path.resolve(__dirname, '../test-over-5mb.jpg');
      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .attach('image', filePathImage)
        .field({ 
          name: 'Test Chairman',
          start_year: 2010,
          end_year: 2015,
          is_active: 'false'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'Image must be smaller than 5MB.'
      )).toBeTruthy();
    });

    it('should return 400 if image is not in jpg, jpeg, png, or webp format', async () => {
        const { headers } = await setupAuthHeaders();
        const filePathImage = path.resolve(__dirname, '../test-gif.gif');
        const res = await request(app)
          .post('/api/v1/chairmen')
          .set(headers)
          .attach('image', filePathImage)
          .field({ 
            name: 'Test Chairman',
            start_year: 2010,
            end_year: 2015,
            is_active: 'false'
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'Image must be in jpg, jpeg, png, or webp format.'
        )).toBeTruthy();
      });

      it('should return 400 if image is missing', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await request(app)
          .post('/api/v1/chairmen')
          .set(headers)
          .field({ 
            name: 'Test Chairman',
            start_year: 2010,
            end_year: 2015,
            is_active: 'false'
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'image is required.'
        )).toBeTruthy();
      });

    it('should return 400 if name is missing', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .field({ 
          name: '',
          start_year: 2010,
          end_year: 2015,
          is_active: 'false'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name is required. No data provided.'
      )).toBeTruthy();
    });

    it('should return 400 if name exceeds 255 characters', async () => {
      const { headers } = await setupAuthHeaders();
      const longName = 'a'.repeat(256);

      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .field({ 
          name: longName,
          start_year: 2010,
          end_year: 2015,
          is_active: 'false'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name must be no more than 255 characters.'
      )).toBeTruthy();
    });

    it('should return 400 if name contains invalid characters', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidChar = '!Test123';

      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .field({ 
          name: invalidChar,
          start_year: 2010,
          end_year: 2015,
          is_active: 'false'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'name can only contain letters and spaces.'
      )).toBeTruthy();
    });

    it('should return 400 start_year is missing', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await request(app)
          .post('/api/v1/chairmen')
          .set(headers)
          .field({ 
            name: 'Test Chairman',
            start_year: '',
            end_year: 2015,
            is_active: 'false'
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'start_year is required and must be an integer.'
        )).toBeTruthy();
      });

    it('should return 400 if start_year is greater than current year', async () => {
      const { headers } = await setupAuthHeaders();
      const futureYear = new Date().getFullYear() + 1;

      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .field({ 
          name: 'Test Chairman',
          start_year: futureYear,
          end_year: futureYear + 5,
          is_active: 'false'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg.includes('Start year cannot be greater than current year')
      )).toBeTruthy();
    });

    it('should return 400 if end_year is less than or equal to start_year', async () => {
      const { headers } = await setupAuthHeaders();

      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .field({ 
          name: 'Test Chairman',
          start_year: 2010,
          end_year: 2010,
          is_active: 'false'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'End year must be greater than start year.'
      )).toBeTruthy();
    });

    it('should return 400 if end_year is not an integer', async () => {
        const { headers } = await setupAuthHeaders();
  
        const res = await request(app)
          .post('/api/v1/chairmen')
          .set(headers)
          .field({ 
            name: 'Test Chairman',
            start_year: 2010,
            end_year: 'Dua Ribu Lima Belas',
            is_active: 'false'
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'end_year must be an integer.'
        )).toBeTruthy();
      });

      it('should return 400 if is_active is missing or not boolean ', async () => {
        const { headers } = await setupAuthHeaders();
  
        const res = await request(app)
          .post('/api/v1/chairmen')
          .set(headers)
          .field({ 
            name: 'Test Chairman',
            start_year: 2010,
            end_year: 2015,
            is_active: ''
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'is_active is required and must be an boolean.'
        )).toBeTruthy();
      });

      it('should return 400 if chairman is active but end_year is provided', async () => {
        const { headers } = await setupAuthHeaders();
  
        const res = await request(app)
          .post('/api/v1/chairmen')
          .set(headers)
          .field({ 
            name: 'Test Chairman',
            start_year: 2010,
            end_year: 2015,
            is_active: 'true'
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'End year must be null if chairman is active.'
        )).toBeTruthy();
      });

    it('should return 400 if there is already an active chairman', async () => {
      const { headers } = await setupAuthHeaders();
      
      // Create first active chairman
      await createChairmanHistoryHelper({
        headers,
        name: 'Active Chairman',
        start_year: 2020,
        end_year: null,
        is_active: true
      });
      
      // Try to create another active chairman
      const res = await request(app)
        .post('/api/v1/chairmen')
        .set(headers)
        .field({ 
          name: 'Another Active Chairman',
          start_year: 2022,
          end_year: '',
          is_active: 'true'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'Cannot set as active when another chairman is currently active.'
      )).toBeTruthy();
    });

    it('should return 200 and create chairman history successfully with inactive chairman', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Creating a Chairman'
      );
    });

    it('should return 200 and create chairman history successfully with active chairman', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: null,
        is_active: true
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Creating a Chairman'
      );
    });
  });

  describe('PATCH /api/v1/chairmen/:id', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).patch('/api/v1/chairmen/1');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if chairman history not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await request(app)
        .patch('/api/v1/chairmen/999')
        .set(headers)
        .send({ name: 'Updated Chairman' });

      validateErrorResponse(res, 404, 404, 'Chairman record not found');
    });

    it('should return 400 if image is more than 5 MB during update', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes = await createChairmanHistoryHelper({
          headers,
          name: 'Test Chairman',
          start_year: 2010,
          end_year: 2015,
          is_active: false
        });
        const id = createRes.body.data.id;
  
        const res = await updateChairmanHistoryHelper({
          headers,
          id,
          data: {},
          imagePath: '../test-over-5mb.jpg'
        });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'Image must be smaller than 5MB.'
        )).toBeTruthy();
      });

    it('should return 400 if image is not in jpg, jpeg, png, or webp format during update', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes = await createChairmanHistoryHelper({
          headers,
          name: 'Test Chairman',
          start_year: 2010,
          end_year: 2015,
          is_active: false
        });
        const id = createRes.body.data.id;
        const res = await updateChairmanHistoryHelper({
          headers,
          id,
          data: {},
          imagePath: '../test-gif.gif'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error =>
          error.msg === 'Image must be in jpg, jpeg, png, or webp format.'
        )).toBeTruthy();
    });

    it('should return 400 if name is missing during update', async () => {
        const { headers } = await setupAuthHeaders();
        const createRes = await createChairmanHistoryHelper({
          headers,
          name: 'Test Chairman',
          start_year: 2010,
          end_year: 2015,
          is_active: false
        });
        const id = createRes.body.data.id;
  
        const res = await updateChairmanHistoryHelper({
          headers,
          id,
          data: { name: '' },
        });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(error => 
          error.msg === 'name is required. No data provided.'
        )).toBeTruthy();
      });

    it('should return 400 if name exceeds 255 characters during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
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
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
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

    it('should return 400 if start_year is missing during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { start_year: '' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'start_year is required and must be an integer.'
      )).toBeTruthy();
    });

    it('should return 400 if start_year is greater than current year during update', async () => {
      const { headers } = await setupAuthHeaders();
      const futureYear = new Date().getFullYear() + 1;
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2030,
        is_active: false
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { start_year: futureYear},
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === `Start year cannot be greater than current year (2025).`
      )).toBeTruthy();
    });

    it('should return 400 if end_year is less than or equal to start_year during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Active Chairman',
        start_year: 2020,
        end_year: null,
        is_active: true
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { 
          start_year: 2020,
          end_year: 2019,
          is_active: false,
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'End year must be greater than start year.'
      )).toBeTruthy();
    });

    it('should return 400 if chairman is_active is missing during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Active Chairman',
        start_year: 2020,
        end_year: null,
        is_active: true
      });
      const id = createRes.body.data.id;
      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { 
          is_active: '',
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'is_active is required and must be an boolean.'
      )).toBeTruthy();
    });

    it('should return 400 if chairman is active but end_year is provided during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Active Chairman',
        start_year: 2020,
        end_year: 2025,
        is_active: false
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { 
          start_year: 2020,
          end_year: 2025,
          is_active: true
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'End year must be null if chairman is active.'
      )).toBeTruthy();
    });

    it('should return 400 if chairman is not active but end_year is null during update', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Active Chairman',
        start_year: 2020,
        end_year: null,
        is_active: true
      });
      const id = createRes.body.data.id;

      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { 
          is_active: false
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'End year is required if chairman is not active.'
      )).toBeTruthy();
    });

    it('should return 400 if trying to make chairman active when another is already active', async () => {
      const { headers } = await setupAuthHeaders();
      
      // Create first active chairman
      await createChairmanHistoryHelper({
        headers,
        name: 'Active Chairman',
        start_year: 2020,
        end_year: null,
        is_active: true
      });
      
      // Create inactive chairman
      const inactive = await createChairmanHistoryHelper({
        headers,
        name: 'Inactive Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      
      // Try to make inactive chairman active
      const res = await updateChairmanHistoryHelper({
        headers,
        id: inactive.body.data.id,
        data: { 
          is_active: true,
          end_year: ''
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(error => 
        error.msg === 'Cannot set as active when another chairman is currently active.'
      )).toBeTruthy();
    });

    it('should return 200 and update chairman name successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      const id = createRes.body.data.id;
      
      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { name: 'Updated Chairman' }
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated chairman_histories name.'
      );
    });

    it('should return 200 and update chairman years successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const createRes = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });
      const id = createRes.body.data.id;
      
      const res = await updateChairmanHistoryHelper({
        headers,
        id,
        data: { 
          start_year: 2012,
          end_year: 2018
        }
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated chairman_histories start_year and end_year.'
      );
    });
  });

  describe('DELETE /api/v1/chairmen/:id', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).delete('/api/v1/chairmen/1');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if chairman history not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await deleteChairmanHistoryHelper({ headers, id: 999 });
      validateErrorResponse(res, 404, 404, 'Chairman record not found.');
    });

    it('should return 200 and delete chairman history successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const chairman = await createChairmanHistoryHelper({
        headers,
        name: 'Test Chairman',
        start_year: 2010,
        end_year: 2015,
        is_active: false
      });

      const res = await deleteChairmanHistoryHelper({
        headers,
        id: chairman.body.data.id,
      });

      validateSuccessResponse(res, 200, 200, 'Chairman record successfully deleted');

      const getRes = await request(app).get(
        `/api/v1/chairmen/${chairman.body.data.id}`
      );
      validateErrorResponse(getRes, 404, 404, 'Chairman record not found');
    });
  });
});