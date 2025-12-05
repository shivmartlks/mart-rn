import { useState } from "react";
import Categories from "./Categories";
import SubCategories from "./SubCategories";
import Groups from "./Groups";
import Products from "./Products";

export default function ManageProducts() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="min-h-screen bg-app text-text-primary">
      {/* Header */}
      <header
        className="
          flex justify-between items-center 
          p-6 bg-white border-b border-border shadow-sm
        "
      >
        <h1 className="text-2xl font-bold">Manage Products</h1>
      </header>

      {/* Tabs */}
      <div
        className="
          flex gap-3 px-6 py-3 
          bg-white border-b border-border 
          flex-wrap shadow-sm
        "
      >
        {["categories", "subcategories", "groups", "products"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              capitalize px-4 py-2 rounded-xl font-medium transition 
              ${
                activeTab === tab
                  ? "bg-black-800 text-white shadow-card"
                  : "bg-gray-100 text-text-primary hover:bg-gray-200"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="p-6">
        <div
          className="
            bg-white p-6 rounded-2xl 
            shadow-card border border-border
          "
        >
          {activeTab === "categories" && <Categories />}
          {activeTab === "subcategories" && <SubCategories />}
          {activeTab === "groups" && <Groups />}
          {activeTab === "products" && <Products />}
        </div>
      </main>
    </div>
  );
}
