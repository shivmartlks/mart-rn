import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function AddAddress({ user }) {
  const navigate = useNavigate();

  const [label, setLabel] = useState("home");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [serviceable, setServiceable] = useState(null);
  const [isDefault, setIsDefault] = useState(false);

  const [isFirstAddress, setIsFirstAddress] = useState(false);

  useEffect(() => {
    checkIfFirstAddress();
  }, []);

  const checkIfFirstAddress = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id);

    setIsFirstAddress(!data || data.length === 0);
  };

  const checkServiceability = async (pin) => {
    if (pin.length !== 6) return;

    const { data } = await supabase
      .from("serviceable_pincodes")
      .select("*")
      .eq("pincode", pin)
      .maybeSingle();

    setServiceable(!!data);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const json = await res.json();

      setAddress(json.display_name || "");
      const pin = json.address.postcode || "";
      setPincode(pin);
      checkServiceability(pin);
    });
  };

  const saveAddress = async () => {
    if (!address.trim() || !phone.trim()) {
      toast.error("Address & phone required");
      return;
    }

    if (serviceable === false) {
      toast("This pincode is not serviceable.");
      return;
    }

    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label,
      address_line: address,
      pincode,
      phone,
      delivery_instructions: instructions,
      latitude: coords.lat,
      longitude: coords.lng,
      is_default: isFirstAddress ? true : isDefault,
    });

    if (error) {
      toast.error("Error in Fetching Address" + error.message);
      return;
    }

    navigate("/cart");
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-5 bg-app min-h-screen">
      <h2 className="text-2xl font-semibold text-text-primary">Add Address</h2>

      {/* Use my location */}
      <Button onClick={getCurrentLocation} block>
        Use My Current Location
      </Button>

      {/* Address Label */}
      <select
        className="
          bg-white 
          border border-border 
          text-text-primary 
          w-full 
          p-3 
          rounded-xl 
          focus:outline-none 
          focus:ring-2 
          focus:ring-primary
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
          bg-white 
          border border-border 
          text-text-primary 
          placeholder:text-text-muted 
          w-full p-3 
          rounded-xl 
          focus:outline-none 
          focus:ring-2 
          focus:ring-primary
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
        onChange={(e) => {
          setPincode(e.target.value);
          if (e.target.value.length === 6) checkServiceability(e.target.value);
        }}
      />

      {/* Serviceability */}
      {serviceable === false && (
        <p className="text-danger text-sm">
          ❌ Delivery not available in this area
        </p>
      )}
      {serviceable === true && (
        <p className="text-success text-sm">✔ Delivery available</p>
      )}

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
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Instructions */}
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

      {/* Default Address Checkbox */}
      {!isFirstAddress && (
        <label className="flex items-center gap-2 text-text-primary">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Set as default address
        </label>
      )}

      {/* Save Button */}
      <Button onClick={saveAddress} block>
        Save Address
      </Button>
    </div>
  );
}
