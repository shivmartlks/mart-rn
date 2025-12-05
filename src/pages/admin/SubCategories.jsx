import { useEffect, useState } from "react";
import { fetchCategories, fetchSubCategories } from "../../api/adminApi";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function SubCategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    categoryId: "",
  });

  useEffect(() => {
    getCategories();
    getSubCategories();
  }, []);

  async function getCategories() {
    const { data: cats, error } = await fetchCategories();
    if (error) toast.error("Error fetching categories");
    else setCategories(cats || []);
  }

  async function getSubCategories() {
    const { data: subs, error } = await fetchSubCategories();
    if (error) toast.error("Error fetching subcategories");
    else setSubcategories(subs || []);
  }

  async function handleAddSubcategory() {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) return;

    await supabase.from("product_subcategories").insert([
      {
        name: newSubcategory.name,
        category_id: newSubcategory.categoryId,
      },
    ]);

    setNewSubcategory({ name: "", categoryId: "" });
    getSubCategories();
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary">
        Add New Subcategory
      </h2>

      {/* Add Subcategory Card */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5 space-y-4
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Select */}
          <select
            value={newSubcategory.categoryId}
            onChange={(e) =>
              setNewSubcategory((p) => ({
                ...p,
                categoryId: e.target.value,
              }))
            }
            className="
              bg-white border border-border rounded-xl 
              p-3 text-text-primary focus:ring-2 
              focus:ring-primary focus:outline-none
            "
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Subcategory Name */}
          <input
            type="text"
            placeholder="Subcategory Name"
            value={newSubcategory.name}
            onChange={(e) =>
              setNewSubcategory((p) => ({ ...p, name: e.target.value }))
            }
            className="
              bg-white border border-border rounded-xl 
              p-3 text-text-primary placeholder:text-text-muted 
              focus:ring-2 focus:ring-primary focus:outline-none
            "
          />

          {/* Add Button */}
          <Button onClick={handleAddSubcategory} block>
            Add
          </Button>
        </div>
      </div>

      {/* Subcategory List */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5
        "
      >
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          All Subcategories
        </h3>

        {subcategories.length === 0 ? (
          <p className="text-text-muted">No subcategories yet.</p>
        ) : (
          <ul className="space-y-2">
            {subcategories.map((s) => (
              <li
                key={s.id}
                className="
                  bg-gray-50 border border-border p-3 
                  rounded-xl text-text-primary
                "
              >
                {s.name}
                <span className="text-text-muted text-sm ml-1">
                  (
                  {categories.find((c) => c.id === s.category_id)?.name ||
                    "Unassigned"}
                  )
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
