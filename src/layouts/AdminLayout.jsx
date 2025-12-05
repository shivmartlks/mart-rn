import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";

export default function UserLayout({ role }) {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1] || "home";

  const prettyTitles = {
    home: "Admin Home",
    manage_products: "Manage Products",
    manage_orders: "Manage Orders",
    profile: "Profile",
  };

  const pageTitle = prettyTitles[currentPath] || currentPath;

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header
        className="
          bg-white border-b border-border 
          px-4 py-3 shadow-sm fixed 
          top-0 left-0 right-0 z-50
        "
      >
        <h1 className="text-lg font-semibold capitalize text-text-primary">
          {pageTitle}
        </h1>
      </header>

      {/* Main Content with safe padding */}
      <main
        className="main-content 
          flex-1 overflow-y-auto
          px-3
        "
      >
        <Outlet />
      </main>

      {/* Footer Navigation */}
      <Footer role={role} />
    </div>
  );
}
