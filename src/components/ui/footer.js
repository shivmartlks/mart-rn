import { Home, Package, User, Wrench, ShoppingBag, ShoppingCart } from "lucide-react";

export const adminTabs = [
    { key: "home", label: "Home", icon: Home, path: "/" },
    {
      key: "manage_products",
      label: "Products",
      icon: Wrench,
      path: "/manage_products",
    },
    {
      key: "manage_orders",
      label: "Orders",
      icon: Package,
      path: "/manage_orders",
    },
    { key: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

export const userTabs = [
    { key: "home", label: "Home", icon: Home, path: "/" },
    { key: "shop", label: "Shop", icon: ShoppingBag, path: "/shop" },
    { key: "cart", label: "Cart", icon: ShoppingCart, path: "/cart" },
    { key: "orders", label: "Orders", icon: Package, path: "/orders" },
    { key: "profile", label: "Profile", icon: User, path: "/profile" },
  ];