import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import React from 'react';
import { colors } from '../../utils/colors';
import { Book } from '../../utils/types';
import NotesSection from './NoteSection';
import { getBookById } from '../../utils/db';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ExpandableText from '../../components/ExpandableText';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type BookDetailsNavProp = NativeStackNavigationProp<RootStackParamList>;

const BookDetails = (item: any) => {
  const navigation = useNavigation<BookDetailsNavProp>();
  const local = item.route.params.book;

  /**  
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      getBookById(initial.id)
        .then(updated => {
          if (!isMounted) return;
          if (updated) setLocal(updated);
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }, [initial.id]),
  );
 */

  return (
    <View style={[styles.screenContainer]}>
      <Text
        style={{
          fontFamily: 'CormorantGaramond-Bold',
          fontSize: 36,
          alignSelf: 'center',
          color: colors.titleText,
          marginTop: 80,
        }}
      >
        In this Edition.
      </Text>
      <ScrollView style={[styles.modContainer]}>
        <View style={[styles.card, {}]}>
          <Image
            source={{ uri: `${local.coverUri}` }}
            style={{
              alignSelf: 'center',
              margin: 10,
              height: 350,
              aspectRatio: 2 / 3,
            }}
          ></Image>
          <Text style={styles.bookTitle}>{local.title}</Text>
          <Text style={styles.bookMeta}>{local.author}</Text>
          <Text style={styles.bookMeta}>{local.year}</Text>
          <ExpandableText
            text={local.description}
            numberOfLines={5}
            textStyle={styles.bookDescription}
          />
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => navigation.navigate('BookNotes', { book: local })}
              style={styles.notesButton}
            >
              <Text style={styles.notesButtonText}>Notes</Text>
            </Pressable>
            <Pressable onPress={() => {}} style={styles.coverButton}>
              <Text style={styles.notesButtonText}>Cover Art</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookDetails;

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

    borderRadius: 10,
    margin: 20,
    height: 'auto',
  },
  bookTitle: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 28,
    color: colors.bodyText,
    textAlign: 'center',
    marginTop: 6,
  },
  bookMeta: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 20,
    color: colors.bodyText,
    textAlign: 'center',
    marginTop: 2,
  },
  bookDescription: {
    fontFamily: 'CormorantGaramond-Italic',
    fontSize: 18,
    color: colors.bodyText,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  notesButton: {
    flex: 1,
    backgroundColor: colors.button,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  coverButton: {
    flex: 1,
    backgroundColor: colors.button,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  notesButtonText: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 19,
    color: colors.titleText,
    textAlign: 'center',
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
