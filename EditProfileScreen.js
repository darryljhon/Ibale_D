import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";

const EditProfileScreen = ({ route, navigation }) => {
  const db = useSQLiteContext();
  const currentUser = route.params?.currentUser;
  const [form, setForm] = useState({ name: "", email: "", bio: "", address: "", profileUri: null });

  const load = async () => {
    const fresh = await db.getFirstAsync("SELECT * FROM auth_users WHERE id = ?", [currentUser.id]);
    if (fresh) setForm({ name: fresh.name || "", email: fresh.email || "", bio: fresh.bio || "", address: fresh.address || "", profileUri: fresh.profileUri || null });
  };

  useEffect(() => { load(); }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission required", "Please allow access to your gallery."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setForm({ ...form, profileUri: uri });
      try {
        await db.runAsync("UPDATE auth_users SET profileUri = ? WHERE id = ?", [uri, currentUser.id]);
        Alert.alert("Updated", "Profile picture updated");
      } catch (e) { Alert.alert("Error", "Failed to update profile picture"); }
    }
  };

  const save = async () => {
    try {
      await db.runAsync(
        "UPDATE auth_users SET name = ?, email = ?, bio = ?, address = ?, profileUri = ? WHERE id = ?",
        [form.name, form.email, form.bio, form.address, form.profileUri, currentUser.id]
      );
      Alert.alert("Saved", "Profile updated");
      navigation.goBack();
    } catch (e) { Alert.alert("Error", "Update failed"); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={"height"}
          keyboardVerticalOffset={0}
        >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={pickImage}>
          {form.profileUri ? (
            <Image source={{ uri: form.profileUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]} />
          )}
        </TouchableOpacity>
        <TextInput style={styles.input} placeholder="Full Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} />
        <TextInput style={[styles.input, styles.multiline]} placeholder="Short Bio" multiline value={form.bio} onChangeText={(t) => setForm({ ...form, bio: t })} />
        <TextInput style={styles.input} placeholder="Address (optional)" value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} />
        <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, justifyContent: 'center', backgroundColor: "#f5f5f5" },
  avatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 24, borderWidth: 4, borderColor: "#0084ff" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#d0d0d0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, backgroundColor: "#fff", color: "#111", fontSize: 15 },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  saveBtn: { backgroundColor: "#0084ff", paddingVertical: 14, borderRadius: 12, marginTop: 8, elevation: 3, shadowColor: "#0084ff", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "800", fontSize: 16 },
});

export default EditProfileScreen;
