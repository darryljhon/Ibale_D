import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./HomeScreen";
import ChatSelectScreen from "./ChatSelectScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

const MainTabs = ({ route }) => {
  const currentUser = route.params?.currentUser;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = "home-outline";
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Chat") iconName = "chatbubbles-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#111",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ currentUser }} />
      <Tab.Screen name="Chat" component={ChatSelectScreen} initialParams={{ currentUser }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ currentUser }} />
    </Tab.Navigator>
  );
};

export default MainTabs;
