import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  FlatList,
  Button,
} from 'react-native';
import React, { JSX, useRef } from 'react';
import { colors } from '../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import axios from 'axios';
import { Book } from '../utils/types';
import { addBook } from '../utils/db';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Camera } from 'lucide-react-native';

const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

const openCamera = async () => {
  await requestCameraPermission();
  const result = await launchCamera({
    mediaType: 'photo',
    cameraType: 'back',
    saveToPhotos: false,
  });
  if (result.didCancel) {
    console.log('User cancelled camera');
  } else if (result.errorCode) {
    console.log('Camera error: ', result.errorMessage);
    return;
  }

  const uri = result.assets?.[0]?.uri;
  if (uri) {
    console.log('Captured image URI: ', uri);
    // Here you can handle the captured image URI, e.g., save it to state or upload it
  } else {
    console.log('No image URI returned');
  }
};

const BASE_API_URL = 'https://openlibrary.org/search.json?q=';
const BASE_API_URL_TAGS = 'https://openlibrary.org';

let rating_stars: JSX.Element[] = [
  <Ionicons name="star" size={20} color="#FFD700" />,
  <Ionicons name="star" size={20} color="#FFD700" />,
  <Ionicons name="star" size={20} color="#FFD700" />,
  <Ionicons name="star" size={20} color="#FFD700" />,
  <Ionicons name="star" size={20} color="#FFD700" />,
];

