import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";
import EncodeScreen from "../screens/EncodeScreen";
import DecodeScreen from "../screens/DecodeScreen";
import SplashScreen from "../screens/SplashScreen";
import SavedFilesScreen from "../screens/SavedFilesScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"; // ✅ FIX

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* After login */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Encode" component={EncodeScreen} />
      <Stack.Screen name="Decode" component={DecodeScreen} />
      <Stack.Screen name="SavedFiles" component={SavedFilesScreen} />
    </Stack.Navigator>
  );
}
