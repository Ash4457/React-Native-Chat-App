import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { PaperProvider } from "react-native-paper";

import { theme } from "@/theme";
import React from "react";

const firebaseConfig = {
  apiKey: "AIzaSyB9xgpJshFpPInJLCSha_711SXuxiFsfPA",
  authDomain: "chatapp-30f98.firebaseapp.com",
  projectId: "chatapp-30f98",
  storageBucket: "chatapp-30f98.appspot.com",
  messagingSenderId: "413017064259",
  appId: "1:413017064259:web:d5f3bdfe682751cef325f6"
};

const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
getFirestore(app);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(app)/(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(app)/(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)/chat" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{
              headerTitleAlign: "center",
              headerTitle: "Sign In",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              headerTitleAlign: "center",
              headerTitle: "Create Account",
              presentation: "modal",
            }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
