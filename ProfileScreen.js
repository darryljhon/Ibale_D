import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ route, navigation }) => {
  const db = useSQLiteContext();
  const currentUser = route.params?.currentUser;
  const [user, setUser] = useState(currentUser);

  const reload = async () => {
    if (!currentUser?.id) return;
    const fresh = await db.getFirstAsync("SELECT * FROM auth_users WHERE id = ?", [currentUser.id]);
    if (fresh) setUser(fresh);
  };

  // Reload when screen comes into focus so changes propagate from other screens
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [currentUser?.id])
  );

  const pickImageFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your gallery.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your camera.");
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const pickImage = async () => {
    Alert.alert("Change Photo", "Choose a source", [
      { text: "Take Photo", onPress: async () => {
          const uri = await takePhoto();
          if (uri) await saveProfileUri(uri);
        }
      },
      { text: "Choose from Library", onPress: async () => {
          const uri = await pickImageFromLibrary();
          if (uri) await saveProfileUri(uri);
        }
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const saveProfileUri = async (uri) => {
    try {
      setUser((prev) => ({ ...(prev || {}), profileUri: uri }));
      const targetId = user?.id || currentUser?.id;
      if (targetId) {
        await db.runAsync("UPDATE auth_users SET profileUri = ? WHERE id = ?", [uri, targetId]);
      }
      Alert.alert("Updated", "Profile picture updated successfully!");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update profile picture");
    }
  };

  useEffect(() => { reload(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={pickImage}>
          {user?.profileUri ? (
            <Image source={{ uri: user.profileUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]} />
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name || ""}</Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        {user?.address ? <Text style={styles.addr}>{user.address}</Text> : null}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("EditProfile", { currentUser: user })}>
            <Text style={styles.primaryText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("About", { currentUser: user })}>
            <Text style={styles.secondaryText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: "Login" }] })}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20, textAlign: "center", color: "#111" },
  container: { alignItems: "center", paddingTop: 16, paddingHorizontal: 16, flex: 1, backgroundColor: "#f5f5f5" },
  avatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: "#e5e7eb", borderWidth: 4, borderColor: "#0084ff" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  name: { fontSize: 26, fontWeight: "800", marginTop: 16, color: "#111" },
  email: { fontSize: 15, color: "#6b7280", marginTop: 6 },
  bio: { fontSize: 15, color: "#374151", marginTop: 12, textAlign: "center", paddingHorizontal: 16, fontStyle: "italic" },
  addr: { fontSize: 14, color: "#6b7280", marginTop: 6 },
  actions: { marginTop: 28, width: "100%" },
  primaryBtn: { backgroundColor: "#0084ff", paddingVertical: 13, borderRadius: 12, elevation: 2, shadowColor: "#0084ff", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3 },
  primaryText: { color: "#fff", textAlign: "center", fontWeight: "800", fontSize: 16 },
  secondaryBtn: { marginTop: 12, borderWidth: 2, borderColor: "#0084ff", paddingVertical: 12, borderRadius: 12, backgroundColor: "#fff" },
  secondaryText: { color: "#0084ff", textAlign: "center", fontWeight: "700", fontSize: 16 },
  logoutBtn: { marginTop: 12, backgroundColor: "#ef4444", paddingVertical: 13, borderRadius: 12, elevation: 2, shadowColor: "#ef4444", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3 },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "800", fontSize: 16 },
});

export default ProfileScreen;
