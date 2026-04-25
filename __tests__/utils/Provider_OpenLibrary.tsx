import * as OLBooks from '../../src/utils/Provider_OpenLibrary';

describe('GoogleBooks Provider', () => {
  beforeEach(() => {});

  test('search returns a list of books', async () => {
    const result = await OLBooks.Provider_OpenLibrary.search('harry potter', 1);
    expect(result).toBeDefined();
    expect(result).toHaveLength(10);
  });
});
