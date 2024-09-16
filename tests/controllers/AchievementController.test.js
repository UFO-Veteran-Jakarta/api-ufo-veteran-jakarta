const request = require('supertest');
const { deleteUserByUsername } = require('../../src/models/userModel');
const path = require('path');
const app = require('../../src/app');
require('dotenv').config();
const fs = require('fs');
const { deleteAchievementAll } = require('../../src/models/achievementsModel');

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

describe('Achievement Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
  });

  const registerAndLogin = async (username, password) => {
    const data = { username, password };
    await request(app).post('/api/v1/register').send(data);
    return await request(app).post('/api/v1/login').send(data);
  };

  const createAchievement = async (token, { name, year, logo }) => {
    return await request(app)
      .post('/api/v1/achievements')
      .set('Cookie', `token=${token}`)
      .set('Authorization', `Bearer ${token}`)
      .field('name', name)
      .field('year', year)
      .attach('logo', logo);
  };

  const fileExists = (filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
  };

  const authenticateUser = async () => {
    const login = await registerAndLogin(TEST_USERNAME, TEST_PASSWORD);
    const token = login.body.authorization.token;
    return token;
  };

  const validateErrorResponse = (res, statusCode, status, errorMessage) => {
    expect(res.statusCode).toEqual(statusCode);
    expect(res.body.status).toEqual(status);
    expect(res.body.message).toBeDefined();
    expect(res.body.message).toEqual(errorMessage);
  };

  describe('POST /api/v1/achievements', () => {
    it('should be rejected if user not authenticated', async () => {
      const res = await request(app).post('/api/v1/achievements');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should be rejected if name is not provided', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = { name: '', year: '2021', logo: filePathLogo };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Achievement name is required',
        ),
      );
    });

    it('should be rejected if name is longer than 255 characters', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'a'.repeat(256),
        year: '2021',
        logo: filePathLogo,
      };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg)
        .toBe('Achievement name must be no more than 255 characters')
    });

    it('should be rejected if year is more than 4 characters', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'tes achievement',
        logo: filePathLogo,
        year: '20211',
      };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        'Achievement year must be no more than 4 characters',
      );
    });

    it('should be rejected if year is not provided', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = { name: '2021', logo: filePathLogo, year: '' };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Achievement year is required',
        ),
      );
    });

    it('should be rejected if logo is not provided', async () => {
      const token = await authenticateUser();

      const achievementData = { name: 'Achievement', year: '2021' };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe('Achievement logo are required');
    });

    it('should be rejected if logo is not webp', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test.jpg');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'Achievement',
        logo: filePathLogo,
        year: '2021',
      };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe('Achievement logo must be in WEBP format');
    });
    it('should be rejected if logo is larger than 500kb', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../tes-large.webp');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'Achievement',
        logo: filePathLogo,
        year: '2021',
      };
      const res = await createAchievement(token, achievementData);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe(
        'Achievement logo size is too big, please upload a file smaller than 500 KB',
      );
    });

    it('should be able to add achievement', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'Achievement',
        logo: filePathLogo,
        year: '2021',
      };
      const res = await createAchievement(token, achievementData);
      console.log('ini cek respon', res.body);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe('Successfully Add New Achievement');
    }, 7000);
  });

  const testGetAllAchievements = (res) => {
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual(200);
    expect(res.body.message).toEqual('Successfully Get All Achievements');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].logo).toBeDefined();
    expect(res.body.data[0].name).toBeDefined();
    expect(res.body.data[0].year).toBeDefined();
    expect(res.body.data[0].created_at).toBeDefined();
  };

  describe('GET /api/v1/achievements', () => {
    it('Should get all achievements', async () => {
        const token = await authenticateUser();
        const filePathLogo = path.resolve(__dirname, '../test-small.webp');
        fileExists(filePathLogo);

        const achievementData = {
          name: 'Achievement',
          logo: filePathLogo,
          year: '2021',
        };
      await createAchievement(token, achievementData);
      const res = await request(app).get('/api/v1/achievements');
      console.log('ini cek respon', res.body);
      testGetAllAchievements(res);
      }, 7000);

    it('Should return 500 if error', async () => {
      await deleteAchievementAll();
      const res = await request(app).get('/api/v1/achievements');
      validateErrorResponse(
        res,
        500,
        500,
        'Failed to Get All Achievements: No data found',
      );
    }, 7000);
  });

  describe('GET /api/v1/achievements?id=id_achievement', () => {
    it('Should get achievement by id', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'Achievement',
        logo: filePathLogo,
        year: '2021',
      };
      const achievement = await createAchievement(token, achievementData);

      console.log('ini cek respon', achievement.body);

      const res = await request(app).get(
        `/api/v1/achievements?id=${achievement.body.data.id}`,
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual('Successfully Get Achievement');
      expect(res.body.data.logo).toBeDefined();
      expect(res.body.data.name).toBeDefined();
      expect(res.body.data.year).toBeDefined();
      expect(res.body.data.created_at).toBeDefined();
    }, 30000);
  });

  describe('PUT /api/v1/achievements?id=id_achievement', () => {
    it('Should update achievement by id', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      const filePathLogoUpdated = path.resolve(__dirname, '../test-1080.webp');
      fileExists(filePathLogo);
      fileExists(filePathLogoUpdated);

      const achievementData = {
        name: 'Achievement',
        logo: filePathLogo,
        year: '2021',
      };

      const achievementDataUpdated = {
        name: 'Achievement Updated',
        logo: filePathLogoUpdated,
        year: '2022',
      };
      const achievement = await createAchievement(token, achievementData);

      console.log('ini cek respon',achievement.body);

      const res = await request(app)
        .put(`/api/v1/achievements?id=${achievement.body.data.id}`)
        .set('Cookie', `token=${token}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', achievementDataUpdated.name)
        .field('year', achievementDataUpdated.year)
        .attach('logo', achievementDataUpdated.logo);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual('Successfully Update Achievement');
    }, 30000);
  });

  describe('DELETE /api/v1/achievements?id=id_achievement', () => {
    it('Should delete achievement by id', async () => {
      const token = await authenticateUser();
      const filePathLogo = path.resolve(__dirname, '../test-small.webp');
      fileExists(filePathLogo);

      const achievementData = {
        name: 'Achievement',
        logo: filePathLogo,
        year: '2021',
      };
      const achievement = await createAchievement(token, achievementData);
      console.log('ini cek respon',achievement.body);
      const res = await request(app)
        .delete(`/api/v1/achievements?id=${achievement.body.data.id}`)
        .set('Cookie', `token=${token}`)
        .set('Authorization', `Bearer ${token}`);
      console.log('ini cek respon',res.body);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual('Successfully Delete Achievement');
    }, 30000);
  });
});
