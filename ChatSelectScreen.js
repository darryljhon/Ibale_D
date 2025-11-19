import React, { useEffect, useState, useLayoutEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image, TextInput, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";

const ChatSelectScreen = ({ route, navigation }) => {
  const db = useSQLiteContext();
  const currentUser = route.params?.currentUser;
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const loadUsers = async () => {
    try {
      const results = await db.getAllAsync(
        "SELECT * FROM auth_users WHERE id != ? ORDER BY name ASC",
        [currentUser?.id || -1]
      );
      setUsers(results);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Chat",
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowSearch((v) => !v)} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="search-outline" size={22} color="#111" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, setShowSearch]);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"height"} keyboardVerticalOffset={0}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>{currentUser?.name ? `Signed in as ${currentUser.name}` : 'Select someone to message'}</Text>
        </View>
        {showSearch && (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#6b7280" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users"
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate("Messenger", { currentUser, chatWithUser: item })}
            >
              <Image
                source={item.profileUri ? { uri: item.profileUri } : require("./assets/icon.png")}
                style={styles.userIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 0, paddingHorizontal: 12 }}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", marginBottom: 4, textAlign: "left", color: "#111" },
  headerTitleContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "transparent" },
  subtitle: { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  searchBar: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d0d0d0", borderRadius: 12, marginHorizontal: 12, marginVertical: 8, paddingHorizontal: 12, backgroundColor: "#f9f9f9" },
  searchInput: { flex: 1, height: 44, color: "#111", fontSize: 15 },
  row: { paddingHorizontal: 16, paddingVertical: 13, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  userIcon: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: "#e5e7eb", borderWidth: 2, borderColor: "#0084ff" },
  name: { fontSize: 16, fontWeight: "700", color: "#111" },
  email: { fontSize: 14, color: "#6b7280", marginTop: 2 },
});

export default ChatSelectScreen;
