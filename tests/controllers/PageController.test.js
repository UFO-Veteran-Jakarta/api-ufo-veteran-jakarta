const { deleteUserByUsername } = require('src/models/userModel');
const request = require('supertest');
const app = require('src/app');
require('dotenv').config();

const registerAndLogin = async (userData) => {
  await request(app).post('/api/v1/register').send(userData);
  const loginResponse = await request(app).post('/api/v1/login').send(userData);
  return loginResponse.body.authorization.token;
};

const makeRequest = (method, endpoint, token = '', data = {}) => {
  let req = request(app)[method](endpoint);
  
  if (token) {
    req
      .set('Cookie', `token=${token}`)
      .set('Authorization', `Bearer ${token}`);
  }

  if (method === 'patch') {
    req = req.send(data);
  }

  return req;
};

const getPageBySlug = async (slug) =>
  makeRequest('get', `/api/v1/pages/${slug}`);

const getPageSectionBySlug = async (slug) =>
  makeRequest('get', `/api/v1/pages/${slug}/sections`);

const updatePageSectionBySlug = async (token, slug, data) =>
  makeRequest('patch', `/api/v1/pages/${slug}/sections`, token, data);

const authenticateUser = async () => {
  await deleteUserByUsername(process.env.TEST_USERNAME);
  const data = {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD,
  };
  const token = await registerAndLogin(data);
  return token;
};

const testUnauthorizedAccess = async (endpoint, method = 'post') => {
  const res = await request(app)[method](endpoint);
  expect(res.statusCode).toEqual(401);
  expect(res.body.status).toEqual(401);
  expect(res.body.message).toBeDefined();
};

const slug = 'home';
const title = 'Home';
const updateData = {
  sections: [
    {
      section_key: 'hero_button_section',
      content: 'Test Content',
    },
  ],
};

describe('Page Controller', () => {
  let token;

  beforeEach(async () => {
    token = await authenticateUser();
  });

  describe('GET /api/v1/pages/:slug', () => {
    it('should return page by slug', async () => {
      const res = await getPageBySlug(slug);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe(`Successfully retrieved data for page ${title}`);
      expect(typeof res.body.data).toBe('object');
    });
  });

  describe('GET /api/v1/pages/:slug/sections', () => {
    it('should return editable section data by slug', async () => {
      const res = await getPageSectionBySlug(slug);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual(
        `Successfully retrieved editable section data for ${slug} page`
      );
      expect(res.body.data).toBeDefined();
      expect(res.body.data.pages.slug).toBe(slug);
    });
  });

  describe('PATCH /api/v1/pages/:slug/sections', () => {
    it('should be rejected if user not authenticated', async () => {
      await testUnauthorizedAccess(`/api/v1/pages/${slug}/sections`, 'patch');
    });

    it('should return 404 if pages not found', async () => {
      const res = await updatePageSectionBySlug(token, 'unknown-page', updateData);
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('pages not found');
    });

    it('should update page content', async () => {
      const res = await updatePageSectionBySlug(token, slug, updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toEqual(`Successfully update ${title} content`);
    }, 60000);
  });
});
