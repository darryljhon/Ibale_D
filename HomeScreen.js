import React from "react";
import ScreenWrapper from "./ScreenWrapper";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation, route }) => {
  const currentUser = route.params?.currentUser;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          {currentUser?.profileUri && (
            <Image source={{ uri: currentUser.profileUri }} style={styles.profileImage} />
          )}
          <Text style={styles.title}>Welcome{currentUser?.name ? ` ${currentUser.name}` : ""}!</Text>
          <Text style={styles.subtitle}>Explore the app features below</Text>
        </View>

        <View style={styles.buttonsSection}>
          <TouchableOpacity style={[styles.btn, styles.chatBtn]} onPress={() => navigation.navigate("Chat") }>
            <View style={styles.btnIconContainer}>
              <Ionicons name="chatbubbles-outline" size={28} color="#0084ff" />
            </View>
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Messages</Text>
              <Text style={styles.btnDesc}>Chat with friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#0084ff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.profileBtn]} onPress={() => navigation.navigate("Profile", { currentUser })}>
            <View style={styles.btnIconContainer}>
              <Ionicons name="person-outline" size={28} color="#7c3aed" />
            </View>
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Profile</Text>
              <Text style={styles.btnDesc}>View your profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#7c3aed" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.usersBtn]} onPress={() => navigation.navigate("Users") }>
            <View style={styles.btnIconContainer}>
              <Ionicons name="people-outline" size={28} color="#ec4899" />
            </View>
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Users</Text>
              <Text style={styles.btnDesc}>Browse all users</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ec4899" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.commentBtn]} onPress={() => navigation.navigate("Comments", { user: currentUser?.name || 'Guest' }) }>
            <View style={styles.btnIconContainer}>
              <Ionicons name="chatbubbles-outline" size={28} color="#06b6d4" />
            </View>
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Comments</Text>
              <Text style={styles.btnDesc}>View and post comments</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#06b6d4" />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerSection: { alignItems: "center", marginBottom: 32, marginTop: 12 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, backgroundColor: "#e5e7eb", borderWidth: 3, borderColor: "#0084ff" },
  title: { fontSize: 28, fontWeight: "800", color: "#111", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#6b7280", marginTop: 8, textAlign: "center" },
  buttonsSection: { flex: 1 },
  btn: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 12, backgroundColor: "#fff", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  chatBtn: { borderLeftWidth: 4, borderLeftColor: "#0084ff" },
  profileBtn: { borderLeftWidth: 4, borderLeftColor: "#7c3aed" },
  usersBtn: { borderLeftWidth: 4, borderLeftColor: "#ec4899" },
  btnIconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12, backgroundColor: "#f5f5f5" },
  btnContent: { flex: 1 },
  btnTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  btnDesc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  commentBtn: { borderLeftWidth: 4, borderLeftColor: "#06b6d4" },
});

export default HomeScreen;
