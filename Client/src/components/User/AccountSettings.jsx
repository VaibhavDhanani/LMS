import React from "react";

export const AccountSettings = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <div className="space-y-4">
                <div className="form-control">
                    <label className="label cursor-pointer">
                        <span className="label-text">Email Notifications</span>
                        <input type="checkbox" className="toggle toggle-primary" />
                    </label>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Change Password</span>
                    </label>
                    <input
                        type="password"
                        placeholder="Current Password"
                        className="input input-bordered mb-2"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        className="input input-bordered mb-2"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="input input-bordered"
                    />
                </div>
                <div className="form-control mt-6">
                    <button className="btn btn-primary">Update Settings</button>
                </div>
            </div>
        </div>
    );
};
