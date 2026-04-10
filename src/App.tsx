/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Login from './screens/Login';
import Home from './screens/Home';
import { NavigationContainer } from '@react-navigation/native';
import { initDB, seedDB } from './utils/db';
import RNFS from 'react-native-fs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Tabnav from './navigators/Tabnav';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function App() {

  React.useEffect(() => {
    const initialize = async () => {
      await initDB();
      await seedDB();
      
    };
    initialize();
  }, []);


  const isDarkMode = useColorScheme() === 'dark';

  return (
    
<NavigationContainer>
  <SafeAreaProvider>
    <Stack.Navigator initialRouteName='Login'>
      <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
      <Stack.Screen name="Tabnav" component={Tabnav} options={{headerShown: false}}/>
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
