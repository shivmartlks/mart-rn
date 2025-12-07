import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AdminDashboardScreen from "../screens/admin/AdminDashboard";
import ManageProductsScreen from "../screens/admin/ManageProducts";
import ManageOrdersScreen from "../screens/admin/ManageOrders";
import ProfileScreen from "../screens/shared/Profile";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Products" component={ManageProductsScreen} />
      <Tab.Screen name="Orders" component={ManageOrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
