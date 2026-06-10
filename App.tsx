import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { store } from "./store";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoBold: require("./assets/fonts/Roboto-Bold.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [isSplashImageLoaded, setSplashImageLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (isSplashImageLoaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isSplashImageLoaded, fontsLoaded]);

 if (!fontsLoaded || !appIsReady || !isSplashImageLoaded) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("./assets/images/splash.png")}
          style={styles.splashImageFull}
          resizeMode="cover"
          onLoad={() => setSplashImageLoaded(true)}
          onError={() => setSplashImageLoaded(true)}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Provider store={store}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </AuthProvider>
  ); // SafeAreaView нужно??
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  splashImageFull: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});