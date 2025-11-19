import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
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
import { useSQLiteContext } from "expo-sqlite";

const RegisterScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    try {
      const existing = await db.getFirstAsync(
        "SELECT id FROM auth_users WHERE email = ?",
        [email]
      );
      if (existing) {
        return Alert.alert("Error", "Email already registered.");
      }
      await db.runAsync(
        "INSERT INTO auth_users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password]
      );
      Alert.alert("Success", "Registration complete! You can now log in.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      navigation.navigate("Login");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9bb0d3"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9bb0d3"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={{ marginLeft: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 }}
            >
              <Text style={{ color: "#111827" }}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((v) => !v)}
              style={{ marginLeft: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 }}
            >
              <Text style={{ color: "#111827" }}>{showConfirmPassword ? "Hide" : "Show"}</Text>
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
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25, textAlign: "center", color: "#fff", fontFamily: "Comic Sans MS" },
  input: { borderWidth: 1, borderColor: "#222", backgroundColor: "#111", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 15, fontFamily: "Comic Sans MS" },
  button: { backgroundColor: "#111827", padding: 14, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16, fontFamily: "Comic Sans MS" },
  link: { color: "#fff", textAlign: "center", marginTop: 12, fontSize: 16, fontFamily: "Comic Sans MS" },
});

export default RegisterScreen;
