jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  copyFileAssets: jest.fn(async () => undefined),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve(),
  })),
}));

jest.mock('react-native-sqlite-2', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
  })),
}));

import * as RNFS from 'react-native-fs';
import * as db from '../../src/utils/db';

describe('db', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('downloadCoverFromUrl downloads a cover from a url', async () => {
    const result = await db.downloadCoverFromUrl(
      'https://covers.openlibrary.org/b/id/1000/M.jpg',
      'test.jpg',
    );

    expect(RNFS.downloadFile).toHaveBeenCalledWith({
      fromUrl: 'https://covers.openlibrary.org/b/id/1000/M.jpg',
      toFile: '/mock/documents/test.jpg',
    });
    expect(result).toBe('file:///mock/documents/test.jpg');
  });
});
