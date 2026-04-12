import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../utils/colors';
import { Book } from '../../utils/types';
import { ArrowLeft, Check } from 'lucide-react-native';
import { setPrimaryCover } from '../../utils/db';

const parseCoverIds = (book: Book): number[] => {
  const anyBook: any = book as any;
  const raw = anyBook.cover_ids;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((n: any) => typeof n === 'number');
    }
  } catch {}
  return [];
};

const CoverPicker = (screenProps: any) => {
  const book = screenProps.route.params.book as Book;
  const coverIds = React.useMemo(() => {
    const ids = parseCoverIds(book);
    if (ids.length > 0) return ids;
    const primary = (book as any).primary_cover_id;
    return typeof primary === 'number' ? [primary] : [];
  }, [book]);

  const [selected, setSelected] = React.useState<number | null>(
    (book as any).primary_cover_id ?? null,
  );
  const [saving, setSaving] = React.useState(false);

  const choose = async (coverId: number) => {
    setSelected(coverId);
    setSaving(true);
    try {
      await setPrimaryCover({ bookId: book.id, coverId });
    } finally {
      setSaving(false);
      screenProps.navigation.goBack();
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Pressable
        onPress={() => screenProps.navigation.goBack()}
        style={styles.backButton}
        hitSlop={10}
      >
        <ArrowLeft color={colors.titleText} size={28} />
      </Pressable>

      <Text style={styles.title}>Cover Art</Text>
      <Text style={styles.subtitle}>{book.title}</Text>

      <FlatList
        data={coverIds}
        keyExtractor={id => String(id)}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const uri = `https://covers.openlibrary.org/b/id/${item}-M.jpg`;
          const isSelected = selected === item;
          return (
            <Pressable
              disabled={saving}
              onPress={() => choose(item)}
              style={[styles.coverTile, isSelected && styles.coverTileSelected]}
            >
              <Image source={{ uri }} style={styles.coverImage} />
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Check size={16} color={colors.titleText} />
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No alternate covers found for this book.
          </Text>
        }
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
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    position: 'relative',
  },
  coverTileSelected: {
    borderWidth: 2,
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

