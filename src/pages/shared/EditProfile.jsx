import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../api/profileService";
import toast from "react-hot-toast";
import Button from "../../components/ui/button";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const profile = await getProfile();
      if (profile) {
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setPincode(profile.pincode || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({ name, phone, pincode });
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-text-muted">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-5 space-y-5 bg-app min-h-screen">
      <h2 className="text-2xl font-semibold text-text-primary">Edit Profile</h2>

      <form
        onSubmit={handleSave}
        className="
          space-y-4 bg-white p-5 rounded-2xl 
          border border-border shadow-card
        "
      >
        {/* Name */}
        <div className="space-y-1">
          <label className="block text-sm text-text-muted">Full Name</label>
          <input
            className="
              w-full bg-white border border-border 
              text-text-primary placeholder:text-text-muted
              p-3 rounded-xl focus:ring-2 focus:ring-primary 
              focus:outline-none transition
            "
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-sm text-text-muted">Phone Number</label>
          <input
            className="
              w-full bg-white border border-border 
              text-text-primary placeholder:text-text-muted
              p-3 rounded-xl focus:ring-2 focus:ring-primary 
              focus:outline-none transition
            "
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Primary phone number"
          />
        </div>

        {/* Pincode */}
        <div className="space-y-1">
          <label className="block text-sm text-text-muted">Pincode</label>
          <input
            className="
              w-full bg-white border border-border 
              text-text-primary placeholder:text-text-muted
              p-3 rounded-xl focus:ring-2 focus:ring-primary 
              focus:outline-none transition
            "
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g. 334603"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-3">
          {/* Save */}
          <Button type="submit" disabled={saving} loading={saving}>
            Save Changes
          </Button>

          {/* Cancel */}
          <Button
            type="button"
            onClick={() => navigate("/profile")}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
