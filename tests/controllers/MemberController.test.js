const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllMembers } = require('../../src/models/memberModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

// Test data constants
const divisionData = { name: 'Test Division' };
const positionData = { name: 'Test Position' };
const memberData = {
  name: 'Member',
  division_id: null,
  position_id: null,
  angkatan: '2023',
  instagram: 'https://instagram.com/member',
  linkedin: 'https://linkedin.com/member',
  whatsapp: '08123456789',
};

const createDivisionHelper = async ({
  headers,
  name,
  imagePath = '../test-small.webp',
}) => {
  const filePathImage = path.resolve(__dirname, imagePath);
  return await request(app)
    .post('/api/v1/divisions')
    .set(headers)
    .attach('image', filePathImage)
    .field({ name });
};

const createPositionHelper = async ({ headers, name }) => {
  return await request(app)
    .post('/api/v1/positions')
    .set(headers)
    .field({ name });
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

const createMemberHelper = async ({
  headers,
  data,
  imagePath = '../test-small.webp',
}) => {
  const filePathImage = path.resolve(__dirname, imagePath);
  return await request(app)
    .post('/api/v1/members')
    .set(headers)
    .attach('image', filePathImage)
    .field(data);
};

const updateMemberHelper = async ({ headers, id, data }) => {
  return await request(app)
    .patch(`/api/v1/members/${id}`)
    .set(headers)
    .send(data);
};

const deleteMemberHelper = async ({ headers, id }) => {
  return await request(app).delete(`/api/v1/members/${id}`).set(headers);
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

const getAllMembersSuccess = (res) => {
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0].name).toBeDefined();
};

const validateMember = (res) => {
  const member = res.body.data;
  expect(member).toBeDefined();
  expect(member.name).toBeDefined();
  expect(member.division_id).toBeDefined();
  expect(member.position_id).toBeDefined();
  expect(member.angkatan).toBeDefined();
  expect(member.instagram).toBeDefined();
  expect(member.linkedin).toBeDefined();
  expect(member.whatsapp).toBeDefined();
};

describe('Member Controller', () => {
  let authHeaders;
  let testDivision;
  let testPosition;

  beforeAll(async () => {
    const auth = await setupAuthHeaders();
    authHeaders = auth.headers;

    const divisionResponse = await createDivisionHelper({
      headers: authHeaders,
      name: divisionData.name,
    });
    testDivision = divisionResponse.body.data;

    const positionResponse = await createPositionHelper({
      headers: authHeaders,
      name: positionData.name,
    });
    testPosition = positionResponse.body.data;

    memberData.division_id = testDivision.id;
    memberData.position_id = testPosition.id;
  });

  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllMembers();
  });

  describe('GET /api/v1/members', () => {
    it('should return 204 if no members found', async () => {
      const res = await request(app).get('/api/v1/members');
      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should return 200 if members found', async () => {
      const { headers } = await setupAuthHeaders();
      await createMemberHelper({ headers, data: memberData });
      const res = await request(app).get('/api/v1/members');
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully retrieved all members data',
      );
      getAllMembersSuccess(res);
    });
  });

  describe('GET /api/v1/members/:id', () => {
    it('should return 404 if member not found', async () => {
      const res = await request(app).get('/api/v1/members/1');
      validateErrorResponse(res, 404, 404, 'Member not found');
    });

    it('should return 200 if member found', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({
        headers,
        data: memberData,
      });

      const memberId = member.body.data[0].id;
      const res = await request(app).get(`/api/v1/members/${memberId}`);
      validateSuccessResponse(res, 200, 200, 'Successfully retrieved member');
    });
  });

  describe('POST /api/v1/members', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).post('/api/v1/members');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 400 if no member name provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      delete invalidData.name;
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });

      console.log(res.body);

      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Name is required. No data provided.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if no division id provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      delete invalidData.division_id;
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });

      console.log(res.body.errors);
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Division ID is required and must be a positive integer.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if no position id provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      delete invalidData.position_id;
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Position ID is required and must be a positive integer.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when member name exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      invalidData.name = 'a'.repeat(256);
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Name must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when member angkatan exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      invalidData.angkatan = 'a'.repeat(256);
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Angkatan must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when member instagram exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      invalidData.instagram = 'a'.repeat(256);
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Instagram must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when member linkedIn exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      invalidData.linkedin = 'a'.repeat(256);
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });

      console.log(res.body.errors);
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Linkedin must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when member whatsApp exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...memberData };
      invalidData.whatsapp = 'a'.repeat(256);
      const res = await createMemberHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Whatsapp must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 201 and create member successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createMemberHelper({
        headers,
        data: memberData,
      });

      validateSuccessResponse(
        res,
        201,
        201,
        'Successfully insert member data',
      );
    });
  });

  describe('PATCH /api/v1/members/:id', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).patch('/api/v1/members/1');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if member not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await updateMemberHelper({
        headers,
        id: 999999,
        data: { name: 'Updated Name' },
      });
      validateErrorResponse(res, 404, 404, 'Member not found');
    });

    it('should return 400 if no data provided', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });
      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: {},
      });
      validateErrorResponse(res, 400, 400, 'No update data provided');
    });

    it('should return 400 if member name exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });
      const invalidData = { name: 'a'.repeat(256) };
      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Name must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if member angkatan exceeds maximum length during update', async () => { 
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });
      const invalidData = { angkatan: 'a'.repeat(256) };
      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Angkatan must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if member instagram exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });
      const invalidData = { instagram: 'a'.repeat(256) };
      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Instagram must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if member linkedin exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });
      const invalidData = { linkedin: 'a'.repeat(256) };
      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Linkedin must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if member whatsapp exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });
      const invalidData = { whatsapp: 'a'.repeat(256) };
      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Whatsapp must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 200 and update member name successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });

      const updateData = {
        name: 'Updated Member',
      };

      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated member name.',
      );
    });

    it('should return 200 and update member instagram successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });

      const updateData = {
        instagram: 'https://instagram.com/updated',
      };

      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated member instagram.',
      );
    });

    it('should return 200 and update member linkedin successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });

      const updateData = {
        linkedin: 'https://linkedin.com/updated',
      };

      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated member linkedin.',
      );
    });

    it('should return 200 and update member whatsapp successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });

      const updateData = {
        whatsapp: 'https://wa.me/updated',
      };

      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated member whatsapp.',
      );
    });

    it('should return 200 and update member name and instagram successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });

      const updateData = {
        name: 'Updated Member',
        instagram: 'https://instagram.com/updated',
      };

      const res = await updateMemberHelper({
        headers,
        id: member.body.data[0].id,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated member name and instagram.',
      );
      expect(res.body.data.new_name).toBe(updateData.name);
      expect(res.body.data.new_instagram).toBe(updateData.instagram);
    });
  });

  describe('DELETE /api/v1/members/:id', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).delete('/api/v1/members/1');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if member not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await deleteMemberHelper({ headers, id: 999999 });
      validateErrorResponse(res, 404, 404, 'Member not found');
    });

    it('should return 200 and delete member successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const member = await createMemberHelper({ headers, data: memberData });

      const res = await deleteMemberHelper({
        headers,
        id: member.body.data[0].id,
      });

      validateSuccessResponse(res, 200, 200, 'Successfully deleted member');

      const getRes = await request(app).get(
        `/api/v1/members/${member.body.data[0].id}`,
      );
      validateErrorResponse(getRes, 404, 404, 'Member not found');
    });
  });
});