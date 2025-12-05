import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";

export default function SelectAddress({ user, selectedAddress, onSelect }) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    setAddresses(data || []);

    const defaultAddr = data?.find((a) => a.is_default);
    if (defaultAddr && !selectedAddress) {
      onSelect(defaultAddr.id);
    }
  };

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <label
          key={addr.id}
          className="
            flex items-start gap-3 p-4
            bg-white border border-border rounded-2xl shadow-card 
            cursor-pointer hover:bg-gray-50 transition-all
          "
        >
          <input
            type="radio"
            name="address"
            value={addr.id}
            checked={selectedAddress === addr.id}
            onChange={() => onSelect(addr.id)}
            className="mt-1"
          />

          <div>
            <p className="font-semibold capitalize text-text-primary">
              {addr.label}
            </p>
            <p className="text-text-primary">{addr.address_line}</p>
            <p className="text-text-muted">📞 {addr.phone}</p>
          </div>
        </label>
      ))}

      <Button block onClick={() => navigate("/add-address")}>
        + Add New Address
      </Button>
    </div>
  );
}
