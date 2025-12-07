import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminLayout from "./AdminLayout";
import Header from "../components/Header";

// Shared screens
import EditProfile from "../screens/shared/EditProfile";
import SubCategories from "../screens/admin/SubCategories";
import Groups from "../screens/admin/Groups";

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

      {/* Detail Screens */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ header: () => <Header title="Edit Profile" showBack /> }}
      />

      <Stack.Screen
        name="SubCategories"
        component={SubCategories}
        options={{ header: () => <Header title="Sub Categories" showBack /> }}
      />

      <Stack.Screen
        name="Groups"
        component={Groups}
        options={{ header: () => <Header title="Product Groups" showBack /> }}
      />
    </Stack.Navigator>
  );
}
