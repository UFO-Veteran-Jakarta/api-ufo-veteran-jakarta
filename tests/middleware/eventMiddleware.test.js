
const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const { deleteUserByUsername } = require('../../src/models/userModel');
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

const validateSuccessResponse = (res, statusCode, status, successMessage) => {
  expect(res.statusCode).toEqual(statusCode);
  expect(res.body.status).toEqual(status);
  expect(res.body.message).toBeDefined();
  expect(res.body.message).toEqual(successMessage);
};

const validateErrorResponse = (res, statusCode, status, errorMessage) => {
  expect(res.statusCode).toEqual(statusCode);
  expect(res.body.status).toEqual(status);
  expect(res.body.message).toBeDefined();
  expect(res.body.message).toEqual(errorMessage);
};

const createEvent = async (
  headers,
  eventData,
  filePathCover,
  filePathLandscape,
) => {
  return await request(app)
    .post('/api/v1/events')
    .set(headers)
    .attach('cover', filePathCover)
    .attach('cover_landscape', filePathLandscape)
    .field(eventData);
};

const updateEvent = async (
  headers,
  eventId,
  eventData,
  filePathCover,
  filePathLandscape,
) => {
  const req = request(app).put(`/api/v1/events/${eventId}`).set(headers);
  if (filePathCover) req.attach('cover', filePathCover);
  if (filePathLandscape) req.attach('cover_landscape', filePathLandscape);
  return req.field(eventData);
};

