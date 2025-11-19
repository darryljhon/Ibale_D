import "react-native-gesture-handler";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import RegisterScreen from "./RegisterScreen";
import LoginScreen from "./LoginScreen";
import UserListScreen from "./UserListScreen";
import MessengerScreen from "./MessengerScreen";
import CommentScreen from "./CommentScreen";
import ProfileScreen from "./ProfileScreen";
import ChatSelectScreen from "./ChatSelectScreen";
import EditProfileScreen from "./EditProfileScreen";
import AboutScreen from "./AboutScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const currentUser = route.params?.currentUser || null;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#000" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={UserListScreen} />
      <Tab.Screen name="Chat" component={ChatSelectScreen} initialParams={{ currentUser }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ currentUser }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider
      databaseName="authDatabase.db"
      onInit={async (db) => {
        await db.execAsync(`
          -- Users table
          CREATE TABLE IF NOT EXISTS auth_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );

          -- Messages table
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          -- Comments table
          CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        try { await db.runAsync("ALTER TABLE auth_users ADD COLUMN profileUri TEXT;"); } catch (error) {}
        try { await db.runAsync("ALTER TABLE auth_users ADD COLUMN bio TEXT;"); } catch (error) {}
        try { await db.runAsync("ALTER TABLE auth_users ADD COLUMN address TEXT;"); } catch (error) {}
      }}
    >
      <NavigationContainer theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: "#000" }
      }}>
        <Stack.Navigator
          initialRouteName="Register"
          screenOptions={{
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerBackVisible: false,
          }}
        >
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Register" }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: "About" }} />
          <Stack.Screen
            name="Users"
            component={UserListScreen}
            options={{ title: "User List" }}
          />
          <Stack.Screen
            name="Messenger"
            component={MessengerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Comments"
            component={CommentScreen}
            options={{ title: "Comments" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
