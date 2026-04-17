export type Book = {
  id: number;
  title: string;
  author: string;
  year: number | null;
  description?: string | null;
  coverUri?: string | null;
  rating?: number | null;
  tags: string[];
};
