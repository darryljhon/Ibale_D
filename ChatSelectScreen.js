import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const ChatSelectScreen = ({ route, navigation }) => {
  const db = useSQLiteContext();
  const currentUser = route.params?.currentUser;
  const [users, setUsers] = useState([]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("Messenger", { currentUser, chatWithUser: item })}
          >
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
  row: { padding: 12, backgroundColor: "#111", borderRadius: 8, borderWidth: 1, borderColor: "#222", marginBottom: 10 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff", fontFamily: "Comic Sans MS" },
  email: { fontSize: 14, color: "#fff", fontFamily: "Comic Sans MS" },
});

export default ChatSelectScreen;
