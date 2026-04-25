import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewComponent,
} from 'react-native';
import { colors } from '../../utils/colors';
import { Book } from '../../utils/types';
import { ArrowLeft, Check } from 'lucide-react-native';
import { updateBook } from '../../utils/db';
//import { setPrimaryCover } from '../../utils/db';

const CoverPicker = (screenProps: any) => {
  const goBack = async () => {
    if (selected !== primary_cover_id) {
      setSaving(true);
      await updateBook(book.id, {
        cover: { openLibraryCoverId: selected as number },
      });
      setSaving(false);
      screenProps.navigation.goBack();
    }
  };

  const book = screenProps.route.params.book as Book;

  let ids: number[] = JSON.parse(book.coverIds as unknown as string);
  let primary_cover_id = Number(
    book.coverUri
      ?.slice(
        book.coverUri.lastIndexOf('_') + 1,
        book.coverUri.lastIndexOf('.jpg'),
      )
      .trim(),
  );

  const [selected, setSelected] = React.useState<number | null>(
    primary_cover_id,
  );
  const [saving, setSaving] = React.useState(false);

  return (
    <View style={styles.screenContainer}>
      <Pressable onPress={goBack} style={styles.backButton} hitSlop={10}>
        <ArrowLeft color={colors.titleText} size={28} />
      </Pressable>

      <Text style={styles.title}>Cover Art</Text>

      <FlatList
        data={ids}
        keyExtractor={(item, index) => String(item ?? index)}
        renderItem={({ item, index }) => {
          const uri = `https://covers.openlibrary.org/b/id/${item}-M.jpg`;
          return (
            <View>
              <Text style={{ fontSize: 36 }}>{index + 1}</Text>
              <Pressable
                onPress={() => {
                  setSelected(item);
                }}
                style={[
                  styles.coverTile,
                  selected === item && styles.coverTileSelected,
                ]}
              >
                <Image
                  source={{ uri }}
                  style={{
                    alignSelf: 'center',
                    margin: 10,
                    height: 250,
                    aspectRatio: 2 / 3,
                  }}
                />
                {selected === item && (
                  <View style={styles.checkBadge}>
                    <Check color={colors.titleText} size={20} />
                  </View>
                )}
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
};

export default CoverPicker;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 56,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 36,
    alignSelf: 'center',
    color: colors.titleText,
    marginTop: 80,
  },
  subtitle: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 16,
    alignSelf: 'center',
    color: colors.bodyText,
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  row: {
    gap: 10,
  },
  coverTile: {
    flex: 1,
    width: '100%',
    //backgroundColor: 'green',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    position: 'relative',
  },
  coverTileSelected: {
    alignSelf: 'center',
    borderWidth: 2,
    width: '50%',
    borderColor: colors.titleText,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
  },
  checkBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.titleText,
  },
  empty: {
    color: colors.bodyText,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});
