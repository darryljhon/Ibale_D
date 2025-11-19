import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, StyleSheet } from "react-native";

const AboutScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Text style={styles.title}>About the Creator</Text>
        <Image source={require("./assets/dar.jpg")} style={styles.photo} />
        <Text style={styles.item}>Author/Submitted by: Darryl Jhon Ibale</Text>
        <Text style={styles.item}>Submitted To: Jay Ian Camelotes</Text>
                <Text style={styles.bio}></Text>
        <Text style={styles.bio}>Bio 📝 IT nga murag dili IT</Text>
        <Text style={styles.bio}>Bachelor of Science in Information Technology</Text>
        <Text style={styles.bio}></Text>
        <Text style={styles.addr}>Address 🏡 Bohol, Philippines</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, color: "#111", fontFamily: "Comic Sans MS" },
  item: { fontSize: 16, color: "#111", marginBottom: 6, fontFamily: "Comic Sans MS", textAlign: "center" },
  photo: { width: 140, height: 140, borderRadius: 8, backgroundColor: "#e5e7eb", marginVertical: 12 },
  placeholder: { },
  bio: { fontSize: 15, color: "#374151", marginTop: 8, fontFamily: "Comic Sans MS", textAlign: "center" },
  addr: { fontSize: 14, color: "#374151", marginTop: 6, fontFamily: "Comic Sans MS", textAlign: "center" },
});

export default AboutScreen;
