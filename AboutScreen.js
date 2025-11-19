import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, StyleSheet } from "react-native";

const AboutScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={styles.container}>
        <Text style={styles.title}>About the Creator</Text>
        <Image source={require("./assets/dar.jpg")} style={styles.photo} />
        <Text style={styles.item}>Submitted by: Darryl Jhon Ibale</Text>
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
  container: { paddingHorizontal: 20, paddingVertical: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", flex: 1 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20, color: "#111" },
  item: { fontSize: 16, color: "#111", marginBottom: 8, textAlign: "center", fontWeight: "600" },
  photo: { width: 160, height: 160, borderRadius: 20, backgroundColor: "#e5e7eb", marginVertical: 20, borderWidth: 4, borderColor: "#0084ff" },
  placeholder: { },
  bio: { fontSize: 15, color: "#374151", marginTop: 8, textAlign: "center", fontWeight: "500" },
  addr: { fontSize: 15, color: "#374151", marginTop: 8, textAlign: "center", fontWeight: "600" },
});

export default AboutScreen;
