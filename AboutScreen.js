import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, StyleSheet } from "react-native";

const AboutScreen = ({ route }) => {
  const currentUser = route.params?.currentUser;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.container}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.item}>Author/Submitted by: {currentUser?.name || "Your Full Name"}</Text>
        <Text style={styles.item}>Submitted To: Jay Ian Camelotes</Text>
        {currentUser?.profileUri ? (
          <Image source={{ uri: currentUser.profileUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholder]} />
        )}
        {currentUser?.bio ? <Text style={styles.bio}>{currentUser.bio}</Text> : <Text style={styles.bio}>Introduction about you</Text>}
        {currentUser?.address ? <Text style={styles.addr}>Address: {currentUser.address}</Text> : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, color: "#fff", fontFamily: "Comic Sans MS" },
  item: { fontSize: 16, color: "#fff", marginBottom: 6, fontFamily: "Comic Sans MS" },
  photo: { width: 140, height: 140, borderRadius: 8, backgroundColor: "#e5e7eb", alignSelf: "center", marginVertical: 12 },
  placeholder: { },
  bio: { fontSize: 15, color: "#fff", marginTop: 8, fontFamily: "Comic Sans MS" },
  addr: { fontSize: 14, color: "#fff", marginTop: 6, fontFamily: "Comic Sans MS" },
});

export default AboutScreen;
