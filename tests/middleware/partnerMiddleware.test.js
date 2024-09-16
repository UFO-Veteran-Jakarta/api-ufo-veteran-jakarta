const request = require('supertest');
const app = require('src/app');
const path = require('path');

describe('Partner Middleware', () => {
  let token;

  const authenticateUser = async () => {
    const data = {
      username: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
    };
    await request(app).post('/api/v1/register').send(data);
    const loginResponse = await request(app).post('/api/v1/login').send(data);
    return loginResponse.body.authorization.token;
  };

  beforeAll(async () => {
    token = await authenticateUser();
  });

  const sendRequest = (method, url, token, bodyData = {}, logoPath) => {
    let req = request(app)
      [method](url)
      .set('Cookie', `token=${token}`)
      .set('Authorization', `Bearer ${token}`);

    if (logoPath) {
      req = req
        .field('name', bodyData.name || 'Default Name')
        .attach('logo', logoPath);
    } else {
      req = req.send(bodyData);
    }

    return req;
  };

  const postPartner = (
    token,
    logoPath,
    partnerData = { name: 'Default Name' },
  ) => sendRequest('post', '/api/v1/partners', token, partnerData, logoPath);

  const updatePartner = (token, id, updateData, logoPath) =>
    sendRequest(
      'put',
      `/api/v1/partners?id=${id}`,
      token,
      updateData,
      logoPath,
    );

  const prepareTestPartner = async (token, filePathLogo, partnerData) => {
    const partnerResponse = await postPartner(token, filePathLogo, partnerData);
    return partnerResponse.body.data;
  };

  const testFileMiddleware = (description, setup, assertions) => {
    it(
      description,
      async () => {
        const {
          filePathLogo,
          partnerData,
          updateData,
          newFilePathLogo,
          expectedStatus,
          expectedMessage,
        } = setup();
        const partner = await prepareTestPartner(
          token,
          filePathLogo,
          partnerData,
        );
        const res = newFilePathLogo
          ? await updatePartner(token, partner.id, updateData, newFilePathLogo)
          : await postPartner(token, filePathLogo, partnerData);

        assertions(res, expectedStatus, expectedMessage);
      },
      30000,
    );
  };

  describe('checkFile Middleware', () => {
    testFileMiddleware(
      'should return 500 if logo is not provided',
      () => ({
        filePathLogo: undefined,
        partnerData: {},
        expectedStatus: 500,
        expectedMessage: 'Partner logo are required',
      }),
      (res, expectedStatus, expectedMessage) => {
        expect(res.statusCode).toEqual(expectedStatus);
        expect(res.body.message).toBe(expectedMessage);
      },
    );

    testFileMiddleware(
      'should return 500 if logo is not in WEBP format',
      () => ({
        filePathLogo: path.resolve(__dirname, '../test.jpg'),
        partnerData: {},
        expectedStatus: 500,
        expectedMessage: 'Partner logo must be in WEBP format',
      }),
      (res, expectedStatus, expectedMessage) => {
        expect(res.statusCode).toEqual(expectedStatus);
        expect(res.body.message).toBe(expectedMessage);
      },
    );

    testFileMiddleware(
      'should pass if logo is provided in WEBP format and is less than 500KB',
      () => ({
        filePathLogo: path.resolve(__dirname, '../test-small.webp'),
        partnerData: { name: 'Test Partner' },
        expectedStatus: 200,
        expectedMessage: 'Successfully Add New Partner',
      }),
      (res, expectedStatus, expectedMessage) => {
        expect(res.statusCode).toEqual(expectedStatus);
        expect(res.body.message).toBe(expectedMessage);
      },
    );
  }, 30000);

  describe('checkUpdateFile Middleware', () => {
    testFileMiddleware(
      'should return 500 if new logo is not in WEBP format',
      () => ({
        filePathLogo: path.resolve(__dirname, '../test-small.webp'),
        partnerData: { name: 'Test Partner' },
        updateData: { name: 'Updated Partner' },
        newFilePathLogo: path.resolve(__dirname, '../test.jpg'),
        expectedStatus: 500,
        expectedMessage: 'Partner logo must be in WEBP format',
      }),
      (res, expectedStatus, expectedMessage) => {
        expect(res.statusCode).toEqual(expectedStatus);
        expect(res.body.message).toBe(expectedMessage);
      },
    );
  }, 30000);
});
