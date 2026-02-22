import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import CreateDeckScreen from './screens/CreateDeckScreen';
import QuizScreen from './screens/QuizScreen';
import EndScreen from './screens/EndScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'FlashyCards' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
