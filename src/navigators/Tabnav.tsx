import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import AddB from '../screens/AddB';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();

const Tabnav = () => {
  return (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} options={{headerShown: false,tabBarStyle: { backgroundColor: colors.button }}}/>
        <Tab.Screen name="AddB" component={AddB} options={{headerShown: false, tabBarStyle: { backgroundColor: colors.button }}}/>
    </Tab.Navigator>
  )
}

export default Tabnav