const AddB = () => {
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  //const [pageLast, setPageLast] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [cachePages, setCachePages] = React.useState<{
    [key: number]: any[];
  }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const listRef = useRef<FlatList>(null);

  React.useEffect(() => {
    console.log('Search results updated: ', searchResults);
  }, [searchResults]);

  const fetchTagsAndCovers = async (key: string) => {
    let result;
    let tags: string[] = [];
    let covers: number[] = [];
    try {
      result = await axios.get(`${BASE_API_URL_TAGS}${key}.json`, {
        params: {
          fields:
            'title,subject_places,subject_people,subject_times,subjects,covers,',
        },
        headers: {
          'User-Agent': 'myLibrary (Dustin Bruce, dustinbruce50@gmail.com)',
        },
      });
    } catch (error) {
      console.error('Error fetching tags: ', error);
    } finally {
      if (result?.status === 200) {
        console.log('Tag API response: ', result);
      }
    }
    for (const field of [
      'subject_places',
      'subject_people',
      'subject_times',
      'subjects',
    ]) {
      console.log(`Checking for tags in field: ${field}`);
      if (result?.data?.[field]) {
        tags = tags.concat(result.data[field]);
      }
    }
    console.log('Extracted tags: ', tags);

    //clean tags
    //remove (year-year) from tags or (year- ) or (year)
    //remove date ranges without parenthesis
    //remove anything in parentheses
    //remove anything after --
    tags = tags.map((tag: string) =>
      tag
        .replace(/\(\d{4}-\d{4}\)/g, '')
        .replace(/\(\d{4}-\s*\)/g, '')
        .replace(/\(\d{4}\)/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/--.*/g, '')
        .replace(/\d{4}-\d{4}/g, '')
        .replace(/\d{4}-\s*/g, '')
        .replace(/\d{4}/g, '')
        //.replace(/\(.*?\)/g, '')
        .trim(),
    );
    //take anything seperated by a : ; or , and split into separate tags
    tags = tags.flatMap((tag: string) =>
      tag.split(/[:;,]+/).map((t: string) => t.trim()),
    );
    //dedup and remove empty tags
    tags = Array.from(new Set(tags)).filter((tag: string) => tag.length > 0);

    console.log('Tags after cleaning: ', tags);
    if (Array.isArray(result?.data?.covers)) {
      covers = result.data.covers.filter((c: any) => typeof c === 'number');
    }
    return { tags, covers };
  };

  const fetchBooks = async (
    searchTerm: string,
    action: string | null = null,
    limit: number = 5,
  ) => {
    let page = currentPage;
    if (!searchTerm.trim()) {
      console.log('Search term is empty, skipping fetch');
      setSearchResults([]);
      setCachePages({});
      setCurrentPage(1);
      return;
    }

    console.log('action: ', action);

    //caching and page num logic
    if (action == 'forward') {
      if (!cachePages[page]) {
        console.log('Caching current page: ', currentPage);
        setCachePages(prev => ({ ...prev, [currentPage]: searchResults }));
      }
      page = currentPage + 1;
    } else if (action == 'backward') {
      if (!cachePages[page]) {
        console.log('Caching current page: ', currentPage);
        setCachePages(prev => ({ ...prev, [currentPage]: searchResults }));
      }
      page = currentPage - 1;
    } else {
      page = currentPage;
    }
    //cache loading
    if (cachePages[page]) {
      console.log('Loading page from cache: ', page);
      setSearchResults(cachePages[page]);
      setCurrentPage(page);
      return;
    } else {
      setIsLoading(true);
    }

    console.log(
      'fetch books called with searchTerm: ',
      searchTerm,
      ' page: ',
      page,
    );
    console.log(
      'Search URL: ',
      `${BASE_API_URL}${encodeURIComponent(
        searchTerm,
      )}&page=${page}&limit=${limit}`,
    );
    let result;
    try {
      result = await axios.get(
        `${BASE_API_URL}${encodeURIComponent(
          searchTerm,
        )}&page=${page}&limit=${limit}`,
        {
          params: {
            q: searchTerm,
            page,
            limit,
            fields:
              'key,description,title,subtitle,author_name,cover_i,first_publish_year,ratings_average,ratings_count,number_of_pages_median,',
          },
          headers: {
            'User-Agent': 'myLibrary (Dustin Bruce, dustinbruce50@gmail.com)',
          },
        },
      );
      console.log('Book API response: ', result);
    } catch (error) {
      console.error('Error fetching book data: ', error);
    }
    if (result?.status === 200) {
      setCurrentPage(page);
      setSearchResults(result?.data?.docs || []);
      setIsLoading(false);
    }
    console.log('Search results: ', searchResults);
  };

  return (
    <SafeAreaView style={[styles.screenContainer]}>
      <Text
        style={{
          fontFamily: 'CormorantGaramond-Bold',
          fontSize: 36,
          alignSelf: 'center',
          color: colors.titleText,
          marginTop: 20,
        }}
      >
        Your next addition...
      </Text>
      <View
        style={[
          styles.modContainer,
          {
            width: '100%',
            position: 'relative',
            justifyContent: 'center',
            height: '100%',
            opacity: isLoading ? 0.1 : 1,
          },
        ]}
      >
        <TextInput
          value={searchTerm}
          keyboardType="default"
          onChangeText={setSearchTerm}
          style={[
            styles.textInput,
            {
              borderWidth: 1,
              backgroundColor: '#fff',
            },
          ]}
        ></TextInput>
        <Pressable
          style={{
            position: 'absolute',
            right: 50,
            top: 0,
          }}
          onPress={openCamera}
        >
          <Camera size={40} color={colors.bodyText} />
        </Pressable>
        <Pressable
          onPress={() => {
            fetchBooks(searchTerm);
          }}
        >
          <Text
            style={{
              alignSelf: 'center',
              fontFamily: 'CormorantGaramond-Bold',
              fontSize: 25,
              color: colors.titleText,
              borderColor: colors.button,
              borderWidth: 2,
              paddingHorizontal: 20,
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: -10,
            }}
          >
            Search
          </Text>
        </Pressable>
        <FlatList
          ref={listRef}
          fadingEdgeLength={0.1}
          data={searchResults}
          contentContainerStyle={{ paddingBottom: 0 }}
          style={[styles.modContainer, { width: '100%', position: 'relative' }]}
          keyExtractor={(item: any) =>{
            return item.key.toString();
          }}
          renderItem={data => {
            
            const book = data.item;
            console.log('Inside FlatList Rendering book: ', book);
            return (
              searchResults && (
                <View style={styles.card}>
                  <Text
                    style={[
                      {
                        fontFamily: 'CormorantGaramond-Bold',
                        fontSize: 36,
                      },
                    ]}
                  >
                    {book.title}
                  </Text>
                  <Text
                    style={[
                      {
                        fontFamily: 'Roboto',
                        fontSize: 20,
                        marginBottom: 20,
                      },
                    ]}
                  >
                    {book.author_name &&
                    Array.isArray(book.author_name) &&
                    book.author_name.length > 0
                      ? `${book.author_name.join(', ')} - ${
                          book.first_publish_year
                        }`
                      : `Unknown Author - ${book.first_publish_year}`}
                  </Text>

                  <Text
                    style={[
                      {
                        fontFamily: 'CormorantGaramond-Italic',
                        fontSize: 18,
                        color: colors.bodyText,
                      },
                    ]}
                  >
                    {book.description && book.description.length > 140
                      ? `${book.description.substring(0, 140)}...`
                      : book.description}
                  </Text>

                  {book.cover_i && (
                    <Image
                      source={{
                        uri: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
                      }}
                      style={{
                        alignSelf: 'center',
                        margin: 10,
                        height: 250,
                        aspectRatio: 2 / 3,
                      }}
                    />
                  )}
                  <Text style={{ textAlign: 'center' }}>
                    Pages: {book.number_of_pages_median || 'N/A'}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      let icon_name;
                      if (book.ratings_average >= i + 1) {
                        icon_name = 'star';
                      } else if (book.ratings_average >= i + 0.5) {
                        icon_name = 'star-half';
                      } else {
                        icon_name = 'star-outline';
                      }
                      return (
                        <Ionicons
                          key={i}
                          name={icon_name as any}
                          size={20}
                          color="#FFD700"
                        />
                      );
                    })}
                    <Text>({book.ratings_count || 0})</Text>
                  </View>

                  <Pressable
                    onPress={async () => {
                      console.log('Adding book with data:');
                      console.log(
                        `title: ${book.title}, author: ${book.author_name}, cover: ${book.cover_i}, year: ${book.first_publish_year}`,
                      );
                      const author = Array.isArray(book.author_name)
                        ? book.author_name.join(', ')
                        : book.author_name ?? 'Unknown';
                      try {
                        const extras: any = await fetchTagsAndCovers(book.key);
                        await addBook(
                          String(book.title),
                          String(author),
                          book.cover_i,
                          extras?.covers ?? [],
                          book.cover_i,
                          book.first_publish_year,
                          book.description || '',
                          book.ratings_average, 
                          book.ratings_count,
                          extras?.tags ?? [],
                        );
                      } catch (error) {
                        console.error('Error adding book:', error);
                      }
                    }}
                    style={({ pressed }) => ({
                      backgroundColor: colors.button,
                      width: '50%',
                      alignSelf: 'center',
                      padding: 10,
                      borderRadius: 10,
                      shadowColor: '#000',
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        color: '#fff',

                        textAlign: 'center',
                      }}
                    >
                      Add Book
                    </Text>
                  </Pressable>
                </View>
              )
            );
          }}
          ListFooterComponent={
            <>
              {searchResults.length > 1 && (
                <View
                  style={{
                    //justifyContent: 'center',
                    width: '90%',
                    backgroundColor: colors.button,
                    //alignItems: 'flex-start',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    //paddingBottom: 500,
                    marginBottom: 50,
                    borderRadius: 10,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    marginTop: -30,
                  }}
                >
                  <Pressable
                    disabled={currentPage === 1}
                    style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    onPress={() => {
                      {
                        console.log('are we calling backward?');
                        fetchBooks(searchTerm, 'backward');
                      }
                    }}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={58}
                      color="black"
                      style={{ paddingHorizontal: 20 }}
                    />
                    <Text style={{ alignSelf: 'center' }}>Prev Page</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      {
                        console.log('are we calling forward?');
                        fetchBooks(searchTerm, 'forward');
                      }
                    }}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={58}
                      color="black"
                      style={{ paddingHorizontal: 20 }}
                    />
                    <Text style={{ alignSelf: 'center' }}>Next Page</Text>
                  </Pressable>
                </View>
              )}
            </>
          }
        />
        {searchResults.length === 0 && (
          <Text
            style={{
              top: 150,
              position: 'absolute',
              //bottom: 10,
              alignSelf: 'center',
              fontFamily: 'CormorantGaramond-Bold',
              fontSize: 30,
              color: colors.titleText,
              textAlign: 'center',
            }}
          >
            Search for your favorite book by name, or hit the camera icon to
            scan a barcode
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AddB;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  modContainer: {
    padding: 0,
    paddingBottom: 10,
    marginVertical: 5,
    //borderRadius: 5,
  },
  card: {
    padding: 30,
    backgroundColor: colors.accent,
    //height:'auto',
    borderRadius: 10,
    margin: 20,
  },
  textInput: {
    height: 40, // <-- This works!
    borderWidth: 2,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});
