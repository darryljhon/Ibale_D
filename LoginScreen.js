import React, { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);

      if (loggedInUser) {
        try {
          await db.runAsync("UPDATE auth_users SET profileUri = ? WHERE id = ?", [
            uri,
            loggedInUser.id,
          ]);
          Alert.alert("Updated", "Profile picture updated successfully!");
        } catch (err) {
          console.error("Error saving profile:", err);
        }
      }
    }
  };

  const handleLogin = async () => {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Enter email and password.");

    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM auth_users WHERE email = ? AND password = ?",
        [email, password]
      );

      if (user) {
        setLoggedInUser(user);
        setForm({ email: "", password: "" });
        setProfileImage(user.profileUri || null);
        loadOtherUsers(user.id);
        Alert.alert("Success", `Welcome back, ${user.name}!`);
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Login failed.");
    }
  };

  const loadOtherUsers = async (userId) => {
    try {
      const users = await db.getAllAsync(
        "SELECT * FROM auth_users WHERE id != ?",
        [userId]
      );
      setOtherUsers(users);
    } catch (error) {
      console.error("Load Users Error:", error);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() =>
        navigation.navigate("Messenger", {
          currentUser: loggedInUser,
          chatWithUser: item,
        })
      }
    >
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001F54" }}>
      <KeyboardAvoidingView
        style={{ flex: 1, padding: 20 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {!loggedInUser ? (
          // LOGIN SCREEN
          <View style={styles.loginContainer}>
            <Text style={styles.title}>Login</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9bb0d3"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9bb0d3"
              secureTextEntry
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.link}>Don’t have an account? Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // AFTER LOGIN VIEW
          <View style={{ flex: 1 }}>
            <View style={styles.profileSection}>
              <TouchableOpacity onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-circle-outline" size={100} color="#7fb3ff" />
                )}
              </TouchableOpacity>

              <Text style={styles.userNameBig}>{loggedInUser.name}</Text>
              <Text style={styles.userEmail}>{loggedInUser.email}</Text>
              <Text style={styles.changePhotoText}>Tap image to change photo</Text>
            </View>

            <Text style={styles.subtitle}>Select a user to message:</Text>

            <FlatList
              data={otherUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUser}
              style={{ flex: 1, marginTop: 10 }}
            />

            <TouchableOpacity style={styles.logoutBtn} onPress={() => {
              setLoggedInUser(null);
              setOtherUsers([]);
              setProfileImage(null);
            }}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#4a5d9a",
    backgroundColor: "#0a1a3c",
    color: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#004aad",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  link: {
    color: "#7fb3ff",
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d2e4ff",
    textAlign: "center",
    marginBottom: 10,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#7fb3ff",
  },
  userNameBig: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: "white",
  },
  changePhotoText: {
    fontSize: 12,
    color: "#9bb0d3",
    marginTop: 5,
  },
  userRow: {
    padding: 12,
    backgroundColor: "#0a1a3c",
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  userEmail: {
    fontSize: 14,
    color: "#9bb0d3",
  },
  logoutBtn: {
    backgroundColor: "#c62828",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default LoginScreen;