describe('Event Middleware', () => {
    beforeEach(async () => {
        await deleteUserByUsername(TEST_USERNAME);
    });
  describe('File Validation', () => {
    const validEventData = {
      name: 'Event Test',
      start_event_date: '2024-07-26',
      end_event_date: '2024-07-26',
      start_event_time: '1000',
      end_event_time: '1800',
      registration_start_date: '2024-07-26',
      registration_end_date: '2024-07-26',
      registration_start_time: '1000',
      registration_end_time: '1800',
      body: 'Event Test Body',
      link_registration: 'https://link-registration.com',
      location: 'Test Location',
      snippets: 'Test Snippets',
    };

    const invalidFilePath = path.resolve(__dirname, '../test.jpg');
    const validFilePath = path.resolve(__dirname, '../test-1080.webp');
    const largeFilePath = path.resolve(__dirname, '../tes-large.webp');
    const largeFileEvent = path.resolve(__dirname, '../test-cc-2000-1047.webp');

    it('should return an error if cover file is missing', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        undefined,
        validFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover and Cover Landscape Requirements',
      );
    });

    it('should return an error if cover file is not in WEBP format', async () => {
     const {headers} = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        invalidFilePath,
        validFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover/Cover Landscape must be in WEBP Format',
      );
    });

    it('should return an error if cover_landscape file is not in WEBP format', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        validFilePath,
        invalidFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover/Cover Landscape must be in WEBP Format',
      );
    });

    it('should return an error if cover file is larger than 500 KB', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        largeFilePath,
        validFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover/Cover Landscape size is too big, please upload a file smaller than 500 KB',
      );
    });

    it('should return an error if cover_landscape file is larger than 500 KB', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        validFilePath,
        largeFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover/Cover Landscape size is too big, please upload a file smaller than 500 KB',
      );
    });

    it('should return an error if cover file is not 1080px x 1080px', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        largeFileEvent,
        validFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover must in 1080px x 1080px in size',
      );
    });

    it('should return an error if cover_landscape file is not 2000px x 1047px', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        validFilePath,
        validFilePath,
      );
      validateErrorResponse(
        res,
        500,
        500,
        'Cover Landscape must in 2000px x 1047px in size',
      );
    });
    it('should successfully create an event with valid cover and cover_landscape files', async () => {
      const { headers } = await setupAuthHeaders();
      const res = await createEvent(
        headers,
        validEventData,
        validFilePath,
        largeFileEvent,
      );
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual(200);
      expect(res.body.message).toBeDefined();
      expect(res.body.message).toEqual('Successfully Add New Event');
      expect(res.body.data).toBeDefined();
    });

    it('should update event successfully with valid data and files', async () => {
        const { headers } = await setupAuthHeaders();
        const event = await createEvent(headers, {
            name: 'Initial Event',
            start_event_date: '2024-07-26',
            end_event_date: '2024-07-26',
            start_event_time: '1000',
            end_event_time: '1800',
            registration_start_date: '2024-07-26',
            registration_end_date: '2024-07-26',
            registration_start_time: '1000',
            registration_end_time: '1800',
            body: 'Initial Event Body',
            link_registration: 'https://initial-link-registration.com',
            location: 'Initial Location',
            snippets: 'Initial Snippets',
        }, validFilePath, largeFileEvent);

        const eventId = event.body.data.slug;
        
        const res = await updateEvent(
          headers,
          eventId,
          validEventData,
          validFilePath,
          largeFileEvent,
        );

        validateSuccessResponse(res, 200, 200, 'Successfully Edit This Event');
        expect(res.body.data.name).toEqual(validEventData.name);
        }, 30000);

    it('should return an error if cover file is not in WEBP format during update', async () => {
        const { headers } = await setupAuthHeaders();
        const event = await createEvent(headers, {
            name: 'Initial Event',
            start_event_date: '2024-07-26',
            end_event_date: '2024-07-26',
            start_event_time: '1000',
            end_event_time: '1800',
            registration_start_date: '2024-07-26',
            registration_end_date: '2024-07-26',
            registration_start_time: '1000',
            registration_end_time: '1800',
            body: 'Initial Event Body',
            link_registration: 'https://initial-link-registration.com',
            location: 'Initial Location',
            snippets: 'Initial Snippets',
        }, validFilePath, largeFileEvent);
        
        const eventId = event.body.data.slug;
        const res = await updateEvent(headers, eventId, validEventData, invalidFilePath);

        validateErrorResponse(
          res,
          500,
          500,
          'Cover/Cover Landscape must be in WEBP Format',
        );
        }, 30000);

    it('should return an error if cover file size exceeds limit during update', async () => {
        const { headers } = await setupAuthHeaders();
        const event = await createEvent(headers, {
            name: 'Initial Event',
            start_event_date: '2024-07-26',
            end_event_date: '2024-07-26',
            start_event_time: '1000',
            end_event_time: '1800',
            registration_start_date: '2024-07-26',
            registration_end_date: '2024-07-26',
            registration_start_time: '1000',
            registration_end_time: '1800',
            body: 'Initial Event Body',
            link_registration: 'https://initial-link-registration.com',
            location: 'Initial Location',
            snippets: 'Initial Snippets',
        }, validFilePath, largeFileEvent);
        
        const eventId = event.body.data.slug;
        const res = await updateEvent(headers, eventId, validEventData, largeFilePath);

        validateErrorResponse(
          res,
          500,
          500,
          'Cover/Cover Landscape size is too big, please upload a file smaller than 500 KB',
        );
        },30000);

    it('should return an error if Cover not in 1080px x 1080px during update', async () => {
     const { headers } = await setupAuthHeaders();
     const event = await createEvent(
       headers,
       {
         name: 'Initial Event',
         start_event_date: '2024-07-26',
         end_event_date: '2024-07-26',
         start_event_time: '1000',
         end_event_time: '1800',
         registration_start_date: '2024-07-26',
         registration_end_date: '2024-07-26',
         registration_start_time: '1000',
         registration_end_time: '1800',
         body: 'Initial Event Body',
         link_registration: 'https://initial-link-registration.com',
         location: 'Initial Location',
         snippets: 'Initial Snippets',
       },
       validFilePath,
       largeFileEvent,
     );

     const eventId = event.body.data.slug;

     const res = await updateEvent(
       headers,
       eventId,
       validEventData,
       largeFileEvent,
       validFilePath,
     );

      validateErrorResponse(
        res,
        500,
        500,
        'Cover must in 1080px x 1080px in size',
      );
    }, 30000);
    it('should return if Cover Landscape not in 2000px x 1047px in size during update', async () => {
      const { headers } = await setupAuthHeaders();
      const event = await createEvent(
        headers,
        {
          name: 'Initial Event',
          start_event_date: '2024-07-26',
          end_event_date: '2024-07-26',
          start_event_time: '1000',
          end_event_time: '1800',
          registration_start_date: '2024-07-26',
          registration_end_date: '2024-07-26',
          registration_start_time: '1000',
          registration_end_time: '1800',
          body: 'Initial Event Body',
          link_registration: 'https://initial-link-registration.com',
          location: 'Initial Location',
          snippets: 'Initial Snippets',
        },
        validFilePath,
        largeFileEvent,
      );

      const eventId = event.body.data.slug;
      const res = await updateEvent(
        headers,
        eventId,
        validEventData,
        validFilePath,
        validFilePath,
      );

     validateErrorResponse(
        res,
        500,
        500,
        'Cover Landscape must in 2000px x 1047px in size',
      );
    }, 30000);
  });
})