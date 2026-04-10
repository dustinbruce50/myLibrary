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
import React from 'react';
import { colors } from '../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import axios from 'axios';
import { Book } from '../utils/types';
import { addBook } from '../utils/db';

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


const AddB = () => {
    const [searchResults, setSearchResults] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');


    React.useEffect(() => {
        console.log('Search results updated: ', searchResults);
    }, [searchResults]);

    const fetchBooks = async (
        searchTerm: string,
        page: number = 1,
        limit: number = 5,
    ) => {
        console.log('Fetching book data...');
        let result;
        setSearchResults([]);
        console.log(
            'Search URL: ',
            `https://openlibrary.org/search.json?q=${encodeURIComponent(
                searchTerm,
            )}`,
        );
        try {
            result = await axios.get(`https://openlibrary.org/search.json?`, {
                params: {
                    q: searchTerm,
                    page,
                    limit,
                },
                headers: {
                    'User-Agent':
                        'myLibrary (Dustin Bruce, dustinbruce50@gmail.com)',
                },
            });
            console.log('API response: ', result);
        } catch (error) {
            console.error('Error fetching book data: ', error);
        }
        if (result?.status === 200) {
            setSearchResults(result?.data?.docs || []);
        }
        console.log('Search results: ', searchResults);
    };

    return (
        <SafeAreaView style={styles.screenContainer}>
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
                    },
                ]}
            >
                <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={[
                        styles.textInput,
                        {
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 10,
                            paddingLeft: 12,
                            paddingRight: 50,
                            width: '80%',
                            alignSelf: 'center',
                            backgroundColor: '#fff',
                            right: 0,
                        },
                    ]}
                ></TextInput>
                <Pressable
                    style={{
                        position: 'absolute',
                        right: 65,
                        top: 4,
                    }}
                    onPress={openCamera}
                >
                    <Image
                        source={require('../../assets/cam.png')}
                        style={{
                            height: 50,
                            width: 40,
                        }}
                    />
                </Pressable>
                <Pressable onPress={() => fetchBooks(searchTerm)}>
                    <Text
                        style={{
                            alignSelf: 'center',
                            fontFamily: 'CormorantGaramond-Bold',
                            fontSize: 20,
                            color: colors.titleText,
                        }}
                    >
                        Search
                    </Text>
                </Pressable>
                <FlatList
                    data={searchResults}
                    style={[
                        styles.modContainer,
                        { width: '100%', position: 'relative' },
                    ]}
                    keyExtractor={(item: any) => item.key.toString()}
                    renderItem={data => {
                        const book = data.item;
                        return (
                            searchResults && (
                                <View style={styles.card}>
                                    <Text
                                        style={[
                                            {
                                                fontFamily:
                                                    'CormorantGaramond-Bold',
                                                fontSize: 26,
                                            },
                                        ]}
                                    >
                                        {book.title}
                                    </Text>
                                    <Text
                                        style={[
                                            {
                                                fontFamily:
                                                    'CormorantGaramond-Regular',
                                                fontSize: 22,
                                            },
                                        ]}
                                    >
                                        {book.author_name} - {book.year}
                                    </Text>
                                    {/*}
                                    <Text
                                        style={[
                                            {
                                                fontFamily:
                                                    'CormorantGaramond-Italic',
                                                fontSize: 20,
                                            },
                                        ]}
                                    >
                                        {book.description}
                                    </Text>
                                      */}
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

                                    <Pressable
                                        onPress={async () => {
                                            console.log('Adding book with data:');
                                            console.log(`title: ${book.title}, author: ${book.author_name}, cover: ${book.cover_i}, year: ${book.first_publish_year}`);
                                            const author =
                                            Array.isArray(book.author_name)
                                              ? book.author_name.join(', ')
                                              : (book.author_name ?? 'Unknown');
                                            try{ await addBook(
                                                String(book.title)  ,
                                                String(author),
                                                book.cover_i,
                                                book.first_publish_year)
                                            }
                                            catch (error) {
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
                                            transform: [
                                                { scale: pressed ? 0.95 : 1 },
                                            ],
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
                />
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
        padding: 10,
        paddingBottom: 40,
        marginVertical: 5,
        borderRadius: 5,
        //height: 'auto',
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
