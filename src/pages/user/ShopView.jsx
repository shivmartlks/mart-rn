import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ShopView() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: cats } = await supabase
      .from("product_categories")
      .select("*")
      .order("name");

    const { data: subs } = await supabase
      .from("product_subcategories")
      .select("*")
      .order("name");

    setCategories(cats || []);
    setSubcategories(subs || []);
  }

  return (
    <div className="min-h-screen bg-app p-5">
      <div className="space-y-10">
        {categories.map((cat) => {
          const catSubs = subcategories.filter((s) => s.category_id === cat.id);

          return (
            <div key={cat.id} className="space-y-3">
              {/* Category Name */}
              <h3 className="text-xl font-semibold text-text-primary">
                {cat.name}
              </h3>

              {catSubs.length === 0 ? (
                <p className="text-text-muted text-sm">No subcategories yet</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {catSubs.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => navigate(`/subcategory/${sub.id}`)}
                      className="
                        bg-white border border-border 
                        rounded-2xl shadow-card 
                        p-4 cursor-pointer 
                        hover:shadow-md transition
                        flex flex-col items-center
                      "
                    >
                      {/* Image */}
                      <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden mb-3">
                        <img
                          src={sub.image_url}
                          alt={sub.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Title */}
                      <p className="font-medium text-text-primary text-sm">
                        {sub.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
