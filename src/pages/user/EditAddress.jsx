import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function EditAddress({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [label, setLabel] = useState("home");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [totalAddresses, setTotalAddresses] = useState(0);

  useEffect(() => {
    if (user) {
      loadAddress();
      loadCount();
    }
  }, [user]);

  const loadCount = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id);

    setTotalAddresses(data?.length || 0);
  };

  const loadAddress = async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setLabel(data.label);
    setAddress(data.address_line);
    setPhone(data.phone);
    setPincode(data.pincode);
    setInstructions(data.delivery_instructions || "");
    setIsDefault(data.is_default);
  };

  const save = async () => {
    await supabase
      .from("addresses")
      .update({
        label,
        address_line: address,
        phone,
        pincode,
        delivery_instructions: instructions,
        is_default: isDefault,
      })
      .eq("id", Number(id));

    toast.success("Address updated!");
    navigate("/manage-addresses");
  };

  return (
    <div className="max-w-md mx-auto p-5 space-y-5 bg-app min-h-screen">
      <h2 className="text-2xl font-semibold text-text-primary">Edit Address</h2>

      {/* Label */}
      <select
        className="
          bg-white border border-border 
          text-text-primary 
          w-full p-3 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-primary 
          transition
        "
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      >
        <option value="home">Home</option>
        <option value="office">Office</option>
        <option value="other">Other</option>
      </select>

      {/* Full Address */}
      <textarea
        className="
          bg-white border border-border 
          text-text-primary 
          placeholder:text-text-muted
          w-full p-3 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-primary 
          transition
        "
        placeholder="Full address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* Pincode */}
      <input
        className="
          bg-white border border-border 
          text-text-primary 
          placeholder:text-text-muted
          w-full p-3 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-primary 
          transition
        "
        placeholder="Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
      />

      {/* Phone */}
      <input
        className="
          bg-white border border-border 
          text-text-primary 
          placeholder:text-text-muted
          w-full p-3 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-primary 
          transition
        "
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Delivery Instructions */}
      <textarea
        className="
          bg-white border border-border 
          text-text-primary 
          placeholder:text-text-muted
          w-full p-3 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-primary 
          transition
        "
        placeholder="Delivery instructions (optional)"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      />

      {/* Default Checkbox */}
      <label className="flex items-center gap-2 text-text-primary">
        <input
          type="checkbox"
          checked={isDefault}
          disabled={totalAddresses === 1}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        Set as default address
      </label>

      {/* Save Button */}
      <Button onClick={save} block>
        Save Changes
      </Button>
    </div>
  );
}
