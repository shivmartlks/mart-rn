import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminLayout from "./AdminLayout";
import Header from "../components/Header";

// Shared screens
import AdminForm from "../screens/admin/AdminForm";
import Inventory from "../screens/admin/Inventory";
import OrderDetails from "../screens/admin/OrderDetails";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      {/* Admin Tabs */}
      <Stack.Screen
        name="AdminTabs"
        component={AdminLayout}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Inventory"
        component={Inventory}
        options={{ header: () => <Header title="Inventory" showBack /> }}
      />

      <Stack.Screen
        name="AdminForm"
        component={AdminForm}
        options={{ header: () => <Header title="Admin Form" showBack /> }}
      />

      <Stack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{ header: () => <Header title="Order Details" showBack /> }}
      />
    </Stack.Navigator>
  );
}
