import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";

const ProfileScreen = ({ route, navigation }) => {
  const db = useSQLiteContext();
  const currentUser = route.params?.currentUser;
  const [user, setUser] = useState(currentUser);

  const reload = async () => {
    if (!currentUser?.id) return;
    const fresh = await db.getFirstAsync("SELECT * FROM auth_users WHERE id = ?", [currentUser.id]);
    if (fresh) setUser(fresh);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your gallery.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await db.runAsync("UPDATE auth_users SET profileUri = ? WHERE id = ?", [uri, user.id]);
      reload();
    }
  };

  useEffect(() => { reload(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.container}>
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
  container: { alignItems: "center", paddingTop: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#e5e7eb" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  name: { fontSize: 22, fontWeight: "700", marginTop: 12, color: "#fff", fontFamily: "Comic Sans MS" },
  email: { fontSize: 14, color: "#fff", marginTop: 4, fontFamily: "Comic Sans MS" },
  bio: { fontSize: 14, color: "#fff", marginTop: 8, textAlign: "center", paddingHorizontal: 24, fontFamily: "Comic Sans MS" },
  addr: { fontSize: 13, color: "#fff", marginTop: 4, fontFamily: "Comic Sans MS" },
  actions: { marginTop: 16, width: "90%" },
  primaryBtn: { backgroundColor: "#111827", padding: 12, borderRadius: 10 },
  primaryText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontFamily: "Comic Sans MS" },
  secondaryBtn: { marginTop: 10, borderWidth: 1, borderColor: "#222", padding: 12, borderRadius: 10 },
  secondaryText: { color: "#fff", textAlign: "center", fontWeight: "600", fontFamily: "Comic Sans MS" },
  logoutBtn: { marginTop: 10, backgroundColor: "#b91c1c", padding: 12, borderRadius: 10 },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontFamily: "Comic Sans MS" },
});

export default ProfileScreen;
