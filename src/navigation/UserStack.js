import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserLayout from "./UserLayout";
import Header from "../components/Header";

import Products from "../screens/user/Products";
import EditProfile from "../screens/shared/EditProfile";
import ManageAddresses from "../screens/user/ManageAddresses";
import AddAddress from "../screens/user/AddAddress";
import EditAddress from "../screens/user/EditAddress";
import OrderDetails from "../screens/user/OrderDetails";
import ProductDetails from "../screens/user/ProductDetails";
import Wishlist from "../screens/user/Wishlist";
import Orders from "../screens/user/Orders";
import OrderSuccess from "../screens/user/OrderSuccess";

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
        name="Products"
        component={Products}
        options={({ route }) => ({
          header: () => (
            <Header title={route?.params?.name ?? "Product"} showBack />
          ),
        })}
      />

      <Stack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{ header: () => <Header title="Product Details" showBack /> }}
      />

      <Stack.Screen
        name="Wishlist"
        component={Wishlist}
        options={{ header: () => <Header title="Wishlist" showBack /> }}
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
        name="OrderDetails"
        component={OrderDetails}
        options={{ header: () => <Header title="Order Details" showBack /> }}
      />

      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{ header: () => <Header title="Orders" showBack /> }}
      />

      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccess}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
