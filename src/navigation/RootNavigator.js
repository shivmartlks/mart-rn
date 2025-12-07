import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthLoadingScreen from "../screens/AuthLoading";
import LoginScreen from "../screens/Login";
import AdminStack from "./AdminStack";
import UserStack from "./UserStack";

import { useAuth } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : role === "admin" ? (
        <Stack.Screen name="AdminStack" component={AdminStack} />
      ) : (
        <Stack.Screen name="UserStack" component={UserStack} />
      )}
    </Stack.Navigator>
  );
}
