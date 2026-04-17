import {
  Text,
  StyleSheet,
  View,
  Image,
  ScrollView,
  Pressable,
  FlatList,
  StatusBar,
} from 'react-native';
import React, { Component  } from 'react';
import { colors } from '../utils/colors';
import { addBook, getBooks, seedDB } from '../utils/db';
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useFocusEffect(
    React.useCallback(() => {
      const initialize = async () => {
        await loadBooks();
      };
      initialize();
    }, []),
  );

  const loadBooks = async () => {
    const books = await getBooks();
    setBooks(books as Book[]);
  };

  return (
    <SafeAreaView
      style={[
        {
          //width: '100%',
          //height: '100%',
          flex: 1,
          //justifyContent: 'flex-end',
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

      <FlatList
        data={books}
        style={styles.modContainer}
        keyExtractor={(book: Book) => book.id.toString()}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text
              style={[{ fontFamily: 'CormorantGaramond-Bold', fontSize: 26 }]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                { fontFamily: 'CormorantGaramond-Regular', fontSize: 22 },
              ]}
            >
              {item.author} - {item.year}
            </Text>
            <ExpandableText
              text={item.description}
              numberOfLines={3}
              textStyle={[
                { fontFamily: 'CormorantGaramond-Italic', fontSize: 20 },
              ]}
            />

            {item.coverUri && (
              <Image
                source={{ uri: `${item.coverUri}` }}
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
                navigation.navigate('BookDetails', { book: item as Book })
              }
            />
          </View>
        )}
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
