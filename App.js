import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ActiveStoreProvider } from "./src/contexts/ActiveStoreContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/ui/ToastTheme";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ActiveStoreProvider>
          <NavigationContainer>
            <RootNavigator />
            <Toast config={toastConfig} />
          </NavigationContainer>
        </ActiveStoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
