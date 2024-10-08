const request = require('supertest');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const app = require('../../src/app');
require('dotenv').config();
const fs = require('fs');

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

describe('Latest Activity Controller', () => {
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

  const createLatestActivity = async (token, { image, title }) =>
    await request(app)
      .post('/api/v1/latest-activities')
      .set('Cookie', [`token=${token}`])
      .set('Authorization', `Bearer ${token}`)
      .field('title', title)
      .attach('image', image);

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

  const getAllLatestActivitiesSuccess = (res) => {
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].title).toBeDefined();
    expect(res.body.data[0].image).toBeDefined();
  };

  const validateLatesActivity = (res) => {
    expect(res.body.data.title).toBeDefined();
    expect(res.body.data.image).toBeDefined();
  };

  const fileExists = (filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
  };

  describe('POST /api/v1/latest-activities', () => {
    it('should be rejected if user not authenticated', async () => {
      const res = await request(app).post('/api/v1/latest-activities');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should be rejected if title is not provided', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: '',
        image: filePathImage,
      };

      const res = await createLatestActivity(token, latestActivityData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some((error) => error.msg === 'title is required'),
      ).toBeTruthy();
    });

    it('Should be rejected if title is more than 255 characters', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'x'.repeat(256),
        image: filePathImage,
      };

      const res = await createLatestActivity(token, latestActivityData);

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

    it('should be rejected if image is not provided', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'x'.repeat(250),
      };

      const res = await createLatestActivity(token, latestActivityData);

      validateErrorResponse(res, 500, 500, 'Latest activity image is required');
    });

    it('should be rejected if image is not webp', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test.jpg');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'Test latest activty data',
        image: filePathImage,
      };

      const res = await createLatestActivity(token, latestActivityData);

      validateErrorResponse(
        res,
        500,
        500,
        'Latest activity image must be in WEBP Format',
      );
    });

    it('should be rejected if image is larger than 500kb', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../tes-large.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'Test latest activty data',
        image: filePathImage,
      };

      const res = await createLatestActivity(token, latestActivityData);

      validateErrorResponse(
        res,
        500,
        500,
        'Latest activity image size is too big, please upload a file smaller than 500 KB',
      );
    });

    it('should be able to create a latest activity', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'Test latest activty data',
        image: filePathImage,
      };

      const res = await createLatestActivity(token, latestActivityData);

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Add New Latest Activity',
      );
    });
  });

  describe('GET /api/v1/latest-activities', () => {
    it('should get all latest activities', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'Tes latest activity',
        image: filePathImage,
      };

      await createLatestActivity(token, latestActivityData);
      const res = await request(app).get('/api/v1/latest-activities');

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Get All Latest Activities',
      );

      getAllLatestActivitiesSuccess(res);
    });
  });

  describe('GET /api/v1/latest-activities?id=id_latest_activity', () => {
    it('Should be rejected if latest activity not found', async () => {
      const res = await request(app).get('/api/v1/latest-activities?id=999999');

      validateErrorResponse(res, 404, 404, 'Latest Activity not found');
    });

    it('Should get latest activity by id', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'Tes latest activity',
        image: filePathImage,
      };

      await createLatestActivity(token, latestActivityData);
      const latestActivities = await request(app).get(
        '/api/v1/latest-activities',
      );

      const res = await request(app).get(
        `/api/v1/latest-activities?id=${latestActivities.body.data[0].id}`,
      );

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Get Latest Activity',
      );

      validateLatesActivity(res);
    });
  });

  describe('PUT /api/v1/latest-activities?id=id_latest_activity?id=id_latest_activity', () => {
    it('Should be rejected if latest activity not found', async () => {
      const res = await request(app).get('/api/v1/latest-activities?id=999999');

      validateErrorResponse(res, 404, 404, 'Latest Activity not found');
    });

    it('should return 404 if latest activity not found when updating', async () => {
        const token = await authenticateUser();
        const filePathImage = path.resolve(__dirname, '../test-small.webp');
        fileExists(filePathImage);

          const latestActivityData = {
          title: 'title latest activity lama',
          image: filePathImage,
        };

        await createLatestActivity(token, latestActivityData);

        const latestActivityUpdated = {
          title: 'title latest activity baru ceunah',
          image: filePathImage,
        };

      const res = await request(app)
        .put(`/api/v1/latest-activities?id=20`)
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`)
        .field('title', latestActivityUpdated.title)
        .attach('image', latestActivityUpdated.image);

      validateErrorResponse(res, 404, 404, 'Latest Activity not found');
    });

    it('should be able to update latest activity by id', async () => {
      const latestActivities = await request(app).get(
        '/api/v1/latest-activities',
      );

      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const token = await authenticateUser();
      const latestActivityData = {
        title: 'title latest activity lama',
        image: filePathImage,
      };

      await createLatestActivity(token, latestActivityData);

      const latestActivityUpdated = {
        title: 'title latest activity baru ceunah',
        image: filePathImage,
      };

      const res = await request(app)
        .put(`/api/v1/latest-activities?id=${latestActivities.body.data[0].id}`)
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`)
        .field('title', latestActivityUpdated.title)
        .attach('image', latestActivityUpdated.image);

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Update Latest Activity',
      );
    });
  });

  describe('DELETE /api/v1/latest-activities?id=id_latest_activity', () => {
    it('Should be rejected if latest activity not found', async () => {
      const res = await request(app).get('/api/v1/latest-activities?id=999999');

      validateErrorResponse(res, 404, 404, 'Latest Activity not found');
    });

    it('should be able to delte latest activity by id', async () => {
      const token = await authenticateUser();
      const filePathImage = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathImage);

      const latestActivityData = {
        title: 'title latest activity',
        image: filePathImage,
      };

      await createLatestActivity(token, latestActivityData);
      const latestActivities = await request(app).get(
        '/api/v1/latest-activities',
      );

      const res = await request(app)
        .delete(
          `/api/v1/latest-activities?id=${latestActivities.body.data[0].id}`,
        )
        .set('Cookie', [`token=${token}`])
        .set('Authorization', `Bearer ${token}`);

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully Delete Latest Activity',
      );
    });
  });
});
