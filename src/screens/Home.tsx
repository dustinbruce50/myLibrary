import {
  Text,
  StyleSheet,
  View,
  Image,
  ScrollView,
  Pressable,
  FlatList,
  StatusBar,
  Button,
} from 'react-native';
import React, { Component } from 'react';
import { colors } from '../utils/colors';
import { listBooks, dbResetDatabase } from '../utils/db';
import { Book } from '../utils/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import ExpandableText from '../components/ExpandableText';
import AppButton from '../components/AppButton';

export default function Home() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useFocusEffect(
    React.useCallback(() => {
      const initialize = async () => {
        await loadBooks();
      };
      initialize();
    }, []),
  );
  const resetDatabase = async () => {
    await dbResetDatabase();
    await listBooks();
  };

  const loadBooks = async () => {
    const books = await listBooks();
    setBooks(books as Book[]);
  };

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar barStyle={'light-content'} />
      <Text
        style={{
          fontFamily: 'CormorantGaramond-Bold',
          fontSize: 52,
          alignSelf: 'center',
          color: colors.titleText,
          marginTop: 20,
        }}
      >
        Your Library
      </Text>
      <Button title="Reset Database" onPress={resetDatabase} />
      <FlatList
        data={books}
        style={styles.modContainer}
        keyExtractor={(item: any) => {
          return item.id.toString();
        }}
        renderItem={data => {
          const book = data.item;
          console.log('Inside Home FlatList Rendering book: ', book);
          return (
            <View style={styles.card}>
              <Text
                style={[{ fontFamily: 'CormorantGaramond-Bold', fontSize: 26 }]}
              >
                {book.title}
              </Text>
              <Text
                style={[
                  { fontFamily: 'CormorantGaramond-Regular', fontSize: 22 },
                ]}
              >
                {book.author} - {book.year}
              </Text>
              <ExpandableText
                text={book.description}
                numberOfLines={3}
                textStyle={[
                  { fontFamily: 'CormorantGaramond-Italic', fontSize: 20 },
                ]}
              />

              {book.coverUri && (
                <Image
                  source={{ uri: `${book.coverUri}` }}
                  style={{
                    alignSelf: 'center',
                    margin: 10,
                    height: 250,
                    aspectRatio: 2 / 3,
                  }}
                />
              )}
              <AppButton
                title="Open Details"
                onPress={() =>
                  navigation.navigate('BookDetails', { book: book })
                }
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  modContainer: {
    padding: 10,
    paddingBottom: 400,
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
});
