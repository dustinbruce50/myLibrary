export type Book = {
  id: number | string;
  title: string;
  subtitle?: string;
  author: string;
  year: number | null;
  description?: string | null;
  numPages?: number | null;
  coverUri?: string | null;
  rating?: number | null;
  tags: string[];
  coverIds?: string[];

};
export type SqlParam = string | number | null;

export type BookCoverInput = {
  assetFilename?: string;
  openLibraryCoverId?: number;
  uri?: string;
  url?: string;
  filename?: string;
};

export type CreateBookInput = {
  id?: number | string;
  title?: string | null;
  subtitle?: string| null;
  author?: string| null;
  year?: number | null;
  description?: string | null;
  numPages?: number | null;
  coverUri?: string | null;
  rating?: number | null;
  tags?: string[]| null;
  coverIds?: string[]| null;
  cover?: BookCoverInput| null;
};

export type UpdateBookInput = {
  id: number | string;
  title: string;
  subtitle?: string;
  author: string;
  year: number | null;
  description?: string | null;
  numPages?: number | null;
  coverUri?: string | null;
  rating?: number | null;
  tags: string[];
  coverIds?: string[];
};

export interface BookProvider {
  search(query: string, page: number, action: string | null): Promise<Book[]>;
}

export type Note = {
  id: number | null;
  bookId: number;
  classOf: number;
  header: string;
  text: string;
};

export type UpsertNoteInput = {
  id?: number;
  bookId: number;
  classOf: number;
  header: string;
  text: string;
};

export type NoteSectionProps = {
  bookId: number;
  classOf: string;
  name: string;
  notes: string[];
};