import axios from 'axios';
import { Book, BookProvider } from './types';


export const Provider_OpenLibrary: BookProvider = {
  async search(query: string): Promise<Book[]> {
    const result = await axios.get('https://openlibrary.org/search.json', {
      params: { q: query, limit: 10 },
    });

    const docs = result.data?.docs ?? [];

    return docs.map((doc: any): Book => ({
      id: `ol-${doc.key}`,
      source: 'openlibrary',
      title: doc.title ?? 'Unknown title',
      author: doc.author_name?.[0] ?? 'Unknown author',
      year: doc.first_publish_year ?? null,
      description: null,
      coverUri: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      coverIds: doc.cover_i ? [Number(doc.cover_i)] : [],
      rating: doc.ratings_average ?? null,
      tags: doc.subject?.slice(0, 10) ?? [],
    }));
  },
};

export default Provider_OpenLibrary;