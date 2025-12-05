import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { getProfile } from "../../api/profileService";
import Button from "../../components/ui/button";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  async function loadProfile() {
    setLoading(true);
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-text-muted">
        <p>Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-app p-5">
      {/* Dropdown menu */}
      <div
        className="
          mt-2 w-48 bg-white border border-border 
          rounded-2xl shadow-card overflow-hidden
        "
      >
        <button
          onClick={() => navigate("edit-profile")}
          className="
            block w-full text-left px-4 py-3 
            text-text-primary hover:bg-gray-50 transition
          "
        >
          Edit Profile
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="
            block w-full text-left px-4 py-3 
            text-text-primary hover:bg-gray-50 transition
          "
        >
          Orders
        </button>

        <button
          onClick={handleLogout}
          className="
            block w-full text-left px-4 py-3 
            text-red-600 font-medium hover:bg-gray-50 transition
          "
        >
          Logout
        </button>
      </div>

      {/* Profile Content */}
      <div className="max-w-lg mx-auto p-4 space-y-5">
        <h2 className="text-2xl font-semibold text-text-primary">My Profile</h2>

        {/* Profile Card */}
        <div
          className="
            bg-white border border-border 
            shadow-card rounded-2xl p-5 space-y-3
          "
        >
          <p className="text-text-primary">
            <strong className="text-text-muted">Name:</strong>{" "}
            {profile.name || "Not set"}
          </p>

          <p className="text-text-primary">
            <strong className="text-text-muted">Email:</strong> {profile.email}
          </p>

          <p className="text-text-primary">
            <strong className="text-text-muted">Phone:</strong>{" "}
            {profile.phone || "Not set"}
          </p>

          <p className="text-text-primary">
            <strong className="text-text-muted">Pincode:</strong>{" "}
            {profile.pincode || "Not set"}
          </p>
        </div>

        {/* Buttons */}
        <Button block onClick={() => navigate("/edit-profile")}>
          Edit Profile
        </Button>

        <Button
          block
          variant="secondary"
          onClick={() => navigate("/manage-addresses")}
        >
          Manage Addresses
        </Button>
      </div>
    </div>
  );
}
