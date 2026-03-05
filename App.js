import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import NewDeckScreen from './screens/NewDeckScreen';
import ManualCreateScreen from './screens/ManualCreateScreen';
import UploadScreen from './screens/UploadScreen';
import ModeSelectScreen from './screens/ModeSelectScreen';
import LearnScreen from './screens/LearnScreen';
import LearnCompleteScreen from './screens/LearnCompleteScreen';
import QuizScreen from './screens/QuizScreen';
import EndScreen from './screens/EndScreen';
import EditDeckScreen from './screens/EditDeckScreen';
import AppBar from './components/AppHeader';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: (props) => <AppBar {...props} />,
        }}
      >
        <Stack.Screen name="Home"          component={HomeScreen} />
        <Stack.Screen name="NewDeck"       component={NewDeckScreen} />
        <Stack.Screen name="Upload"        component={UploadScreen} />
        <Stack.Screen name="ModeSelect"    component={ModeSelectScreen} />
        <Stack.Screen name="EditDeck"      component={EditDeckScreen} />
        <Stack.Screen name="ManualCreate"  component={ManualCreateScreen}    options={{ headerShown: false }} />
        <Stack.Screen name="Learn"         component={LearnScreen}           options={{ headerShown: false }} />
        <Stack.Screen name="LearnComplete" component={LearnCompleteScreen}   options={{ headerShown: false }} />
        <Stack.Screen name="Quiz"          component={QuizScreen}            options={{ headerShown: false }} />
        <Stack.Screen name="End"           component={EndScreen}             options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
