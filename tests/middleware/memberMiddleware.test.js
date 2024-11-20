const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllMembers } = require('../../src/models/memberModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

const TEST_PATHS = {
  SMALL_IMAGE: path.resolve(__dirname, '../test-small.webp'),
  LARGE_IMAGE: path.resolve(__dirname, '../tes-large.webp'),
  INVALID_FORMAT: path.resolve(__dirname, '../test.jpg'),
};

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

const createMemberHelper = async ({ headers, data, image }) => {
  return await request(app)
    .post('/api/v1/members')
    .set(headers)
    .attach('image', image)
    .field(data);
};

const updateMemberHelper = async ({ headers, id, data }) => {
  const req = request(app).patch(`/api/v1/members/${id}`).set(headers);

  if (data.image) {
    req.attach('image', data.image);
  }

  const fieldsToUpdate = { ...data };
  delete fieldsToUpdate.image;

  return req.field(fieldsToUpdate);
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

  describe('Check File Member Middleware', () => {
    it('should return 400 if image is not provided', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createMemberHelper({
        headers,
        data: memberData,
        image: null,
      });

      validateErrorResponse(res, 400, 400, 'image is required.');
    });

    it('should return 413 if image is more than 500KB', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createMemberHelper({
        headers,
        data: memberData,
        image: TEST_PATHS.LARGE_IMAGE,
      });

      validateErrorResponse(res, 413, 413, 'image size is more than 500 KB.');
    });

    it('should return 415 if image is not in WEBP format', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createMemberHelper({
        headers,
        data: memberData,
        image: TEST_PATHS.INVALID_FORMAT,
      });

      validateErrorResponse(res, 415, 415, 'Image must be in WEBP Format.');
    });

    it('should successfully create member with valid image', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createMemberHelper({
        headers,
        data: memberData,
        image: TEST_PATHS.SMALL_IMAGE,
      });

      validateSuccessResponse(res, 201, 201, 'Successfully insert member data');
    });
  });

  describe('Update Member Middleware', () => {
    let memberId;
    let headers;

    beforeEach(async () => {
      headers = (await setupAuthHeaders()).headers;
      const createRes = await createMemberHelper({
        headers,
        data: memberData,
        image: TEST_PATHS.SMALL_IMAGE,
      });
      memberId = createRes.body.data[0].id;
    });

    it('should return 415 if new logo is not in WEBP format', async () => {
      const res = await updateMemberHelper({
        headers,
        id: memberId,
        data: { image: TEST_PATHS.INVALID_FORMAT },
      });

      validateErrorResponse(res, 415, 415, 'Image must be in WEBP Format.');
    });

    it('should return 413 if new logo size is more than 500KB', async () => {
      const res = await updateMemberHelper({
        headers,
        id: memberId,
        data: { image: TEST_PATHS.LARGE_IMAGE },
      });

      validateErrorResponse(res, 413, 413, 'image size is more than 500 KB.');
    });

    it('should successfully update member with new image', async () => {
      const res = await updateMemberHelper({
        headers,
        id: memberId,
        data: {
          image: TEST_PATHS.SMALL_IMAGE,
        },
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated member image.',
      );
    });
  });
});
