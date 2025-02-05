const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllArticles } = require('../../src/models/articleModel');
require('dotenv').config();

const { TEST_USERNAME, TEST_PASSWORD } = process.env;

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

const createArticleHelper = async ({
  headers,
  data,
  imagePath = '../test-small.webp',
}) => {
  const filePathImage = path.resolve(__dirname, imagePath);
  return await request(app)
    .post('/api/v1/articles')
    .set(headers)
    .attach('cover', filePathImage)
    .attach('cover_landscape', filePathImage)
    .field(data);
};

const updateArticleHelper = async ({ headers, slug, data }) => {
  return await request(app)
    .patch(`/api/v1/articles/${slug}`)
    .set(headers)
    .send(data);
};

const deleteArticleHelper = async ({ headers, slug }) => {
  return await request(app).delete(`/api/v1/articles/${slug}`).set(headers);
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

const getAllArticlesSuccess = (res) => {
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data[0].title).toBeDefined();
};

const validateArticle = (res) => {
  const article = res.body.data;
  expect(article).toBeDefined();
  expect(article.title).toBeDefined();
  expect(article.category_id).toBeDefined();
  expect(article.autor).toBeDefined();
  expect(article.snippet).toBeDefined();
  expect(article.body).toBeDefined();
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
  
  describe('GET /api/v1/articles', () => {
    it('should return 204 if no articles found', async () => {
      const res = await request(app).get('/api/v1/articles');
      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should return 200 if articles found', async () => {
      const { headers } = await setupAuthHeaders();
      await createArticleHelper({ headers, data: articleData });
      const res = await request(app).get('/api/v1/articles');
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully retrieved articles',
      );
      getAllArticlesSuccess(res);
    });
  });

  describe('GET /api/v1/articles/:slug', () => {
    it('should return 404 if article not found', async () => {
      const res = await request(app).get('/api/v1/articles/non-existent-slug');
      validateErrorResponse(res, 404, 404, 'Article not found');
    });

    it('should return 200 if article found', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({
        headers,
        data: articleData,
      });

      const articleSlug = article.body.data.slug;
      const res = await request(app).get(`/api/v1/articles/${articleSlug}`);
      validateSuccessResponse(res, 200, 200, 'Successfully retrieved article by slug');
    });
  });

  describe('POST /api/v1/articles', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).post('/api/v1/articles');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 400 if no article title provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      delete invalidData.title;
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });

      console.log(res.body);

      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Title is required. No data provided.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if no category id provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      delete invalidData.category_id;
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });

      console.log(res.body.errors);
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Category article ID is required and must be a positive integer.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if no author provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      delete invalidData.author;
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });
  
      console.log(res.body.errors);
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Author is required. No data provided.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if no body provided', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      delete invalidData.body;
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });
  
      console.log(res.body.errors);
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg ===
            'Body is required. No data provided.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when article title exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      invalidData.title = 'a'.repeat(256);
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Title must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });
  
    it('should return 400 when article author exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      invalidData.author = 'a'.repeat(101);
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Author must be no more than 100 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 when article snippets exceeds maximum length during creation', async () => {
      const { headers } = await setupAuthHeaders();
      const invalidData = { ...articleData };
      invalidData.snippets = 'a'.repeat(256);
      const res = await createArticleHelper({
        headers,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) => error.msg === 'Snippets must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 200 and create article successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createArticleHelper({
        headers,
        data: articleData,
      });
  
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully added a new article',
      );
    });
  });

  describe('PATCH /api/v1/articles/:slug', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).patch('/api/v1/articles/123');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });
    
    it('should return 404 if article not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await updateArticleHelper({
          headers,
          slug: 'non-existed-slug',
          data: { title: 'Updated Title' },
      });
      validateErrorResponse(res, 404, 404, 'Article not found');
    });

    it('should return 400 if no data provided', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
      const res = await updateArticleHelper({
          headers,
          slug: article.body.data.slug,
          data: {},
      });
      console.log(article.body);
      validateErrorResponse(res, 400, 400, 'Missing required fields');
    });

    it('should return 400 if article title exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
      const invalidData = { title: 'a'.repeat(256) };
      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: invalidData,
      });
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Title must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if article author exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
      const invalidData = { author: 'a'.repeat(101) };
      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Author must be no more than 100 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 400 if article snippets exceeds maximum length during update', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
      const invalidData = { snippets: 'a'.repeat(256) };
      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: invalidData,
      });
      expect(res.statusCode).toEqual(400);
      expect(
        res.body.errors.some(
          (error) =>
            error.msg === 'Snippets must be no more than 255 characters.',
        ),
      ).toBeTruthy();
    });

    it('should return 200 and update article title successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
  
      const updateData = {
        title: 'Updated Article',
      };
  
      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: updateData,
      });
  
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated article slug and title.',
      );
    });

    it('should return 200 and update article author successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
  
      const updateData = {
        author: 'Adhi',
      };
  
      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: updateData,
      });
  
      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated article author.',
      );
    });

    it('should return 200 and update article snippets successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
  
      const updateData = {
        snippets: 'About Updated Article',
      };

      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated article snippets.',
      );
    });
    
    it('should return 200 and update article body successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });
  
      const updateData = {
        body: 'How To Updated Article',
      };
  
      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated article body.',
      );
    });


    it('should return 200 and update article title and author successfully', async () => {
      const { headers } = await setupAuthHeaders();
      const article = await createArticleHelper({ headers, data: articleData });

      const updateData = {
        title: 'Updated Title',
        author: 'Adhi',
      };

      const res = await updateArticleHelper({
        headers,
        slug: article.body.data.slug,
        data: updateData,
      });

      validateSuccessResponse(
        res,
        200,
        200,
        'Successfully updated article slug and title and author.',
      );
      expect(res.body.data.new_title).toBe(updateData.title);
      expect(res.body.data.new_author).toBe(updateData.author);
    });
  });
  describe('DELETE /api/v1/articles/:slug', () => {
    it('should return 401 if user unauthorized', async () => {
      const res = await request(app).delete('/api/v1/articles/123');
      validateErrorResponse(res, 401, 401, 'Unauthorized');
    });

    it('should return 404 if article not found', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await deleteArticleHelper({ headers, slug: 'non-existed-slug' });
      validateErrorResponse(res, 404, 404, 'Article not found');
    });

    it('should return 200 and delete article successfully', async () => {
        const { headers } = await setupAuthHeaders();
        const article = await createArticleHelper({ headers, data: articleData });

        const res = await deleteArticleHelper({
          headers,
          slug: article.body.data.slug,
        });

        validateSuccessResponse(res, 200, 200, 'Successfully deleted article');

        const getRes = await request(app).get(
          `/api/v1/articles/${article.body.data.slug}`,
        );
        validateErrorResponse(getRes, 404, 404, 'Article not found');
      });
    });
});
