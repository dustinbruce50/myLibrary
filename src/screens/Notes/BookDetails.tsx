import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../../utils/colors';
import { Book } from '../../utils/types';

const BookDetails = (book: any) => {
  const local = book.route.params.book as Book;
  console.log('deeper: ', local);
  console.log('BookDetails local array:', local);
  console.log('BookDetails received book:', book);

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
        In The Margins.
      </Text>
      <View style={[styles.modContainer]}>
        <View style={[styles.card, {  }]}>
          <Image
            source={{ uri: `${local.coverUri}` }}
            style={{
              alignSelf: 'center',
              margin: 10,
              height: 350,
              aspectRatio: 2 / 3,
            }}
          ></Image>
          <Text>{local.title}</Text>
          <Text>{local.author}</Text>
          <Text>{local.year}</Text>
          <Text>{local.description}</Text>
          
        </View>
      </View>
      <Text>BookDetails</Text>
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
    //height:'auto',
    borderRadius: 10,
    margin: 20,
    height: 'auto',
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
