import React from "react";
import BottomNavigationBar from "./ui/BottomNavigationBar";
import { userTabs, adminTabs } from "./FooterTabsConfig"; // Moved tab configs to a separate file

export default function Footer({ role = "user" }) {
  const tabs = role === "admin" ? adminTabs : userTabs;

  return <BottomNavigationBar tabs={tabs} />;
}
