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
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginTop: 10,
    minWidth: '70%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 18,
    color: colors.titleText,
    textAlign: 'center',
  },
});

