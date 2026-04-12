import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../utils/colors';

type LinedInputProps = {
  classOf?: string;
  headerValue?: string;
  onChangeHeaderText?: (text: string) => void;
  showHeader?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSave?: () => void;
  rows?: number;
};

const LINE_HEIGHT = 30;


const TestNotes = ({
  classOf,
  headerValue = '',
  onChangeHeaderText,
  showHeader: showHeaderProp,
  value,
  onChangeText,
  onSave,
  rows = 10,
}: LinedInputProps) => {
  const [rowCount, setRowCount] = React.useState(rows);
  const minRows = rows;
  const inputHeight = rowCount * LINE_HEIGHT;
  const localClass = classOf || '';
  const showHeader =
    typeof showHeaderProp === 'boolean'
      ? showHeaderProp
      : Boolean(
          localClass === 'Characters' ||
            localClass === 'Quotes' ||
            localClass === 'Chapters',
        );
  const headerTop = -11;
  const bodyTop = showHeader ? LINE_HEIGHT + 3 : 3;
  return (
    <View style={{marginTop: 20}}>
      <View style={[styles.container, { minHeight: inputHeight }]}>
        {Array.from({ length: rowCount }).map((_, index) => (
          <View key={index} style={styles.lineRow} />
        ))}

        {showHeader && (
          <TextInput
            value={headerValue}
            onChangeText={onChangeHeaderText}
            placeholder={
              localClass === 'Quotes'
                ? 'Who said it?'
                : localClass === 'Chapters'
                  ? 'Which chapter?'
                  : 'Character name'
            }
            placeholderTextColor="#888"
            style={[styles.headerInput, { top: headerTop }]}
          />
        )}

        <TextInput
          textBreakStrategy='highQuality'
          multiline={true}
          value={value}
          scrollEnabled={false}
          onChangeText={onChangeText}
          onContentSizeChange={(e) => {
                  
                      const height = e.nativeEvent.contentSize.height;
                      const nextRows = Math.max(minRows, Math.ceil(height / LINE_HEIGHT));
                      setRowCount(prev => (prev !== nextRows ? nextRows : prev));
                     
                      
                  }}
          textAlignVertical="top"
          style={[styles.input, { top: bodyTop }]}
          placeholder="Write your notes..."
          placeholderTextColor="#888"
        />
      </View>

      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </View>
  );
};

export default TestNotes;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  lineRow: {
    paddingTop: 0,
    height: LINE_HEIGHT,
    borderBottomWidth: 3,
    borderBottomColor: '#d8d8d8',
  },
  input: {
    position: 'absolute',
    //top: 3,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 20,
    lineHeight: LINE_HEIGHT,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 6,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  headerInput: {
    position: 'absolute',
    
    left: 0,
    right: 0,
    height: 55,
    //height: LINE_HEIGHT,
    fontSize: 20,
    lineHeight: LINE_HEIGHT,
    paddingHorizontal: 6,
    includeFontPadding: false,
  },
  saveButton: {
    alignSelf: 'center',
    backgroundColor: colors.button,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  saveButtonText: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 18,
    color: colors.titleText,
  },
});
