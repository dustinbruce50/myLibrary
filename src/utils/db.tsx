import SQLite from 'react-native-sqlite-2';
import { Book } from './types';
import RNFS from 'react-native-fs';


const db = SQLite.openDatabase('localsql');

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


export async function initDB() {
    return new Promise((resolve, reject) => {
        //PRAGMA ON
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });
        // Drop book table if it exists
        db.transaction(tx => {
            tx.executeSql(`DROP TABLE IF EXISTS books;`);
        });
        // Create books table
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    year INTEGER,
                    coverUri TEXT,
                    description TEXT,
                    rating FLOAT
                );`,
                [],
                () => resolve(true),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
        db.transaction(tx => {
            tx.executeSql(`DROP TABLE IF EXISTS tags;`);
        });
        // Create tags table
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE
                );`,
                [],
                () => resolve(true),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
        //drop books_tags table if it exists
        db.transaction(tx => {
            tx.executeSql(`DROP TABLE IF EXISTS books_tags;`);
        });
        // Create book_tags table
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS book_tags (
                    book_id INTEGER NOT NULL,
                    tag_id INTEGER NOT NULL,
                    PRIMARY KEY (book_id, tag_id),
                    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
                );`,
                [],
                () => resolve(true),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
});}
export async function seedDB() {
    const gatsbyUri = await copyCoverFromAssets('tgg.jpg');
    const mockingbirdUri = await copyCoverFromAssets('tkam.jpg');
    const n1984Uri = await copyCoverFromAssets('1984.jpg');
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`DELETE FROM books;`);
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO books (title, author, year, description, coverUri) VALUES 
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?);`,
                    [
                        'The Great Gatsby',
                        'F. Scott Fitzgerald',
                        1925,
                        'A novel about the American dream.',
                        gatsbyUri,
                        'To Kill a Mockingbird',
                        'Harper Lee',
                        1960,
                        'A novel about racial injustice in the Deep South.',
                        mockingbirdUri,
                        '1984',
                        'George Orwell',
                        1949,
                        'A dystopian novel about totalitarianism and surveillance.',
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
    description: string = '',
    year?: number,
    rating?: number,
    tags: string[] = [],
    
) {
    let id: number | null = null;
    console.log(`all arguments passed to addBook:
        title: ${title},
        author: ${author},
        cover_i: ${cover_i},
        year: ${year},
        tags: ${tags}
    `);

    
    return new Promise(async (resolve, reject) => {
        const filepath = await downloadCoverFromUrl(
            `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`,
            `cover_${cover_i}.jpg`,
        );

        //PRAGMA ON
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });
        // Insert book into books table
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO books (title, author, year, description, coverUri) VALUES (?, ?, ?, ?, ?);`,
                [title, author, year ? year : 0, description , filepath],
                (_tx, result) => {
                    id = result.insertId;
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
        //insert tags into tags table and book_tags table
        if (tags.length > 0) {
            db.transaction(tx => {
                tags.forEach(tag => {
                    tx.executeSql(
                        `INSERT OR IGNORE INTO tags (name) VALUES (?);`,
                        [tag],
                        () => {
                            tx.executeSql(
                            `SELECT id FROM tags WHERE name = ?;`,
                            [tag],
                            (_tx, result) => {
                                if (result.rows.length === 0) {
                                    console.log('Failed to retrieve tag ID after insertion for tag:', tag);
                                    return;
                                }
                            const tagId = result.rows.item(0).id;
                            tx.executeSql(
                                `INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?);`,
                                [id, tagId],
                                () => {},
                                (_tx, error) => {
                                    console.log('Failed to add book_tag to DB:', error);
                                    return false;
                                },
                            );
                        },
                        (_tx, error) => {
                            console.log('Failed to add tag to DB:', error);
                            return false;
                        },
                    );});
                });
            });
        };
    });
}

export async function getBooks() {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });
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
                }
            );
        });
    });
}
