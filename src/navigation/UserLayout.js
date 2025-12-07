import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Header from "../components/Header";

import UserDashboard from "../screens/user/UserDashboard";
import Shop from "../screens/user/Shop";
import Cart from "../screens/user/Cart";
import Orders from "../screens/user/Orders";
import Profile from "../screens/shared/Profile";

import Feather from "react-native-vector-icons/Feather";

const Tab = createBottomTabNavigator();

export default function UserLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <Header title={route.name} />,
        headerShown: true,

        tabBarIcon: ({ color, size }) => {
          let icon = "home";

          switch (route.name) {
            case "Home":
              icon = "home";
              break;
            case "Shop":
              icon = "shopping-bag";
              break;
            case "Cart":
              icon = "shopping-cart";
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
    >
      <Tab.Screen name="UserDashboard" component={UserDashboard} />
      <Tab.Screen name="Shop" component={Shop} />
      <Tab.Screen name="Cart" component={Cart} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
