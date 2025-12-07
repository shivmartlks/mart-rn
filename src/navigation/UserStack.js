import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserLayout from "./UserLayout";
import Header from "../components/Header";

import ProductView from "../screens/user/ProductView";
import EditProfile from "../screens/shared/EditProfile";
import ManageAddresses from "../screens/user/ManageAddresses";
import AddAddress from "../screens/user/AddAddress";
import EditAddress from "../screens/user/EditAddress";
import SelectAddress from "../screens/user/SelectAddress";

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator>
      {/* MAIN TABS */}
      <Stack.Screen
        name="UserTabs"
        component={UserLayout}
        options={{ headerShown: false }}
      />

      {/* DETAIL PAGES WITH BACK HEADER */}
      <Stack.Screen
        name="ProductView"
        component={ProductView}
        options={{ header: () => <Header title="Product" showBack /> }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ header: () => <Header title="Edit Profile" showBack /> }}
      />

      <Stack.Screen
        name="ManageAddresses"
        component={ManageAddresses}
        options={{ header: () => <Header title="Manage Addresses" showBack /> }}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddress}
        options={{ header: () => <Header title="Add Address" showBack /> }}
      />
      <Stack.Screen
        name="EditAddress"
        component={EditAddress}
        options={{ header: () => <Header title="Edit Address" showBack /> }}
      />
      <Stack.Screen
        name="SelectAddress"
        component={SelectAddress}
        options={{ header: () => <Header title="Select Address" showBack /> }}
      />
    </Stack.Navigator>
  );
}
