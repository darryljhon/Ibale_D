import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) { setForm({ ...form, profileUri: result.assets[0].uri }); }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.container}>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#e5e7eb", alignSelf: "center", marginBottom: 16 },
  placeholder: { justifyContent: "center", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#222", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#111", color: "#fff", fontFamily: "Comic Sans MS" },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  saveBtn: { backgroundColor: "#111827", padding: 12, borderRadius: 10 },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontFamily: "Comic Sans MS" },
});

export default EditProfileScreen;
