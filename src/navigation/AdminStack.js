import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminLayout from "./AdminLayout";
import Header from "../components/Header";

// Shared screens
import EditProfile from "../screens/shared/EditProfile";
import SubCategories from "../screens/admin/SubCategories";
import Groups from "../screens/admin/Groups";
import CategoryView from "../screens/admin/CategoryView";
import CategoryEdit from "../screens/admin/CategoryEdit";
import AdminForm from "../screens/admin/AdminForm";

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

      <Stack.Screen
        name="CategoryView"
        component={CategoryView}
        options={{ header: () => <Header title="View Category" showBack /> }}
      />
      <Stack.Screen
        name="CategoryEdit"
        component={CategoryEdit}
        options={{ header: () => <Header title="Edit Category" showBack /> }}
      />
      <Stack.Screen
        name="AdminForm"
        component={AdminForm}
        options={{ header: () => <Header title="Admin Form" showBack /> }}
      />
    </Stack.Navigator>
  );
}
