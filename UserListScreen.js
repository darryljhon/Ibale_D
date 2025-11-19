import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, RefreshControl, Image, TouchableOpacity } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const UserListScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const results = await db.getAllAsync("SELECT * FROM auth_users");
      setUsers(results);
    } catch (error) {
      console.error("DB Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Profile', { currentUser: item })}>
            <Image source={item.profileUri ? { uri: item.profileUri } : require('./assets/default.png')} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#6b7280", marginTop: 20 }}>No users found</Text>}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: "#fff", flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#0084ff' },
  name: { fontWeight: "700", fontSize: 16, color: "#111" },
});

export default UserListScreen;
