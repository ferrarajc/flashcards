import React from 'react';
import { useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import CreateDeckScreen from './screens/CreateDeckScreen';
import ManualCreateScreen from './screens/ManualCreateScreen';
import UploadScreen from './screens/UploadScreen';
import QuizScreen from './screens/QuizScreen';
import EndScreen from './screens/EndScreen';
import EditDeckScreen from './screens/EditDeckScreen';
import AppHeader from './components/AppHeader';
import { BREAKPOINTS } from './hooks/useBreakpoint';

const Stack = createStackNavigator();

export default function App() {
  const { width } = useWindowDimensions();
  const isPhone = width < BREAKPOINTS.phone;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => isPhone
            ? { title: 'FlashyCards' }
            : { header: () => <AppHeader onHomePress={() => navigation.navigate('Home')} /> }
          }
        />
        <Stack.Screen
          name="CreateDeck"
          component={CreateDeckScreen}
          options={{ title: 'New Deck' }}
        />
        <Stack.Screen
          name="ManualCreate"
          component={ManualCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{ title: 'Upload' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false }}
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
  );
}
