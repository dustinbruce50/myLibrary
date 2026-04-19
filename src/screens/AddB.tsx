import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import React, { useRef } from 'react';
import { colors } from '../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import axios from 'axios';
import { createBook } from '../utils/db';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Camera } from 'lucide-react-native';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { g_b_key } from '@env';
import { searchBooks } from '../utils/Book_Search';
import { Book } from '../utils/types';

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

const AddB = () => {
  const [searchResults, setSearchResults] = React.useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [cachePages, setCachePages] = React.useState<{
    [key: number]: any[];
  }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const listRef = useRef<FlatList>(null);

  React.useEffect(() => {
    console.log('Search results updated: ', searchResults);
  }, [searchResults]);

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
            opacity: isLoading ? 0.5 : 1,
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
          //onPress={openCamera}
        >
          <Camera size={40} color={colors.bodyText} />
        </Pressable>
        <Pressable
          onPress={async () => {
            setCurrentPage(1);
            setIsLoading(true);
            let results = await searchBooks('google', searchTerm, 1);
            setSearchResults(results);
            setIsLoading(false);
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
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
          keyExtractor={(item: any) => {
            return item.id.toString();
          }}
          renderItem={data => {
            const book = data.item;
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
                    {book.author} - {book.year}
                  </Text>
                  {book.cover.url && (
                    <Image
                      source={{
                        uri: book.cover.url,
                      }}
                      style={{
                        alignSelf: 'center',
                        margin: 10,
                        height: 250,
                        aspectRatio: 2 / 3,
                      }}
                    />
                  )}
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

                  <Text style={{ textAlign: 'center' }}>
                    Pages: {book.numPages || 'N/A'}
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
                      if (book.rating >= i + 1) {
                        icon_name = 'star';
                      } else if (book.ratings >= i + 0.5) {
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
                        `title: ${book.title}, author: ${book.author}, cover: ${book.cover.url}, year: ${book.year}`,
                      );

                      try {
                        await createBook(
                          {
                            title: String(book.title),
                            subtitle: book.subtitle,
                            author: book.author.map
                              ? book.author.map((a: { name: string }) => a.name)
                              : book.author,
                            year: book.year,
                            description: book.description || '',
                            rating: book.rating,
                            cover: { url: book.cover.url, filename: book.id },
                          },

                          //book.ratings_count,
                          //extras?.tags ?? [],
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
                    onPress={async () => {
                      {
                        setCurrentPage(currentPage - 1);
                        setIsLoading(true);
                        listRef.current?.scrollToOffset({
                          offset: 0,
                          animated: true,
                        });
                        let results = await searchBooks(
                          'google',
                          searchTerm,
                          currentPage - 1,
                        );
                        setSearchResults(results);
                        setIsLoading(false);
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
                    onPress={async () => {
                      {
                        setIsLoading(true);
                        listRef.current?.scrollToOffset({
                          offset: 0,
                          animated: true,
                        });
                        setCurrentPage(currentPage + 1);
                        let results = await searchBooks(
                          'google',
                          searchTerm,
                          currentPage + 1,
                        );
                        setSearchResults(results);
                        setIsLoading(false);
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
