export type Book = {
  id: number;
  title: string;
  author: string;
  year: number;
  description: string;
  coverUri: string;
  cover_ids?: string;
  primary_cover_id?: number;

};
