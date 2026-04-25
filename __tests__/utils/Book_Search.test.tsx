import * as BookSearch from '../../src/utils/Book_Search';

describe('BookSearch', () => {
  beforeEach(() => {});
  test('search returns a list of books from google', async () => {
    const result = await BookSearch.searchBooks('google', 'harry potter', 1);
    expect(result).toBeDefined();
    expect(result).toHaveLength(10);
  });
  test('search returns a list of books from openlibrary', async () => {
    const result = await BookSearch.searchBooks(
      'openlibrary',
      'harry potter',
      1,
    );
    expect(result).toBeDefined();
    expect(result).toHaveLength(10);
  });
});
