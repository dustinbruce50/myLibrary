import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../utils/colors';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  style?: any;
};

const AppButton = ({ title, onPress, style }: AppButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={10}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.button,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginTop: 10,
    minWidth: '70%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 19,
    color: colors.titleText,
    textAlign: 'center',
  },
});
