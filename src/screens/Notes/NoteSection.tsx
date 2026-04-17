import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../../utils/colors';
import { CirclePlus, CircleX } from 'lucide-react-native';
import TestNotes from './TestNotes';
import { deleteNote, getNotesByBookAndClass, upsertNote } from '../../utils/db';


type NoteSectionProps = {
  bookId: number;
  classOf: string;
  name: string;
  notes: string[];
};

type LocalNote = {
  id?: number;
  header: string;
  text: string;
};

const classStringToInt = (classOf: string) => {
  switch (classOf) {
    case 'Quotes':
      return 0;
    case 'Characters':
      return 1;
    case 'Chapters':
      return 2;
    case 'Setting':
      return 3;
    case 'Questions':
      return 4;
    case 'Personal':
      return 5;
    default:
      return 0;
  }
};

const shouldShowHeader = (classOf: string) =>
  classOf === 'Quotes' || classOf === 'Characters' || classOf === 'Chapters';

const NoteSection = ({ bookId, classOf, name, notes }: NoteSectionProps) => {
  const classInt = classStringToInt(classOf);
  const showHeader = shouldShowHeader(classOf);

  const [localNotes, setLocalNotes] = React.useState<LocalNote[]>(
    notes.length > 0 ? notes.map(n => ({ header: '', text: n })) : [{ header: '', text: '' }],
  );

  React.useEffect(() => {
    let isMounted = true;
    getNotesByBookAndClass(bookId, classInt)
      .then(rows => {
        if (!isMounted) return;
        if (rows.length === 0) {
          setLocalNotes([{ header: '', text: '' }]);
          return;
        }
        setLocalNotes(rows.map(r => ({ id: r.id, header: r.header ?? '', text: r.text ?? '' })));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [bookId, classInt]);

  const updateNoteText = (index: number, text: string) => {
    setLocalNotes(currentNotes =>
      currentNotes.map((note, noteIndex) =>
        noteIndex === index ? { ...note, text } : note,
      ),
    );
  };

  const updateNoteHeader = (index: number, header: string) => {
    setLocalNotes(currentNotes =>
      currentNotes.map((note, noteIndex) =>
        noteIndex === index ? { ...note, header } : note,
      ),
    );
  };

  const addNote = () => {
    setLocalNotes(currentNotes => [...currentNotes, { header: '', text: '' }]);
  };

  const saveNote = async (index: number) => {
    const note = localNotes[index];
    const id = await upsertNote({
      id: note.id,
      bookId,
      classInt,
      header: note.header,
      text: note.text,
    });
    setLocalNotes(currentNotes =>
      currentNotes.map((n, i) => (i === index ? { ...n, id } : n)),
    );
  };

  const removeNote = async (index: number) => {
    const note = localNotes[index];
    if (note?.id != null) {
      try {
        await deleteNote(note.id);
      } catch {
        return;
      }
    }
    setLocalNotes(currentNotes => {
      const next = currentNotes.filter((_n, i) => i !== index);
      return next.length > 0 ? next : [{ header: '', text: '' }];
    });
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderCard}>
        <Pressable onPress={addNote} style={styles.addButton}>
          <CirclePlus size={32} />
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>{name}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.notesContainer}
        showsVerticalScrollIndicator={false}
      >
        {localNotes.map((note, index) => (
          <View key={`${name}-${index}`} style={styles.noteCard}>
            <Pressable
              onPress={() => removeNote(index)}
              style={styles.deleteButton}
              hitSlop={10}
            >
              <CircleX size={32} color={'#8B3a3a'} />
            </Pressable>
            <View style={styles.noteCardContent}>
              <TestNotes
                classOf={classOf}
                headerValue={note.header}
                onChangeHeaderText={(text: string) =>
                  updateNoteHeader(index, text)
                }
                showHeader={showHeader}
                value={note.text}
                onChangeText={(text: string) => updateNoteText(index, text)}
                onSave={() => saveNote(index)}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};


export default NoteSection;

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeaderCard: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  lineRow: {
    flexWrap: 'wrap',
    //height: LINE_HEIGHT,
    borderBottomWidth: 3,
    borderBottomColor: colors.bodyText,
    paddingTop: -5,
    marginBottom: 10,
    height: 'auto',
    
  },
  cardTitle: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 24,
    color: colors.bodyText,
    flex: 1,
    textAlign: 'center',
  },
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
  notesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  noteCard: {
    position: 'relative',
    backgroundColor: colors.accent,
    borderRadius: 10,
    marginBottom: 18,
  },
  noteCardContent: {
    padding: 18,
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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
