import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Network from "../errors/Network";
import NotFound from "../errors/NotFound";
import Toast from "react-native-toast-message";
import { jwtDecode } from "jwt-decode";

const LoginScreen = ({ route, navigation }) => {
  const { message } = route.params || {};
  useEffect(() => {
    if (message) {
      Toast.show({
        text1: message,
        type: "error",
        position: "bottom",
        swipeable: true,
        keyboardOffset: 10,
        bottomOffset: 10,
      });
    }
  }, [message]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const storeData = async (data) => {
    try {
      await AsyncStorage.setItem("data", JSON.stringify(data));
      await AsyncStorage.setItem("myKey", data.stdprofile[0].regdno);
    } catch (e) {}
  };
  const [isConnected, setIsConnected] = useState(true);
  const storeTokenInDatabase = async (data) => {
    const data2 = { ...data.stdprofile[0] };

    try {
      const response = await fetch(
        "https://sports1.gitam.edu/auth/storeToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: data2.mobile,
            hostler: data2.hostler,
            gender: data2.gender,
            campus: data2.campus,
            name: data2.name,
            regdno: data2.regdno,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        navigation.navigate("Gym", { decoded });
      }
      if (!response.ok) {
        <NotFound />;
      }
    } catch (error) {
      <Network />;
    }
  };
  const checkInternetAndNavigate = async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      try {
        handleLogin();
      } catch (error) {
        setError(error);
      }
    } else {
      setIsConnected(false);
    }
  };
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://studentmobileapi.gitam.edu/Logingym",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UserName: username,
            Password: password,
          }),
        }
      );
      const data = await response.json();
      if (response.status === 200 || response.ok) {
        await storeData(data);
        await storeTokenInDatabase(data);
      } else {
        setError("Invalid Credentials");
      }
    } catch (error) {
      console.log("error: ", error);
      setError("Internal server error");
    } finally {
      setIsLoading(false);
    }
  };
  if (!isConnected) {
    return <Network />;
  }
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/vecteezy_the-cheerful-healthy-people-run-for-exercise-happily-with_35041939.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Login</Text>
          <TextInput
            style={[styles.input, error ? styles.errorInput : null]}
            placeholder="Enter User ID"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError(null);
            }}
          />
          <View style={[styles.passwordContainer, error && styles.errorInput]}>
            <TextInput
              style={styles.passworcinput}
              placeholder="Enter Password"
              value={password}
              secureTextEntry={!passwordVisible}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.iconContainer}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={styles.button}
            onPress={checkInternetAndNavigate}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <>
                <Text style={styles.buttonText}>Login</Text>
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  color="#fff"
                  style={styles.icon}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Team{" "}
            <Text style={styles.footerTextHighlight}>CATS, GITAM</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  flexGrow: {
    flexGrow: 1,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "transparent",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  logo: {
    width: "100%",
    height: 400,
    backgroundColor: "transparent",
  },
  formContainer: {
    width: "100%",
    paddingBottom: 20,
  },
  loginText: {
    fontSize: 45,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 60,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  passworcinput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconContainer: {
    padding: 10,
  },
  errorfield: {
    width: "100%",
    height: 60,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  errorInput: {
    borderColor: "red",
  },
  button: {
    width: "100%",
    height: 60,
    backgroundColor: "#007367",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginRight: 10,
  },
  icon: {
    color: "#fff",
  },
  footer: {
    alignItems: "center",
    padding: 10,
  },
  footerText: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  footerTextHighlight: {
    color: "#007367",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
    textAlign: "left",
  },
});
export default LoginScreen;
