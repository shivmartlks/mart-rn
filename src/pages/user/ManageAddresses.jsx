import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function ManageAddresses({ user }) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("id", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) console.error(error);

    setAddresses(data || []);
  }

  async function setDefault(id) {
    await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", Number(id));

    load();
  }

  async function deleteAddress(id) {
    if (!confirm("Delete this address?")) return;

    await supabase.from("addresses").delete().eq("id", Number(id));

    load();
    toast.success("Deleted!");
  }

  return (
    <div className="max-w-lg mx-auto p-5 space-y-6 bg-app min-h-screen">
      <h2 className="text-2xl font-semibold text-text-primary">
        Manage Addresses
      </h2>

      {/* Address List */}
      {addresses.map((a) => (
        <div
          key={a.id}
          className="p-5 bg-white border border-border shadow-card rounded-2xl space-y-3"
        >
          <div className="flex justify-between items-center">
            <strong className="text-text-primary capitalize">{a.label}</strong>

            {a.is_default && (
              <span className="text-success text-sm font-medium">Default</span>
            )}
          </div>

          <p className="text-text-primary">{a.address_line}</p>
          <p className="text-text-muted">📞 {a.phone}</p>
          <p className="text-text-muted">Pincode: {a.pincode}</p>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {!a.is_default && (
              <Button
                onClick={() => setDefault(a.id)}
                size="small"
                variant="secondary"
              >
                Set Default
              </Button>
            )}

            <Button
              onClick={() => navigate(`/edit-address/${a.id}`)}
              size="small"
              variant="secondary"
            >
              Edit
            </Button>

            <Button
              onClick={() => deleteAddress(a.id)}
              size="small"
              variant="secondary"
              className="text-red-600 border-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      {/* Add Button */}
      <Button onClick={() => navigate("/add-address")} block>
        + Add New Address
      </Button>
    </div>
  );
}
