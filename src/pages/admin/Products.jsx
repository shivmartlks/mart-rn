import { useEffect, useState } from "react";
import { fetchGroups, fetchProducts } from "../../api/adminApi";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    mrp: "",
    price: "",
    image_url: "",
    stock_value: "",
    stock_type: "quantity",
    stock_unit: "pcs",
    group_id: "",
  });

  useEffect(() => {
    getGroups();
    getProducts();
  }, []);

  async function getGroups() {
    const { data: subs, error } = await fetchGroups();
    if (error) toast.error("Error fetching Groups");
    else setGroups(subs || []);
  }

  async function getProducts() {
    const { data: prds, error } = await fetchProducts();
    if (error) toast.error("Error fetching Products");
    else setProducts(prds || []);
  }

  async function handleAddProduct() {
    const {
      name,
      description,
      mrp,
      price,
      image_url,
      stock_value,
      stock_type,
      stock_unit,
      group_id,
    } = newProduct;

    if (!name || !price || !group_id) return;

    const payload = {
      name,
      description,
      mrp: Number(mrp) || Number(price),
      price: Number(price),
      image_url,
      stock_value: Number(stock_value) || 0,
      stock_type,
      stock_unit,
      group_id,
    };

    const { error } = await supabase.from("products").insert([payload]);
    if (error) {
      toast.error("Error adding product: " + error.message);
      return;
    }

    setNewProduct({
      name: "",
      description: "",
      mrp: "",
      price: "",
      image_url: "",
      stock_value: "",
      stock_type: "quantity",
      stock_unit: "pcs",
      group_id: "",
    });

    getProducts();
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary">
        Add New Product
      </h2>

      {/* Add Product Card */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5 space-y-4
        "
      >
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: "name", placeholder: "Product Name" },
            { key: "description", placeholder: "Description" },
            { key: "mrp", placeholder: "MRP", type: "number" },
            { key: "price", placeholder: "Selling Price", type: "number" },
            { key: "image_url", placeholder: "Image URL" },
            {
              key: "stock_value",
              placeholder: "Stock Quantity",
              type: "number",
            },
          ].map(({ key, placeholder, type = "text" }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={newProduct[key]}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, [key]: e.target.value }))
              }
              className="
                w-full bg-white border border-border rounded-xl 
                p-3 text-text-primary placeholder:text-text-muted 
                focus:ring-2 focus:ring-primary focus:outline-none
              "
            />
          ))}

          {/* Stock Type */}
          <select
            value={newProduct.stock_type}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, stock_type: e.target.value }))
            }
            className="
              bg-white border border-border rounded-xl p-3
              text-text-primary focus:ring-2 focus:ring-primary 
              focus:outline-none
            "
          >
            <option value="quantity">Quantity (pcs)</option>
            <option value="weight">Weight (kg)</option>
          </select>

          {/* Group Select */}
          <select
            value={newProduct.group_id}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, group_id: e.target.value }))
            }
            className="
              bg-white border border-border rounded-xl p-3
              text-text-primary focus:ring-2 focus:ring-primary 
              focus:outline-none
            "
          >
            <option value="">Select Group</option>
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Button */}
        <Button onClick={handleAddProduct} block>
          Add Product
        </Button>
      </div>

      {/* Products List */}
      <div
        className="
          bg-white border border-border rounded-2xl 
          shadow-card p-5
        "
      >
        <h3 className="font-semibold text-lg text-text-primary mb-3">
          All Products
        </h3>

        {products.length === 0 ? (
          <p className="text-text-muted">No products available.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="
                  bg-gray-50 border border-border rounded-xl 
                  p-3 text-text-primary
                "
              >
                {p.name} — ₹{p.price}
                <span className="text-text-muted text-sm ml-1">
                  ({p.stock_value} {p.stock_unit})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
