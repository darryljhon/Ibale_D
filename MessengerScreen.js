import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Image,
  Animated,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import ScreenWrapper from "./ScreenWrapper";

const MessengerScreen = ({ route, navigation }) => {
  const { currentUser, chatWithUser } = route.params;
  const db = useSQLiteContext();
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentUserPic, setCurrentUserPic] = useState(null);
  const [chatWithUserPic, setChatWithUserPic] = useState(null);

  // Helper to convert chronological messages into a flat list with date separators
  const groupedMessages = (msgs) => {
    if (!msgs || msgs.length === 0) return [];
    const out = [];
    let lastDate = null;
    msgs.forEach((m) => {
      const d = new Date(m.created_at || Date.now());
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
      if (label !== lastDate) {
        out.push({ type: 'date', label });
        lastDate = label;
      }
      out.push({ ...m, type: 'message' });
    });
    return out;
  };

  // Fetch user profile pictures
  const loadUserPics = async () => {
    try {
      const current = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [currentUser.name]
      );
      const chatWith = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [chatWithUser.name]
      );
      setCurrentUserPic(current?.profileUri || null);
      setChatWithUserPic(chatWith?.profileUri || null);
    } catch (err) {
      console.error("Load user pics error:", err);
    }
  };

  // Create messages table
  const createTable = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender TEXT NOT NULL,
          receiver TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error("DB Error:", error);
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT * FROM messages
         WHERE (sender = ? AND receiver = ?)
            OR (sender = ? AND receiver = ?)
         ORDER BY created_at ASC`,
        [currentUser.name, chatWithUser.name, chatWithUser.name, currentUser.name]
      );
      // keep chronological order (oldest first) so we can insert date separators
      setMessages(results);
      // scroll to bottom after a small delay so layout is ready
      setTimeout(() => {
        try { flatListRef.current?.scrollToEnd({ animated: true }); } catch (e) {}
      }, 120);
    } catch (error) {
      console.error("Load Messages Error:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await db.runAsync(
        "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
        [currentUser.name, chatWithUser.name, newMessage.trim()]
      );
      setNewMessage("");
      // reload and scroll to newest
      await loadMessages();
      setTimeout(() => { try { flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); } catch (e) {} }, 120);
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  useEffect(() => {
    createTable().then(() => {
      loadMessages();
      loadUserPics();
    });

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // when keyboard opens, scroll to bottom to reveal latest messages
      setTimeout(() => { try { flatListRef.current?.scrollToEnd({ animated: true }); } catch (e) {} }, 50);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const renderItem = ({ item }) => {
    // separator items (inserted by grouping) have a special type
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>{item.label}</Text>
        </View>
      );
    }

    const isMe = item.sender === currentUser.name;
    const profilePic = isMe ? currentUserPic : chatWithUserPic;
    const time = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
        {!isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
        <View style={[styles.messageBubbleContainer, isMe ? styles.myBubbleContainer : styles.otherBubbleContainer]}>
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
            <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>{item.message}</Text>
          </View>
          {time && <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>{time}</Text>}
        </View>
        {isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#fff' }] }>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: '#111' }]}>◀</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingLeft: 8 }}>
          <Image source={chatWithUserPic ? { uri: chatWithUserPic } : require("./assets/default.png")} style={styles.headerAvatar} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.headerName, { color: '#111', fontSize: 16 }]}>{chatWithUser.name}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>{chatWithUser.email || 'Online'}</Text>
          </View>
        </View>
        <View style={{ width: 10 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={groupedMessages(messages)}
        keyExtractor={(item, index) => item.type === 'date' ? `date-${item.label}-${index}` : item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Input */}
      <Animated.View style={[styles.inputRow, { marginBottom: Math.max(0, keyboardHeight - 250) }] }>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: { padding: 8, marginRight: 4 },
  backText: { color: "#0084ff", fontSize: 18, fontWeight: "bold" },
  headerName: { color: "#111", fontSize: 16, fontWeight: "700", textAlign: "center", flex: 1 },
  container: { flex: 1 },
  messageRow: { 
    flexDirection: "row", 
    alignItems: "flex-end", 
    marginVertical: 8, 
    paddingHorizontal: 12,
    minHeight: 50,
  },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  chatHeadImage: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 6, backgroundColor: "#e0e0e0" },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e0e0e0" },
  messageBubbleContainer: { 
    maxWidth: "72%", 
    justifyContent: "flex-end",
    minHeight: 44,
  },
  myBubbleContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  otherBubbleContainer: {
    alignItems: "flex-start",
    marginRight: 8,
  },
  messageBubble: { 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 40,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  myMessage: { 
    backgroundColor: "#0084ff",
    borderBottomRightRadius: 4,
  },
  otherMessage: { 
    backgroundColor: "#e8e8e8",
    borderBottomLeftRadius: 4,
  },
  myMessageText: { color: "#fff", fontSize: 15, lineHeight: 20 },
  otherMessageText: { color: "#000", fontSize: 15, lineHeight: 20 },
  inputRow: {
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
    marginRight: 8,
    backgroundColor: "#f5f5f5",
    maxHeight: 120,
    fontSize: 15,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    minWidth: 50,
    elevation: 2,
    shadowColor: "#0084ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  timeText: { 
    fontSize: 12, 
    color: '#9e9e9e', 
    marginTop: 4,
    fontWeight: '500',
  },
  myTimeText: {
    textAlign: 'right',
    marginRight: 2,
  },
  otherTimeText: {
    textAlign: 'left',
    marginLeft: 2,
  },
  dateSeparator: { 
    alignItems: 'center', 
    marginVertical: 14,
    minHeight: 32,
    justifyContent: 'center',
  },
  dateText: { 
    backgroundColor: '#e8e8e8', 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 16, 
    color: '#616161', 
    fontSize: 13,
    fontWeight: '500',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
});

export default MessengerScreen;
