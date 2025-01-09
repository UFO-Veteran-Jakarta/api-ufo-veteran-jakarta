const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllArticles } = require('../../src/models/articleModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

const TEST_PATHS = {
  SMALL_IMAGE: path.resolve(__dirname, '../test-small.webp'),
  LARGE_IMAGE: path.resolve(__dirname, '../tes-large.webp'),
  INVALID_FORMAT: path.resolve(__dirname, '../test.jpg'),
};

const categoryData = { name: 'Test Category' };
const articleData = {
    title: 'Article',
    category_id: null,
    author: 'haikal',
    snippets: 'test article',
    body: 'testing article',
};

const createCategoryHelper = async ({ headers, name }) => {
    return await request(app)
      .post('/api/v1/category-article')
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

const createArticleHelper = async ({ headers, data, cover, cover_landscape }) => {
    return await request(app)
      .post('/api/v1/articles')
      .set(headers)
      .attach('cover', cover)
      .attach('cover_landscape', cover_landscape)
      .field(data);
};

const updateArticleHelper = async ({ headers, slug, data }) => {
  const req = request(app).patch(`/api/v1/articles/${slug}`).set(headers);

  if (data.cover) {
    req.attach('cover', data.cover);
  }
  if (data.cover_landscape){
    req.attach('cover_landscape', data.cover_landscape);
  }

  const fieldsToUpdate = { ...data };
  delete fieldsToUpdate.cover;
  delete fieldsToUpdate.cover_landscape;

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


describe('Article Controller', () => {
  let authHeaders;
  let testCategory;

  beforeAll(async () => {
    const auth = await setupAuthHeaders();
    authHeaders = auth.headers;

    const categoryResponse = await createCategoryHelper({
      headers: authHeaders,
      name: categoryData.name,
    });
    testCategory = categoryResponse.body.data;

    articleData.category_id = testCategory.id;
  });

  beforeEach(async () => {
    await deleteUserByUsername(TEST_USERNAME);
    await deleteAllArticles();
  });

  describe('Check File Article Middleware', () => {
    it('should return 400 if cover is not provided', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createArticleHelper({
        headers,
        data: articleData,
        cover: null,
        cover_landscape: TEST_PATHS.SMALL_IMAGE,
      });

      validateErrorResponse(res, 400, 400, 'cover is required.');
    });

    it('should return 400 if cover is not provided', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await createArticleHelper({
          headers,
          data: articleData,
          cover: TEST_PATHS.SMALL_IMAGE,
          cover_landscape: null,
        });
  
        validateErrorResponse(res, 400, 400, 'cover_landscape is required.');
    });

    it('should return 413 if cover is more than 500KB', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createArticleHelper({
        headers,
        data: articleData,
        cover: TEST_PATHS.LARGE_IMAGE,
        cover_landscape: TEST_PATHS.SMALL_IMAGE,
      });

      validateErrorResponse(res, 413, 413, 'cover size is more than 500 KB.');
    });

    it('should return 413 if cover_landscape is more than 500KB', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await createArticleHelper({
          headers,
          data: articleData,
          cover: TEST_PATHS.SMALL_IMAGE,
          cover_landscape: TEST_PATHS.LARGE_IMAGE,
        });
  
        validateErrorResponse(res, 413, 413, 'cover_landscape size is more than 500 KB.');
    });

    it('should return 415 if cover is not in WEBP format', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createArticleHelper({
        headers,
        data: articleData,
        cover: TEST_PATHS.INVALID_FORMAT,
        cover_landscape: TEST_PATHS.SMALL_IMAGE,
      });

      validateErrorResponse(res, 415, 415, 'cover must be in WEBP Format.');
    });

    it('should return 415 if cover_landscape is not in WEBP format', async () => {
        const { headers } = await setupAuthHeaders();
        const res = await createArticleHelper({
          headers,
          data: articleData,
          cover: TEST_PATHS.SMALL_IMAGE,
          cover_landscape: TEST_PATHS.INVALID_FORMAT,
        });
  
        validateErrorResponse(res, 415, 415, 'cover_landscape must be in WEBP Format.');
    });

    it('should successfully create Article with valid cover and cover_landscape', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createArticleHelper({
        headers,
        data: articleData,
        cover: TEST_PATHS.SMALL_IMAGE,
        cover_landscape: TEST_PATHS.SMALL_IMAGE,
      });

      validateSuccessResponse(res, 200, 200, 'Successfully added a new article');
    });
  });

  describe('Update Article Middleware', () => {
    let articleSlug;
    let headers;

    beforeEach(async () => {
      headers = (await setupAuthHeaders()).headers;
      const createRes = await createArticleHelper({
        headers,
        data: articleData,
        cover: TEST_PATHS.SMALL_IMAGE,
        cover_landscape: TEST_PATHS.SMALL_IMAGE,
      });
      articleSlug = createRes.body.data.slug;
    });

    it('should return 415 if new cover is not in WEBP format', async () => {
      const res = await updateArticleHelper({
        headers,
        slug: articleSlug,
        data: { cover: TEST_PATHS.INVALID_FORMAT },
      });

      validateErrorResponse(res, 415, 415, 'cover must be in WEBP Format.');
    });

    it('should return 415 if new cover is not in WEBP format', async () => {
        const res = await updateArticleHelper({
          headers,
          slug: articleSlug,
          data: { cover_landscape: TEST_PATHS.INVALID_FORMAT },
        });
  
        validateErrorResponse(res, 415, 415, 'cover_landscape must be in WEBP Format.');
    });  

    it('should return 413 if new cover size is more than 500KB', async () => {
      const res = await updateArticleHelper({
        headers,
        slug: articleSlug,
        data: { cover: TEST_PATHS.LARGE_IMAGE },
      });

      validateErrorResponse(res, 413, 413, 'cover size is more than 500 KB.');
    });

    it('should return 413 if new cover_landscape size is more than 500KB', async () => {
        const res = await updateArticleHelper({
          headers,
          slug: articleSlug,
          data: { cover_landscape: TEST_PATHS.LARGE_IMAGE },
        });
  
        validateErrorResponse(res, 413, 413, 'cover_landscape size is more than 500 KB.');
    });

    it('should successfully update article with new cover', async () => {
      const res = await updateArticleHelper({
        headers,
        slug: articleSlug,
        data: {
          cover: TEST_PATHS.SMALL_IMAGE,
        },
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated article cover.',
      );
    });

    it('should successfully update article with new cover_landscape', async () => {
        const res = await updateArticleHelper({
          headers,
          slug: articleSlug,
          data: {
            cover_landscape: TEST_PATHS.SMALL_IMAGE,
          },
        });

        validateSuccessResponse(
          res,
          200,
          200,
          'Successfully updated article cover_landscape.',
        );
    });
  });
});
