import { updateUserPassword } from "@/services/user.service";
import React, { useState } from "react";
import { toast } from "react-toastify";

export const AccountSettings = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await updateUserPassword(user,{currentPassword,newPassword,confirmPassword}, authToken);
      if(response.success){
        toast.success(response.message)
      } else {
        toast.warn(response.message)
      }
      setConfirmPassword("");
      setCurrentPassword("")
      setNewPassword("")
    } catch (error) {
        console.log(error)
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-xl my-2">Change Password</span>
          </label>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input input-bordered mb-2"
          />
          <input
            type="password"
            value={newPassword}
            placeholder="New Password"
            onChange={(e) => setNewPassword(e.target.value)}
            className="input input-bordered mb-2"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input input-bordered"
          />
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-primary">Update Settings</button>
        </div>
      </form>
    </div>
  );
};
