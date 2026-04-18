export type Book = {
  id: number;
  title: string;
  author: string;
  year: number | null;
  description?: string | null;
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
  title: string;
  author: string;
  year?: number | null;
  description?: string | null;
  rating?: number | null;
  tags?: string[];
  cover?: BookCoverInput;
  coverIds?: string[]
};

export type UpdateBookInput = {
  title?: string;
  author?: string;
  year?: number | null;
  description?: string | null;
  rating?: number | null;
  tags?: string[];
  cover?: BookCoverInput;
};