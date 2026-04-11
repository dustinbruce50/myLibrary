import { View, Text } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import AddB from '../screens/AddB';
import { colors } from '../utils/colors';
import { BookHeart, BookPlus } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const Tabnav = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.titleText,
        tabBarInactiveTintColor: colors.bodyText,
      }}
    >
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
      <Tab.Screen
        name="AddB"
        component={AddB}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <BookPlus color={color} size={size} />
          ),
          tabBarStyle: { backgroundColor: colors.button },
        }}
      />
    </Tab.Navigator>
  );
};

export default Tabnav;
