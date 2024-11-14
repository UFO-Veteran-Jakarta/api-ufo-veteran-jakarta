const request = require('supertest');
const app = require('../../src/app');
const { deleteUserByUsername } = require('../../src/models/userModel');
const { deleteAllCategories} = require('src/models/categoriesModel');
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

const createCategoriesHelper = async ({ headers, name }) => {
    return await request(app)
        .post('/api/v1/category-article/')
        .set(headers)
        .field({ name });
};

const updateCategoriesHelper = async ({ headers, id, data }) => {
    return await request(app)
        .patch(`/api/v1/category-article/${id}`)
        .set(headers)
        .send(data);
};

const deleteCategoriesHelper = async ({ headers, id }) => {
    return await request(app).delete(`/api/v1/category-article/${id}`).set(headers);
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

const getAllCategoriesSuccess = (res) => {
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].name).toBeDefined();
};  

const validateCategory = (res) => {
    expect(res.body.data.name).toBeDefined();
};

describe('Category Article Controller', () => {
    beforeEach(async () => {
        await deleteUserByUsername(TEST_USERNAME);
        await deleteAllCategories();
    });

    describe('GET /api/v1/category-article', () => {
        it('should return 204 if no category articles found', async () => {
            const res = await request(app).get('/api/v1/category-article');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
        });

        it('should return 200 if category articles found', async () => {
            const { headers } = await setupAuthHeaders();
            await createCategoriesHelper({ headers, name: 'Fotografi' });
            const res = await request(app).get('/api/v1/category-article');
            validateSuccessResponse(
                res,
                200,
                200,
                'Successfully retrieved all category articles data',
            );
            getAllCategoriesSuccess(res);
        });
    });

    describe('GET api/v1/category-article/:id', () => {
        it('should return 404 if category article not found', async () => {
            const { headers } = await setupAuthHeaders();
            const res = await request(app).get('/api/v1/category-article/1').set(headers);
            validateErrorResponse(res, 404, 404, 'category article not found');
        });

        it('should return 200 if category article found', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes = await createCategoriesHelper({
                headers,
                name: 'Fotografi',
            });
            const id = createRes.body.data.id;
            const res = await request(app)
                .get(`/api/v1/category-article/${id}`)
                .set(headers);
            validateSuccessResponse(res, 200, 200, 'Successfully Get Category Article');
            validateCategory(res);
        });
    });

    describe('POST /api/v1/category-article', () => {
        it('should return 401 if user is unauthenticated', async () => {
            const res = await request(app).post('/api/v1/category-article');
            validateErrorResponse(res, 401, 401, 'Unauthorized');
        });

        it('should return 400 if name is not provided', async () => {
            const { headers } = await setupAuthHeaders();
            const res = await createCategoriesHelper({ headers, name: '' });
            expect(res.statusCode).toEqual(400);
            expect(
                res.body.errors.some(
                    (error) => error.msg === 'Category Article name is required.',
                ),
            ).toBeTruthy();
        });

        it('should return 400 if Category Article name is exceeding 255 characters', async () => {
            const { headers } = await setupAuthHeaders();
            const res = await createCategoriesHelper({
                headers,
                name: 'a'.repeat(256),
            });
            expect(res.statusCode).toEqual(400);
            expect(
                res.body.errors.some(
                    (error) =>
                        error.msg === 'Category Article name must be no more than 255 characters.',
                ),
            ).toBeTruthy();
        });

        it('should return 201 if Category Article is created successfully', async () => {
            const { headers } = await setupAuthHeaders();
            const res = await createCategoriesHelper({
                headers,
                name: 'Fotografi',
            });
            validateSuccessResponse(
                res,
                201,
                201,
                'Successfully insert category articles data',
            );
            validateCategory(res);
            });
    });

    describe('PATCH api/v1/category-article/:id', () => {
        it('should return 401 if user is unauthenticated', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes= await createCategoriesHelper({ headers, name: 'Fotografi' });
            const id = createRes.body.data.id;
            const res = await request(app).patch(`/api/v1/category-article/${id}`).send({ name: 'Fotografi' });
            validateErrorResponse(res, 401, 401, 'Unauthorized');
        });

        it('should return 404 if category article not found', async () => {
            const { headers } = await setupAuthHeaders();
            const res = await updateCategoriesHelper({ headers, id: 1, data: { name: 'Fotografi' } });
            validateErrorResponse(res, 404, 404, 'Category Article Not Found');
        });

        it('should return 400 if name is not provided', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes= await createCategoriesHelper({ headers, name: 'Fotografi' });
            const id = createRes.body.data.id;
            const res = await updateCategoriesHelper({ headers, id, data: { name: '' } });
            expect(res.statusCode).toEqual(400);
            expect(
                res.body.errors.some(
                    (error) => error.msg === 'Category Article name is required.',
                ),
            ).toBeTruthy();
        });

        it('should return 400 if Categories name is exceeding 255 characters', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes= await createCategoriesHelper({ headers, name: 'Fotografi' });
            const id = createRes.body.data.id;
            const res = await updateCategoriesHelper({ headers, id, data: { name: 'a'.repeat(256) } });
            expect(res.statusCode).toEqual(400);
            expect(
                res.body.errors.some(
                    (error) => error.msg === 'Category Article name must be no more than 255 characters.',
                ),
            ).toBeTruthy();
        });

        it('should return 200 if category article found and category article name updated', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes= await createCategoriesHelper({ headers, name: 'Fotografi' });
            const id = createRes.body.data.id;
            const res = await updateCategoriesHelper({ headers, id, data: { name: 'Fotografi' } });
            validateSuccessResponse(res, 201, 201, 'Successfully update category articles name');
            validateCategory(res);
        });
    });

    describe('DELETE api/v1/category-article/:id', () => {
        it('should return 401 if user is unauthenticated', async () => {
            const res = await request(app).delete('/api/v1/category-article/1');
            validateErrorResponse(res, 401, 401, 'Unauthorized');
        });

        it('should return 404 if category article not found', async () => {
            const { headers } = await setupAuthHeaders();
            const res = await deleteCategoriesHelper({ headers, id: 1 });
            validateErrorResponse(res, 404, 404, 'category article not found.');
        });

        it('should return 204 if category article deleted', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes= await createCategoriesHelper({ headers, name: 'Fotografi' });
            const id = createRes.body.data.id;
            const res = await deleteCategoriesHelper({ headers, id });
            validateSuccessResponse(
                res,
                200,
                200,
                'Successfully delete category article data',
            );
            });
    });

    describe('SOFT Delete Category Article', () => {
        it('should soft delete a category article by setting the deleted_at timestamp and return 200', async () => {
            const { headers } = await setupAuthHeaders();
            const createRes= await createCategoriesHelper({ headers, name: 'Fotografi' });
            const id = createRes.body.data.id;
            const deleteRes = await deleteCategoriesHelper({ headers, id });
                validateSuccessResponse(
                    deleteRes,
                    200,
                    200,
                    'Successfully delete category article data',
                );

                expect(deleteRes.body.data).toBeDefined();
                expect(deleteRes.body.data.deleted_at).toBeDefined();
                expect(deleteRes.body.data.deleted_at).not.toBeNull();
        });
    });
});