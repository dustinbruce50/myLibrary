import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../utils/colors';

const Clubs = () => {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Book Clubs</Text>
    </View>
  )
}

export default Clubs

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  title: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 52,
    alignSelf: 'center',
    color: colors.titleText,
    marginTop: 20,
  },
});
