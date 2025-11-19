import React, { useEffect, useState, useLayoutEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, TouchableOpacity, View, StyleSheet, Image, TextInput } from "react-native";
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
    } catch (e) {}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#6b7280" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users"
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
        contentContainerStyle={{ padding: 12 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: "#111", fontFamily: "Comic Sans MS" },
  searchBar: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, margin: 12, paddingHorizontal: 10, backgroundColor: "#fff" },
  searchInput: { flex: 1, height: 40, color: "#111" },
  row: { padding: 12, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 10, flexDirection: "row", alignItems: "center" },
  userIcon: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: "#e5e7eb" },
  name: { fontSize: 16, fontWeight: "600", color: "#111", fontFamily: "Comic Sans MS" },
  email: { fontSize: 14, color: "#6b7280", fontFamily: "Comic Sans MS" },
});

export default ChatSelectScreen;
