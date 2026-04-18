import { Book } from './types';
import openLibraryProvider from './Provider_OpenLibrary';
import googleBooksProvider from './Provider_GoogleBooks';


export type ProviderName = 'openlibrary' | 'google';

export async function searchBooks(
  providerName: ProviderName,
  query: string,
  page: number,
  action: string | null = null
): Promise<Book[]> {
  switch (providerName) {
    case 'openlibrary':
      console.log('openlibrary provider');
      return await openLibraryProvider.search(query, page, action);
    case 'google':
      console.log('google books provider');
      return await googleBooksProvider.search(query, page, action);
    default:
      return [];
  }
}