import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminTabs from "./AdminTabs";

import EditProfileScreen from "../screens/shared/EditProfile";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Admin main navigation */}
      <Stack.Screen name="AdminTabs" component={AdminTabs} />

      {/* Shared routes */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}
