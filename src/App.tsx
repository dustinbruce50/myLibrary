/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/Login';
import { NavigationContainer } from '@react-navigation/native';
import { initializeDatabase, seedDatabase } from './utils/db';
import Tabnav from './navigators/Tabnav';
import BookDetails from './screens/Notes/BookDetails';
import { Book } from './utils/types';
import BookNotes from './navigators/BookNotesNav';
import CoverPicker from './screens/Notes/CoverPicker';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './screens/Home';

export type RootStackParamList = {
  Login: undefined;
  Tabnav: undefined;
  BookDetails: { book: Book };
  BookNotes: { book: Book };
  CoverPicker: { book: Book };
  Home: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  React.useEffect(() => {
    const initialize = async () => {
      await initializeDatabase();
      await seedDatabase();
    };
    initialize();
  }, []);

  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Tabnav"
            component={Tabnav}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookDetails"
            component={BookDetails}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookNotes"
            component={BookNotes}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CoverPicker"
            component={CoverPicker}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: 'green',
    flex: 1,
  },
});

export default App;
