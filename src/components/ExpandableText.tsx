import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../utils/colors';

type ExpandableTextProps = {
  text?: string | null;
  numberOfLines?: number;
  textStyle?: any;
};

const ExpandableText = ({
  text,
  numberOfLines = 3,
  textStyle,
}: ExpandableTextProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const [showToggle, setShowToggle] = React.useState(false);
  const [measured, setMeasured] = React.useState(false);

  if (!text) return null;
  const shouldShowToggle = showToggle || text.length > numberOfLines * 80;

  return (
    <View>
      {!measured && (
        <Text
          style={[textStyle, styles.measureText]}
          onTextLayout={(e) => {
            const lines = e.nativeEvent.lines?.length ?? 0;
            setShowToggle(lines > numberOfLines);
            setMeasured(true);
          }}
        >
          {text}
        </Text>
      )}
      <Text
        style={textStyle}
        numberOfLines={expanded ? undefined : numberOfLines}
      >
        {text}
      </Text>
      {shouldShowToggle && (
        <Pressable onPress={() => setExpanded(v => !v)} style={styles.toggle}>
          <Text style={styles.toggleText}>{expanded ? 'less' : 'more'}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ExpandableText;

const styles = StyleSheet.create({
  measureText: {
    position: 'absolute',
    opacity: 0.01,
    zIndex: -1,
    left: 0,
    right: 0,
    top: 0,
  },
  toggle: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
  },
  toggleText: {
    fontFamily: 'CormorantGaramond-Bold',
    color: colors.bodyText,
    fontSize: 16,
  },
});
