import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import LoginScreen from "./components/screens/LoginScreen";
// import HomeScreen from "./components/screens/HomeScreen";
// import Home from "./components/screens/Home";
// import Slots from "./components/screens/Slots";
// import History from "./components/screens/History";
// import NotFound from "./components/errors/NotFound";
// import Network from "./components/errors/Network";
import Toast from "react-native-toast-message";
import SplashScreen from "./components/screens/SplashScreen";

const LoginScreen = lazy(() => import("./components/screens/LoginScreen"));
const HomeScreen = lazy(() => import("./components/screens/HomeScreen"));
const Slots = lazy(() => import("./components/screens/LoginScreen"));
const History = lazy(() => import("./components/screens/History"));
const NotFound = lazy(() => import("./components/errors/NotFound"));
const Network = lazy(() => import("./components/errors/Network"));

const Stack = createNativeStackNavigator();
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { ActivityIndicator } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId = "75369b66-078c-4788-85a8-12a0cdd0d224";
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {});

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#007367",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <SplashScreen />
            </Suspense>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <LoginScreen />
            </Suspense>
          )}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Gym"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <HomeScreen />
            </Suspense>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Booked Slots"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <Slots />
            </Suspense>
          )}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="History"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <History />
            </Suspense>
          )}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="NotFound"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <NotFound />
            </Suspense>
          )}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Network"
          component={() => (
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}
            >
              <Network />
            </Suspense>
          )}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
