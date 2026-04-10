import SQLite from 'react-native-sqlite-2';
import { Book } from './types';
import RNFS from 'react-native-fs';

export async function copyCoverFromAssets(filename: string): Promise<string> {
    const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    try {
        await RNFS.copyFileAssets(`covers/${filename}`, destPath);
        // Return the file URI for use in <Image />
        return `file://${destPath}`;
    } catch (e) {
        console.error(
            'Failed to copy asset:',
            e,
            'Asset path:',
            `covers/${filename}`,
            'Destination path:',
            destPath,
        );
        throw e;
    } finally {
        
    }
}

export async function downloadCoverFromUrl(
    url: string,
    filename: string,
): Promise<string> {
    const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    try {
        const result = await RNFS.downloadFile({
            fromUrl: url,
            toFile: destPath,
        }).promise;
        console.log(`info inside downloadCoverFromUrl:
URL: ${url}
filename: ${filename}
destPath: ${destPath}
result: ${JSON.stringify(result)}
          
          `);
        if (result.statusCode === 200) {
            return `file://${destPath}`;
        } else {
            throw new Error(`Failed to download cover: ${result.statusCode}`);
        }
    } catch (e) {
        console.error(
            'Failed to download cover:',
            e,
            'URL:',
            url,
            'Destination path:',
            destPath,
        );
        throw e;
    } finally {
        
    }
}

const db = SQLite.openDatabase('localsql');

export async function initDB() {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`DROP TABLE IF EXISTS books;`);
        });
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    year INTEGER,
                    coverUri TEXT
                );`,
                [],
                () => resolve(true),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}
export async function seedDB() {
    const gatsbyUri = await copyCoverFromAssets('tgg.jpg');
    const mockingbirdUri = await copyCoverFromAssets('tkam.jpg');
    const n1984Uri = await copyCoverFromAssets('1984.jpg');
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`DELETE FROM books;`);
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO books (title, author, year, coverUri) VALUES 
                (?, ?, ?, ?),
                (?, ?, ?, ?),
                (?, ?, ?, ?);`,
                    [
                        'The Great Gatsby',
                        'F. Scott Fitzgerald',
                        1925,
                        gatsbyUri,
                        'To Kill a Mockingbird',
                        'Harper Lee',
                        1960,
                        mockingbirdUri,
                        '1984',
                        'George Orwell',
                        1949,
                        n1984Uri,
                    ],
                    () => resolve(true),
                    (_tx, error) => {
                        reject(error);
                        return false;
                    },
                );
            });
        });
    });
}

export async function addBook(
    title: string,
    author: string,
    cover_i: number,
    year?: number,
    
) {
    console.log(`all arguments passed to addBook:
        title: ${title},
        author: ${author},
        cover_i: ${cover_i},
        year: ${year},
    `);
    return new Promise(async (resolve, reject) => {
        const filepath = await downloadCoverFromUrl(
            `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`,
            `cover_${cover_i}.jpg`,
        );
        
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO books (title, author, year, coverUri) VALUES (?, ?, ?, ?);`,
                [title, author, year ? year : 0, filepath],
                () => {
                    
                    resolve(true);
                },
                (_tx, error) => {
                    console.log('all arguments inside addBook executeSql error callback:');
                    console.log(`title: ${title},
                    _tx: ${JSON.stringify(_tx)},
                    author: ${author},
                    cover_i: ${cover_i},
                    year: ${year},
                    filepath: ${filepath}`);
                    console.log('Failed to add book to DB:', error, error.code, error.message);
                    reject(error);
                    return false;
                },
            );
        });
    });
}

export async function getBooks() {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM books;`,
                [],
                (_tx, results) => {
                    const books: Book[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        books.push(results.rows.item(i));
                    }
                    
                    resolve(books);
                },
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}
