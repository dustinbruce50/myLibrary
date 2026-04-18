//import { Text, View } from 'react-native'
import React, { Component } from 'react';
import axios from 'axios';
import { Book, BookProvider } from './types';
import { g_b_key } from '@env';
const BASE_API_URL = 'https://www.googleapis.com/books/v1/volumes';
export const Provider_GoogleBooks: BookProvider = {
  async search(
    query: string,
    page: number,
    action: string | null = null,
  ): Promise<Book[]> {
    const result = await axios.get(BASE_API_URL, {
      params: {
        q: query,
        projection: 'full',
        key: g_b_key,
        //fields:
        //  'items(id,volumeInfo( title,subtitle,authors,publishedDate,description,pageCount,imageLinks(smallThumbnail)))',
        startIndex: (page - 1) * 10,
      },
    });
    console.log('result: ', result);
    const items = result.data?.items ?? [];

    return items.map((item: any): Book => {
      const volume = item.volumeInfo ?? {};
      return {
        id: `google-${item.id}`,
        title: volume.title ?? 'Unknown title',
        subtitle: volume.subtitle ?? null,
        author: volume.authors?.join(', ') ?? 'Unknown author',
        year: Number(String(volume.publishedDate).slice(0, 4)) || null,
        description: volume.description ?? null,
        numPages: volume.pageCount ?? null,
        coverUri: volume.imageLinks?.smallThumbnail ?? null,
        coverIds: [],
        rating: volume.averageRating ?? null,
        tags: volume.categories ?? [],
      };
    });
  },
};

export default Provider_GoogleBooks;
