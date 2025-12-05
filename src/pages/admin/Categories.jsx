import { useEffect, useState } from "react";
import { fetchCategories } from "../../api/adminApi";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    getCategories();
  }, []);

  async function getCategories() {
    const { data, error } = await fetchCategories();
    if (error) {
      toast.error("Error fetching categories");
    } else {
      setCategories(data || []);
    }
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    await supabase.from("product_categories").insert([{ name: newCategory }]);
    setNewCategory("");
    getCategories();
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h2 className="text-xl font-semibold text-text-primary">
        Add New Category
      </h2>

      {/* Add Category Box */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5 space-y-4
        "
      >
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="
            w-full bg-white border border-border rounded-xl 
            p-3 text-text-primary placeholder:text-text-muted
            focus:ring-2 focus:ring-primary focus:outline-none
          "
        />
        <Button onClick={handleAddCategory} block>
          Add Category
        </Button>
      </div>

      {/* Category List */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5
        "
      >
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          Existing Categories
        </h3>

        {categories.length === 0 ? (
          <p className="text-text-muted">No categories yet.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li
                key={c.id}
                className="
                  bg-gray-50 p-3 rounded-xl 
                  border border-border text-text-primary
                "
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
