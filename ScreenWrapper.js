import React from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenWrapper = ({ children, style, contentContainerStyle }) => {
  const isAndroid = Platform.OS === "android";

  if (isAndroid) {
    // Android-only: use KeyboardAvoidingView with 'height' behavior
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        <KeyboardAvoidingView style={styles.flex} behavior={"height"} keyboardVerticalOffset={0}>
          <View style={[styles.container, contentContainerStyle]}>{children}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Non-Android (iOS, web) — render without KeyboardAvoidingView so behavior is Android-only
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[styles.container, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  flex: { flex: 1 },
  container: { flex: 1, padding: 16 },
});

export default ScreenWrapper;
