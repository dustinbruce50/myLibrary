import SQLite from 'react-native-sqlite-2';
import { Book } from './types';
import RNFS from 'react-native-fs';


const db = SQLite.openDatabase('localsql');

export type NoteRow = {
    id: number;
    book_id: number | null;
    class: number;
    header: string;
    text: string;
    created_at: number;
};

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
        // Temporarily disable FK checks while dropping/recreating base tables.
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = OFF;`);
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
                    cover_ids TEXT,
                    primary_cover_id INTEGER,
                    description TEXT,
                    rating FLOAT,
                    rating_num INTEGER
                );`,
                [],
                () => resolve(true),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
        // Migrations for older installs (pre-cover_ids / primary_cover_id)
        db.transaction(tx => {
            tx.executeSql(
                `ALTER TABLE books ADD COLUMN cover_ids TEXT;`,
                [],
                () => {},
                (_tx, _error) => true,
            );
        });
        db.transaction(tx => {
            tx.executeSql(
                `ALTER TABLE books ADD COLUMN primary_cover_id INTEGER;`,
                [],
                () => {},
                (_tx, _error) => true,
            );
        });
        // Re-enable FK checks for tables created afterward.
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });

        // Create notes table (kept even if a book is removed/re-added later)
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    book_id INTEGER,
                    class INTEGER NOT NULL,
                    header TEXT NOT NULL DEFAULT '',
                    text TEXT NOT NULL DEFAULT '',
                    created_at INTEGER NOT NULL,
                    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
                );`,
                [],
                () => resolve(true),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
        // Migration for older installs (pre-header column)
        db.transaction(tx => {
            tx.executeSql(
                `ALTER TABLE notes ADD COLUMN header TEXT NOT NULL DEFAULT '';`,
                [],
                () => {},
                (_tx, _error) => true,
            );
        });
        db.transaction(tx => {
            tx.executeSql(
                `CREATE INDEX IF NOT EXISTS idx_notes_book_class ON notes(book_id, class);`,
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

export async function getNotesByBookAndClass(bookId: number, classInt: number) {
    return new Promise<NoteRow[]>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM notes WHERE book_id = ? AND class = ? ORDER BY created_at ASC, id ASC;`,
                [bookId, classInt],
                (_tx, results) => {
                    const notes: NoteRow[] = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        notes.push(results.rows.item(i));
                    }
                    resolve(notes);
                },
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}

export async function upsertNote(args: {
    id?: number;
    bookId: number;
    classInt: number;
    header: string;
    text: string;
}) {
    const createdAt = Date.now();
    return new Promise<number>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });
        if (args.id != null) {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE notes SET header = ?, text = ? WHERE id = ?;`,
                    [args.header, args.text, args.id],
                    () => resolve(args.id as number),
                    (_tx, error) => {
                        reject(error);
                        return false;
                    },
                );
            });
            return;
        }
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO notes (book_id, class, header, text, created_at) VALUES (?, ?, ?, ?, ?);`,
                [args.bookId, args.classInt, args.header, args.text, createdAt],
                (_tx, result) => resolve(result.insertId as number),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}

export async function deleteNote(id: number) {
    return new Promise<boolean>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `DELETE FROM notes WHERE id = ?;`,
                [id],
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
            tx.executeSql(`DELETE FROM notes;`);
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
                () => {
                    // Seed at least one note in every section for The Great Gatsby (book_id = 1)
                    const now = Date.now();
                    tx.executeSql(
                        `INSERT INTO notes (book_id, class, header, text, created_at) VALUES
                        (?, ?, ?, ?, ?),
                        (?, ?, ?, ?, ?),
                        (?, ?, ?, ?, ?),
                        (?, ?, ?, ?, ?),
                        (?, ?, ?, ?, ?),
                        (?, ?, ?, ?, ?);`,
                        [
                            1, 0, 'Nick', '“So we beat on, boats against the current…”', now + 1,
                            1, 1, 'Jay Gatsby', 'Mysterious, wealthy, obsessed with the past.', now + 2,
                            1, 2, 'Chapter 1', 'Introductions, first impressions, the green light.', now + 3,
                            1, 3, '', 'East Egg vs West Egg; the valley of ashes.', now + 4,
                            1, 4, '', 'What does the green light symbolize for me?', now + 5,
                            1, 5, '', 'This one feels like longing dressed up as glamour.', now + 6,
                        ],
                        () => resolve(true),
                        (_tx2, error2) => {
                            reject(error2);
                            return false;
                        },
                    );
                },
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}


export async function addBook(
    title: string,
    author: string,
    cover_i: number,
    coverIds: number[] = [],
    primaryCoverId?: number,
    year?: number,
    description: string = '',
    rating?: number,
    rating_num: number = 0,
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
        const chosenPrimaryCoverId = primaryCoverId ?? cover_i;
        const uniqueCoverIds = Array.from(
            new Set([chosenPrimaryCoverId, cover_i, ...coverIds].filter(Boolean)),
        ) as number[];
        const coverIdsJson = JSON.stringify(uniqueCoverIds);

        const filepath = await downloadCoverFromUrl(
            `https://covers.openlibrary.org/b/id/${chosenPrimaryCoverId}-M.jpg`,
            `cover_${chosenPrimaryCoverId}.jpg`,
        );

        //PRAGMA ON
        db.transaction(tx => {
            tx.executeSql(`PRAGMA foreign_keys = ON;`);
        });
        // Insert book into books table
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO books (title, author, year, description, coverUri, cover_ids, primary_cover_id, rating, rating_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [title, author, year ? year : 0, description , filepath, coverIdsJson, chosenPrimaryCoverId, rating, rating_num ],
                (_tx, result) => {
                    id = result.insertId;
                    console.log("All arguments inside addBook executeSql success callback:");
                    console.log(
                    `title: ${title},
                    author: ${author},
                    cover_i: ${cover_i},
                    year: ${year},
                    description: ${description},
                    rating: ${rating},
                    rating_num: ${rating_num},
                    filepath: ${filepath}`);
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

export async function getBookById(id: number) {
    return new Promise<Book | null>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM books WHERE id = ? LIMIT 1;`,
                [id],
                (_tx, results) => {
                    if (results.rows.length === 0) {
                        resolve(null);
                        return;
                    }
                    resolve(results.rows.item(0) as Book);
                },
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}

export async function setPrimaryCover(args: {
    bookId: number;
    coverId: number;
}) {
    const filepath = await downloadCoverFromUrl(
        `https://covers.openlibrary.org/b/id/${args.coverId}-M.jpg`,
        `cover_${args.coverId}.jpg`,
    );

    return new Promise<string>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `UPDATE books SET coverUri = ?, primary_cover_id = ? WHERE id = ?;`,
                [filepath, args.coverId, args.bookId],
                () => resolve(filepath),
                (_tx, error) => {
                    reject(error);
                    return false;
                },
            );
        });
    });
}
