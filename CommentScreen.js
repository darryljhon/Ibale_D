import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Keyboard,
  Animated,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import ScreenWrapper from "./ScreenWrapper";

const CommentScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const db = useSQLiteContext();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const flatListRef = useRef();
  const keyboardAnim = useRef(new Animated.Value(0)).current;

  // Create comments table if it doesn't exist
  const createTable = async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        comment TEXT NOT NULL
      );
    `);
  };

  const loadComments = async () => {
    // include profile info from auth_users if available
    const results = await db.getAllAsync(
      `SELECT c.*, u.id as userId, u.profileUri as profileUri, u.email as email
       FROM comments c
       LEFT JOIN auth_users u ON c.user = u.name
       ORDER BY c.id ASC`
    );
    setComments(results);

    // Scroll to bottom after loading
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    await db.runAsync(
      "INSERT INTO comments (user, comment) VALUES (?, ?)",
      [user, comment]
    );
    setComment("");
    loadComments();
  };

  useEffect(() => {
    createTable().then(() => loadComments());

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      const toValue = Math.max(0, (e?.endCoordinates?.height || 0) - 200);
      Animated.timing(keyboardAnim, { toValue, duration: 180, useNativeDriver: false }).start();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ScreenWrapper>
      <FlatList
        ref={flatListRef}
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { currentUser: { id: item.userId, name: item.user, email: item.email, profileUri: item.profileUri } })}>
              <Image source={item.profileUri ? { uri: item.profileUri } : require("./assets/default.png")} style={styles.commentAvatar} />
            </TouchableOpacity>
            <View style={styles.comment}>
              <Text style={styles.user}>{item.user}</Text>
              <Text style={{ color: "#111", fontSize: 15 }}>{item.comment}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 12 }}
      />

      <Animated.View style={[styles.inputContainer, { marginBottom: keyboardAnim }]}> 
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#9ca3af"
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity style={{ backgroundColor: "#0084ff", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, justifyContent: "center", alignItems: "center" }} onPress={addComment}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Post</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  comment: {
    marginHorizontal: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  user: { fontWeight: "700", marginBottom: 4, color: "#0084ff", fontSize: 14 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    minHeight: 56,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
    minHeight: 40,
    fontSize: 15,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#0084ff',
  },
});

export default CommentScreen;
