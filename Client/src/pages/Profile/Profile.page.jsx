import React, { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Camera, Edit2, Save, X, Mail, FileText } from "lucide-react";
import { updateUser } from "@/services/user.service";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/apis/firebase.config";

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    _id: user?._id,
    name: user?.name || "",
    email: user?.email || "",
    biography: user?.biography || "",
    profilePicture: user?.profilePicture || "",
  });

  // Reference to hidden file input
  const fileInputRef = useRef(null);

  // Open file input when camera button is clicked
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  // Handle Image Upload
  const handleProfilePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      // Generate unique file name
      const uniqueName = `${Date.now()}-${user.name}`;
      const storageRef = ref(storage, `profiles/${uniqueName}`);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update profile picture in UI
      setFormData((prev) => ({ ...prev, profilePicture: downloadURL }));

      // Send updated profile picture to backend
      const token = localStorage.getItem("authToken");
      await updateUser({ ...formData, profilePicture: downloadURL }, token);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("authToken");
      await updateUser(formData, token);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-16">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center relative">
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-indigo-600" />
            )}
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePhoto}
            />
            {/* Camera Button */}
            <button
              onClick={handleCameraClick}
              className="absolute bottom-1 right-1 bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-700 shadow-md"
              disabled={loading}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {formData.name || "Your Name"}
            </h1>
            <p className="text-gray-500 mt-1">{formData.email}</p>
          </div>

          {!isEditing && (
            <div className="mt-8 max-w-2xl mx-auto">
              {/* Profile Info Cards */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Mail className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="font-medium text-gray-700">Email</h3>
                  </div>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="font-medium text-gray-700">Biography</h3>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">
                    {formData.biography || "No biography provided yet. Click 'Edit Profile' to add your bio."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-white rounded-md flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 transition"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6 text-left">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, biography: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;