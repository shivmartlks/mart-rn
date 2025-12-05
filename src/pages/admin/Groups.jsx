import { useEffect, useState } from "react";
import { fetchGroups, fetchSubCategories } from "../../api/adminApi";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function Groups() {
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", subcategoryId: "" });

  useEffect(() => {
    getSubCategories();
    getGroups();
  }, []);

  async function getSubCategories() {
    const { data: subs, error } = await fetchSubCategories();
    if (error) toast.error("Error fetching Subcategories");
    else setSubcategories(subs || []);
  }

  async function getGroups() {
    const { data: grps, error } = await fetchGroups();
    if (error) toast.error("Error fetching Groups");
    else setGroups(grps || []);
  }

  async function handleAddGroup() {
    if (!newGroup.name.trim() || !newGroup.subcategoryId) return;

    await supabase
      .from("product_groups")
      .insert([
        { name: newGroup.name, subcategory_id: newGroup.subcategoryId },
      ]);

    setNewGroup({ name: "", subcategoryId: "" });
    getGroups();
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Add New Group</h2>

      {/* Add Group Card */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5 space-y-4
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Subcategory Select */}
          <select
            value={newGroup.subcategoryId}
            onChange={(e) =>
              setNewGroup((prev) => ({
                ...prev,
                subcategoryId: e.target.value,
              }))
            }
            className="
              w-full bg-white border border-border rounded-xl 
              p-3 text-text-primary placeholder:text-text-muted
              focus:ring-2 focus:ring-primary focus:outline-none
            "
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Group Name Input */}
          <input
            type="text"
            placeholder="Group Name"
            value={newGroup.name}
            onChange={(e) =>
              setNewGroup((prev) => ({ ...prev, name: e.target.value }))
            }
            className="
              w-full bg-white border border-border rounded-xl 
              p-3 text-text-primary placeholder:text-text-muted
              focus:ring-2 focus:ring-primary focus:outline-none
            "
          />

          {/* Add Button */}
          <Button onClick={handleAddGroup} block>
            Add
          </Button>
        </div>
      </div>

      {/* Display Groups */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5
        "
      >
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          Existing Groups
        </h3>

        {groups.length === 0 ? (
          <p className="text-text-muted">No groups added yet.</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => (
              <li
                key={g.id}
                className="
                  bg-gray-50 border border-border p-3 rounded-xl 
                  text-text-primary
                "
              >
                {g.name}
                <span className="text-text-muted text-sm ml-1">
                  (
                  {subcategories.find((s) => s.id === g.subcategory_id)?.name ||
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
