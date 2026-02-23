import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from './screens/HomeScreen';
import CreateDeckScreen from './screens/CreateDeckScreen';
import QuizScreen from './screens/QuizScreen';
import EndScreen from './screens/EndScreen';
import EditDeckScreen from './screens/EditDeckScreen';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import { BREAKPOINTS } from './hooks/useBreakpoint';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeDrawer() {
  const { width } = useWindowDimensions();
  const isPhone = width < BREAKPOINTS.phone;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        drawerType: isPhone ? 'front' : 'permanent',
        drawerStyle: { width: 240 },
        // Phone: show default header with auto hamburger button
        // Tablet/desktop: no built-in header — AppHeader renders above everything
        headerShown: isPhone,
        title: 'FlashyCards',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const isPhone = width < BREAKPOINTS.phone;
  const navigationRef = useNavigationContainerRef();

  return (
    <View style={{ flex: 1 }}>
      {!isPhone && (
        <AppHeader onHomePress={() => navigationRef.current?.navigate('Home')} />
      )}
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={HomeDrawer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateDeck"
            component={CreateDeckScreen}
            options={{ title: 'New Deck' }}
          />
          <Stack.Screen
            name="Quiz"
            component={QuizScreen}
            options={({ route }) => ({ title: route.params.deck.name })}
          />
          <Stack.Screen
            name="End"
            component={EndScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditDeck"
            component={EditDeckScreen}
            options={({ route }) => ({ title: route.params.deck.name })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
