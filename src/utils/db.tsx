import SQLite, { SQLResultSet } from 'react-native-sqlite-2';
import RNFS from 'react-native-fs';
import {
  Book,
  BookCoverInput,
  CreateBookInput,
  UpdateBookInput,
} from './types';
import { SqlParam } from '../utils/types';
import { LucideSquareArrowRightExit } from 'lucide-react-native';
import { executeNativeBackPress } from 'react-native-screens';

const db = SQLite.openDatabase('localsql');

function executeSql(
  sql: string,
  params: SqlParam[] = [],
): Promise<SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('PRAGMA foreign_keys = ON;');
      tx.executeSql(
        sql,
        params,
        (_tx, result) => resolve(result),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

function mapRows<T>(result: SQLResultSet): T[] {
  const rows: T[] = [];

  for (let index = 0; index < result.rows.length; index += 1) {
    rows.push(result.rows.item(index));
  }

  return rows;
}

function sanitizeTags(tags: string[] = []): string[] {
  console.log('tags', tags);
  let local = Array.from(
    new Set(tags.map(tag => tag.trim()).filter(tag => tag.length > 0)),
  );
  console.log('local ', local);
  return local;
}

function mapBookRow(
  row: Book & { tags?: string | null; tagNames?: string | null },
): Book {
  const tagSource = row.tags ?? row.tagNames ?? '';

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: row.year ?? null,
    description: row.description ?? null,
    coverUri: row.coverUri ?? null,
    rating: row.rating ?? null,
    tags: tagSource
      .split('|')
      .map(tag => tag.trim())
      .filter(Boolean),
    coverIds: row.coverIds ?? [],
  };
}

export async function copyCoverFromAssets(filename: string): Promise<string> {
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

  await RNFS.copyFileAssets(`covers/${filename}`, destinationPath);
  return `file://${destinationPath}`;
}

export async function downloadCoverFromUrl(
  url: string,
  filename: string,
): Promise<string> {
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  console.log('AM I THE PROBLEM???');
  console.log('Maybe Problem URL: ', url);
  try {
    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: destinationPath,
    }).promise;
  } catch (e) {
    console.log('Error where you are ', e);
  }
  //if (result.statusCode !== 200) {
  //  throw new Error(`Failed to download cover: ${result.statusCode}`);
  //}

  return `file://${destinationPath}`;
}

async function resolveCoverUri(cover?: BookCoverInput): Promise<string | null> {
  if (!cover) {
    return null;
  }

  if (cover.uri) {
    return cover.uri;
  }

  if (cover.assetFilename) {
    return copyCoverFromAssets(cover.assetFilename);
  }

  if (cover.openLibraryCoverId) {
    return downloadCoverFromUrl(
      `https://covers.openlibrary.org/b/id/${cover.openLibraryCoverId}-M.jpg`,
      `cover_${cover.openLibraryCoverId}.jpg`,
    );
  }

  if (cover.url && cover.filename) {
    console.log('_____________TESTING______________');
    return downloadCoverFromUrl(cover.url, cover.filename);
  }

  return null;
}

async function ensureTag(tagName: string): Promise<number> {
  await executeSql(`INSERT OR IGNORE INTO tags (name) VALUES (?);`, [tagName]);

  const result = await executeSql(`SELECT id FROM tags WHERE name = ?;`, [
    tagName,
  ]);
  const match = mapRows<{ id: number }>(result)[0];

  if (!match) {
    throw new Error(`Unable to resolve tag id for "${tagName}"`);
  }

  return match.id;
}

async function replaceBookTags(bookId: number, tags: string[]): Promise<void> {
  const cleanedTags = sanitizeTags(tags);

  await executeSql(`DELETE FROM book_tags WHERE book_id = ?;`, [bookId]);

  for (const tagName of cleanedTags) {
    const tagId = await ensureTag(tagName);

    await executeSql(
      `INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?);`,
      [bookId, tagId],
    );
  }
}

export async function initializeDatabase(): Promise<void> {
  await executeSql(`DROP TABLE IF EXISTS books;`);
  //await executeSql(
  //  `DROP TABLE IF EXISTS tags;`
  //)
  //await executeSql(
  //  `DROP TABLE IF EXISTS book_tags;`
  //)
  await executeSql(
    `CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      description TEXT,
      coverUri TEXT,
      rating REAL,
      coverIds TEXT
    );`,
  );

  await executeSql(
    `CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );`,
  );

  await executeSql(
    `CREATE TABLE IF NOT EXISTS book_tags (
      book_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (book_id, tag_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );`,
  );
}

