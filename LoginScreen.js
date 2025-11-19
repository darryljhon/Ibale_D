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
  const [passwordVisible, setPasswordVisible] = useState(false);

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
        // navigate into the Main tab navigator and pass the currentUser
        setForm({ email: "", password: "" });
        navigation.reset({ index: 0, routes: [{ name: "Main", params: { currentUser: user } }] });
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1, padding: 20 }}
        behavior={"height"}
        keyboardVerticalOffset={0}
      >
        {!loggedInUser ? (
          // LOGIN SCREEN
          <View style={styles.loginContainer}>
            <Text style={styles.title}>Login</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!passwordVisible}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setPasswordVisible((v) => !v)}>
                <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

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
                  <Ionicons name="person-circle-outline" size={100} color="#111" />
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
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
    color: "#111",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "#f9f9f9",
    color: "#111",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#0084ff",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    elevation: 3,
    shadowColor: "#0084ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 16,
  },
  link: {
    color: "#0084ff",
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#0084ff",
    backgroundColor: "#e5e7eb",
  },
  userNameBig: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
    color: "#111",
  },
  changePhotoText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  userRow: {
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  inputRow: { position: 'relative', justifyContent: 'center' },
  eyeButton: { position: 'absolute', right: 14, top: 12, height: 36, width: 36, justifyContent: 'center', alignItems: 'center' },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 13,
    borderRadius: 12,
    marginVertical: 12,
    elevation: 2,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  logoutText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 16,
  },
});

export default LoginScreen;