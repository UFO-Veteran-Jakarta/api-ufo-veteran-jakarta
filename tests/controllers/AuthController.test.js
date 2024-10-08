const request = require('supertest');

const {
  getUserByUsername,
  deleteUserByUsername,
  createUser,
} = require('models/userModel');
const app = require('app');
const cookie = require('cookie');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await deleteUserByUsername('admin');
  });

  describe('POST /api/v1/register', () => {
    it('should be rejected if method http is not POST', async () => {
      const data = {
        password: 'Ad@123',
      };
      const res = await request(app).put('/api/v1/register').send(data);

      expect(res.statusCode).toEqual(405);
      expect(res.body.status).toEqual(405);
      expect(res.body.message).toBe('Wrong method');
    }, 60000);
    it('should be rejected if password length not in requirement', async () => {
      const data = {
        username: 'admin',
        password: 'Ad@123',
      };
      const res = await request(app).post('/api/v1/register').send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        'Password must be between 8 and 64 characters',
      );
    }, 60000);
    it('should be rejected if password not valid in validate', async () => {
      const data = {
        username: 'admin',
        password: 'admin@123',
      };
      const res = await request(app).post('/api/v1/register').send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        'Password must consist of at least one lowercase, one uppercase, one special character, and one number',
      );
    }, 60000);
    it('should be rejected if username is exist', async () => {
      await createUser({ username: 'admin', password: 'Admin@12345' });
      const data = {
        username: 'admin',
        password: 'Admin@12345',
      };
      const res = await request(app).post('/api/v1/register').send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe('Username already taken');
    }, 60000);
    it('should be able to register', async () => {
      const data = {
        username: 'adam',
        password: 'Admin@12345',
      };
      const res = await request(app).post('/api/v1/register').send(data);
      const result = await getUserByUsername('adam');

      expect(result?.[0]?.username).toBe('adam');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBe('Successfully registered new user!');
    }, 60000);
  });

  describe('POST /api/v1/login', () => {
    it('should be rejected if method http is not POST', async () => {
      const data = {
        username: 'admin',
        password: 'Ad@123',
      };
      const res = await request(app).put('/api/v1/login').send(data);

      expect(res.statusCode).toEqual(405);
      expect(res.body.status).toEqual(405);
      expect(res.body.message).toBe('Wrong method');
    }, 60000);
    it('should be rejected if username not string', async () => {
      const data = {
        username: 123213,
        password: 'Ad@123',
      };
      const res = await request(app).post('/api/v1/login').send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        'The username and password must be strings',
      );
    }, 60000);
    it('should be rejected if password not string', async () => {
      const data = {
        username: 'admin',
        password: 12321,
      };
      const res = await request(app).post('/api/v1/login').send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.errors[0].msg).toBe(
        'The username and password must be strings',
      );
    }, 60000);
    it('should be rejected if login fails or username/password wrong', async () => {
      const data = {
        username: 'adam',
        password: 'Admin@123',
      };
      await request(app)
        .post('/api/v1/register')
        .send({ username: 'adam', password: 'Adsalf@24324' });

      const res = await request(app).post('/api/v1/login').send(data);

      expect(res.statusCode).toEqual(500);
      expect(res.body.status).toEqual(500);
      expect(res.body.message).toBe('Failed to login!');
    }, 60000);
    it('should be able to login', async () => {
      const data = {
        username: 'admin',
        password: 'Admin@12345678',
      };
      await request(app)
        .post('/api/v1/register')
        .send({ username: 'admin', password: 'Admin@12345678' });
      const res = await request(app).post('/api/v1/login').send(data);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Successfully logged in!');
      expect(res.body.status).toEqual(200);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.username).toBeDefined();
      expect(res.body.authorization.token).toBeDefined();
      expect(res.body.authorization.type).toBeDefined();
    }, 60000);
    it('should be exist cookie token', async () => {
      const data = {
        username: 'admin',
        password: 'Admin@12345678',
      };
      await request(app)
        .post('/api/v1/register')
        .send({ username: 'admin', password: 'Admin@12345678' });
      const res = await request(app).post('/api/v1/login').send(data);

      expect(cookie.parse(res.headers['set-cookie'][0]).token).toBeDefined();
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Successfully logged in!');
      expect(res.body.status).toEqual(200);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.username).toBeDefined();
      expect(res.body.authorization.token).toBeDefined();
      expect(res.body.authorization.type).toBeDefined();
    }, 60000);
  });

  describe('DELETE /api/v1/logout', () => {
    it('should be rejected if token invalid', async () => {
      const res = await request(app)
        .delete('/api/v1/logout')
        .set('Authorization', `Bearer 3242432343`);

      expect(res.body.status).toEqual(401);
      expect(res.body.message).toBeDefined();
    }, 60000);

   it('should handle logout error when no token is provided', async () => {
    const res = await request(app)
      .delete('/api/v1/logout')
      .set('Cookie', '')
      .set('Authorization', '');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Unauthorized');
    expect(res.body.status).toEqual(401);
   });


    it('should be able to logout', async () => {
      const data = {
        username: 'admin',
        password: 'Admin@12345',
      };
      await request(app).post('/api/v1/register').send(data);
      const login = await request(app).post('/api/v1/login').send(data);

      const res = await request(app)
        .delete('/api/v1/logout')
        .set('Cookie', `token=${login.body.authorization.token}`)
        .set('Authorization', `Bearer ${login.body.authorization.token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Success Logout!');
      expect(cookie.parse(res.headers['set-cookie'][0]).token).toBe('');
    }, 60000);
  });
});
