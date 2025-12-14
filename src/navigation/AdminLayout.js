import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feather from "react-native-vector-icons/Feather";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { colors } from "../theme";

// ADMIN SCREENS
import AdminDashboard from "../screens/admin/AdminDashboard";
import ManageProducts from "../screens/admin/ManageProducts";
import ManageOrders from "../screens/admin/ManageOrders";
import Profile from "../screens/shared/Profile";

const Tab = createBottomTabNavigator();

export default function AdminLayout() {
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
            case "Dashboard":
              icon = "home";
              break;
            case "Products":
              icon = "shopping-bag";
              break;
            case "Orders":
              icon = "clipboard";
              break;
            case "Profile":
              icon = "user";
              break;
          }

          return <Feather name={icon} size={size} color={color} />;
        },
      })}
      tabBar={(props) => <Footer {...props} role="admin" />}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Products" component={ManageProducts} />
      <Tab.Screen name="Orders" component={ManageOrders} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
