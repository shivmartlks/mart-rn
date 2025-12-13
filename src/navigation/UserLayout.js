import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { colors } from "../theme";

import Home from "../screens/user/Home"; // Updated import to Home
import Categories from "../screens/user/Categories";
import Cart from "../screens/user/Cart";
import Profile from "../screens/shared/Profile";

import Feather from "react-native-vector-icons/Feather";

const Tab = createBottomTabNavigator();

export default function UserLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <Header title={route.name} />,
        headerShown: true,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBG,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },

        tabBarIcon: ({ color, size }) => {
          let icon = "home";

          switch (route.name) {
            case "Home":
              icon = "home";
              break;
            case "Categories":
              icon = "grid";
              break;
            case "Cart":
              icon = "shopping-cart";
              break;
            case "Profile":
              icon = "user";
              break;
          }

          return <Feather name={icon} size={size} color={color} />;
        },
      })}
      tabBar={(props) => <Footer role="user" {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Categories" component={Categories} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