export async function seedDatabase(): Promise<void> {
  await executeSql(`DELETE FROM book_tags;`);
  await executeSql(`DELETE FROM tags;`);
  await executeSql(`DELETE FROM books;`);

  await createBook({
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    cover: { assetFilename: 'tgg.jpg' },
  });
  await createBook({
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    cover: { assetFilename: 'tkam.jpg' },
  });
  await createBook({
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    cover: { assetFilename: '1984.jpg' },
  });
}

export async function createBook(input: CreateBookInput) {
  console.log('input ', input);
  let temp: any = input.cover?.url;
  const coverUri = await downloadCoverFromUrl(temp, temp);
  const result = await executeSql(
    `INSERT INTO books (title, author, year, description, coverUri, rating, coverIds)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.title ?? '',
      input.author ?? '',
      input.year ?? null,
      input.description ?? null,
      coverUri,
      input.rating ?? null,
      JSON.stringify(input.coverIds) ?? null,
    ],
  );
  const bookId = result.insertId;
  if (!bookId) {
    throw new Error('failed to get inserted Book ID');
  }
  for (const tagname of input.tags ?? []) {
    await executeSql(`INSERT OR IGNORE INTO tags (name) VALUES (?);`, [
      tagname,
    ]);
    const tagResult = await executeSql(
      `SELECT id FROM tags WHERE name = ? LIMIT 1;`,
      [tagname],
    );
    const rows = tagResult.rows;
    if (!rows || rows.length === 0) {
      throw new Error(`failed to find tag id for tag: ${tagname}`);
    }

    const tagId = rows.item(0).id;

    await executeSql(
      `INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?,?);`,
      [bookId, tagId],
    );
  }
}

export async function listBooks(): Promise<Book[]> {
  const result = await executeSql(
    `SELECT
      books.id,
      books.title,
      books.author,
      books.year,
      books.description,
      books.coverUri,
      books.rating,
      books.coverIds
    FROM books;`,
  );
  let data = mapRows<Book & { tags?: string | null }>(result).map(mapBookRow);
  console.log('Data inside listBooks: ', data);
  return data;
}

export async function getBookById(id: number): Promise<Book | null> {
  const result = await executeSql(
    `SELECT
      books.id,
      books.title,
      books.author,
      books.year,
      books.description,
      books.coverUri,
      books.rating,
      GROUP_CONCAT(tags.name, '|') AS tags
    FROM books
    LEFT JOIN book_tags ON book_tags.book_id = books.id
    LEFT JOIN tags ON tags.id = book_tags.tag_id
    WHERE books.id = ?
    GROUP BY books.id;`,
    [id],
  );

  const row = mapRows<Book & { tags?: string | null }>(result)[0];
  return row ? mapBookRow(row) : null;
}

export async function updateBook(
  id: number,
  updates: UpdateBookInput,
): Promise<Book | null> {
  const assignments: string[] = [];
  const params: SqlParam[] = [];

  if (updates.title !== undefined) {
    assignments.push('title = ?');
    params.push(updates.title);
  }

  if (updates.author !== undefined) {
    assignments.push('author = ?');
    params.push(updates.author);
  }

  if (updates.year !== undefined) {
    assignments.push('year = ?');
    params.push(updates.year);
  }

  if (updates.description !== undefined) {
    assignments.push('description = ?');
    params.push(updates.description);
  }

  if (updates.rating !== undefined) {
    assignments.push('rating = ?');
    params.push(updates.rating);
  }

  if (updates.cover !== undefined) {
    assignments.push('coverUri = ?');
    params.push(await resolveCoverUri(updates.cover));
  }

  if (assignments.length > 0) {
    params.push(id);
    await executeSql(
      `UPDATE books SET ${assignments.join(', ')} WHERE id = ?;`,
      params,
    );
  }

  if (updates.tags !== undefined) {
    await replaceBookTags(id, updates.tags);
  }

  return getBookById(id);
}

export async function deleteBook(id: number): Promise<void> {
  await executeSql(`DELETE FROM books WHERE id = ?;`, [id]);
}
