import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import LoadingScreen from "../pages/LoadingScreen";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserLayout from "../layouts/UserLayout";
import UserDashboard from "../pages/user/UserDashboard";
import ShopView from "../pages/user/ShopView";
import CartView from "../pages/user/CartView";
import Orders from "../pages/user/Orders";
import Profile from "../pages/shared/Profile";
import ProductView from "../pages/user/ProductView";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageProducts from "../pages/admin/ManageProducts";
import AddAddress from "../pages/user/AddAdress";
import EditProfile from "../pages/shared/EditProfile";
import ManageAddresses from "../pages/user/ManageAddresses";
import EditAddress from "../pages/user/EditAddress";
import OrderDetails from "../pages/user/OrderDetails";

export default function ProtectedRoute() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) loadUserRole(session.user);
        else {
          setSession(null);
          setRole(null);
          setLoading(false);
        }
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  async function initAuth() {
    const { data } = await supabase.auth.getSession();
    const currentSession = data.session;
    if (currentSession?.user) {
      loadUserRole(currentSession.user);
    } else {
      setLoading(false);
    }
  }

  async function loadUserRole(user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!error && profile) {
      setSession(user);
      setRole(profile.role);
    }
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;
  if (!session) return <Login onLogin={(u) => loadUserRole(u)} />;

  // Role-based rendering
  if (role === "admin") {
    return (
      <Routes>
        <Route path="/" element={<AdminLayout role={role} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage_products" element={<ManageProducts />} />
          <Route path="manage_orders" element={<ManageOrders />} />
          <Route path="profile" element={<Profile />} />
          {/* ➤ Catch-all route inside the layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        {/* In case a route does not match any layout */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<UserLayout role={role} />}>
        <Route index element={<UserDashboard user={session} />} />
        <Route path="shop" element={<ShopView user={session} />} />
        <Route path="cart" element={<CartView user={session} />} />
        <Route path="orders" element={<Orders user={session} />} />
        <Route path="orders/:id" element={<OrderDetails />} />

        <Route path="add-address" element={<AddAddress user={session} />} />
        <Route
          path="edit-address/:id"
          element={<EditAddress user={session} />}
        />
        <Route
          path="manage-addresses"
          element={<ManageAddresses user={session} />}
        />

        <Route path="profile" element={<Profile user={session} />} />
        <Route path="edit-profile" element={<EditProfile user={session} />} />

        <Route
          path="subcategory/:id"
          element={<ProductView user={session} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
