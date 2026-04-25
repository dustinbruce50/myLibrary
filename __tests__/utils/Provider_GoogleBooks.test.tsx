import * as GoogleBooks from '../../src/utils/Provider_GoogleBooks';
import { Book } from '../../src/utils/types';

describe('GoogleBooks Provider', () => {
  beforeEach(() => {});

  test('search returns a list of books', async () => {
    const result = await GoogleBooks.Provider_GoogleBooks.search(
      'harry potter',
      1,
    );
    expect(result).toBeDefined();
    expect(result).toHaveLength(10);
  });
});
