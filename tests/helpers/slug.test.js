const { createSlugDivision } = require('../../src/helpers/slug');
const { checkSlugExistsInDb } = require('../../src/services/divisionService');

// Mock the checkSlugExistsInDb function
jest.mock('../../src/services/divisionService', () => ({
  checkSlugExistsInDb: jest.fn(),
}));

describe('Slug Division Tests', () => {
  test('createSlugDivision function creates a slug string', async () => {
    // Set up the mock to return false (indicating the slug does not exist)
    checkSlugExistsInDb.mockResolvedValue(false);

    // Call the function to create a slug
    const slug = await createSlugDivision('A new title', checkSlugExistsInDb);
    
    console.log('existingDb:', checkSlugExistsInDb);
    console.log('SLUG:', slug);

    // Check that the slug starts with the expected base slug format
    expect(slug).toMatch(/a-new-title-\w{8}$/);

    // Ensure that checkSlugExistsInDb was called with the correct argument
    expect(checkSlugExistsInDb).toHaveBeenCalledWith(slug);
  });

  // test('createSlugDivision function handles existing slug', async () => {
  //   // Set up the mock to return true (indicating the slug already exists)
  //   checkSlugExistsInDb.mockResolvedValue(true);

  //   const slug = await createSlugDivision('A new title', checkSlugExistsInDb);

  //   // Ensure that the slug indicates it is unique
  //   expect(slug).toMatch(/a-new-title-\w{6}$/); // Adjusted length based on the assumption
  //   expect(checkSlugExistsInDb).toHaveBeenCalledWith(slug);
  // });
});
