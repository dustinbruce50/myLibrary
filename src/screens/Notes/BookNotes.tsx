import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../../utils/colors';
import { Book } from '../../utils/types';
import NoteSection from './NoteSection';
import { ArrowLeft, Quote, UserStar, TableOfContents, Trees, MessageCircleQuestionIcon, MessageCircleMore } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
/**
 <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <BookHeart color={color} size={size} />
          ),
          tabBarStyle: { backgroundColor: colors.button },
        }}
      />
 */

const BookNotes = (screenProps: any) => {
  const local = screenProps.route.params.book as Book;
  const bookId = local.id;

  const QuotesTab = () => <NoteSection bookId={bookId} classOf="Quotes" name="Quotes" notes={[]} />;
  const CharactersTab = () => <NoteSection bookId={bookId} classOf="Characters" name="Character Notes" notes={[]} />;
  const ChaptersTab = () => <NoteSection bookId={bookId} classOf="Chapters" name="Chapter Notes" notes={[]} />;
  const SettingTab = () => <NoteSection bookId={bookId} classOf="Setting" name="Setting Notes" notes={[]} />;
  const QuestionsTab = () => <NoteSection bookId={bookId} classOf="Questions" name="Question Notes" notes={[]} />;
  const PersonalTab = () => <NoteSection bookId={bookId} classOf="Personal" name="Personal Notes" notes={[]} />;

  return (
    <View style={styles.screenContainer}>
      <Pressable
        onPress={() =>
          screenProps.navigation.navigate('BookDetails', { book: local })
        }
        style={styles.backButton}
        hitSlop={10}
      >
        <ArrowLeft color={colors.titleText} size={28} />
      </Pressable>
      <Text style={styles.title}>In The Margins.</Text>
      <Text style={styles.subtitle}>{local.title}</Text>

      <View style={styles.tabsContainer}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.titleText,
            tabBarInactiveTintColor: colors.bodyText,
            tabBarStyle: { backgroundColor: colors.button },
          }}
        >
          <Tab.Screen name="Quotes" component={QuotesTab} options={{ tabBarIcon: ({ color, size }) => (
            <Quote color={color} size={size} />
          )}}/>
          <Tab.Screen name="Characters" component={CharactersTab} options={{ tabBarIcon: ({ color, size }) => (
            <UserStar color={color} size={size} />
          )}}/>
          <Tab.Screen name="Chapters" component={ChaptersTab} options={{ tabBarIcon: ({ color, size }) => (
            <TableOfContents color={color} size={size} />
          )}}/>
          <Tab.Screen name="Setting" component={SettingTab} options={{ tabBarIcon: ({ color, size }) => (
            <Trees color={color} size={size} />
          )}}/>
          <Tab.Screen name="Questions" component={QuestionsTab} options={{ tabBarIcon: ({ color, size }) => (
            <MessageCircleQuestionIcon color={color} size={size} />
          )}}/>
          <Tab.Screen name="Personal" component={PersonalTab} options={{ tabBarIcon: ({ color, size }) => (
            <MessageCircleMore color={color} size={size} />
          )}}/>
        </Tab.Navigator>
      </View>
    </View>
  );
};

export default BookNotes;

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
    fontSize: 18,
    alignSelf: 'center',
    color: colors.bodyText,
    marginTop: 6,
    marginBottom: 6,
  },
  tabsContainer: {
    flex: 1,
  },
});
