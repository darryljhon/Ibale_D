import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from "expo-sqlite";

const RegisterScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    try {
      await db.runAsync(
        "INSERT INTO auth_users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password]
      );
      // Registration successful — fetch the created user and enter the app
      const user = await db.getFirstAsync(
        "SELECT * FROM auth_users WHERE email = ? AND password = ?",
        [email, password]
      );
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      if (user) {
        navigation.reset({ index: 0, routes: [{ name: "Main", params: { currentUser: user } }] });
      } else {
        Alert.alert("Success", "Registration complete! You can now log in.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Register Error:", error);
      if (error.message?.includes("UNIQUE constraint failed")) {
        Alert.alert("Error", "Email already registered.");
      } else {
        Alert.alert("Error", "Registration failed.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
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
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { paddingRight: 44 }]}
              placeholder="Confirm Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!confirmVisible}
              value={form.confirmPassword}
              onChangeText={(text) =>
                setForm({ ...form, confirmPassword: text })
              }
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setConfirmVisible((v) => !v)}>
              <Ionicons name={confirmVisible ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 10 }}>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 28,
    textAlign: "center",
    color: "#111",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  inputRow: { position: 'relative', justifyContent: 'center' },
  eyeButton: { position: 'absolute', right: 14, top: 12, height: 36, width: 36, justifyContent: 'center', alignItems: 'center' },
  button: {
    backgroundColor: "#0084ff",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#0084ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
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
});

export default RegisterScreen;