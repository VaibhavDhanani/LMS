import React, { useState } from 'react';
import {LoadingSpinner} from "@/components/ui/loading.jsx";
import {updateUser} from "@/services/user.service.jsx";

const ProfileDetails = ({ user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    // console.log(user)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        // Get form data
        const formData = {
            _id: user._id,
            name: e.target.name.value,
            email: e.target.email.value,
            biography: e.target.biography.value
        };

        try {
            const authToken = localStorage.getItem("authToken");
            const response = await updateUser(formData,authToken);

            if (!response) {
                throw new Error('Failed to update profile');
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-5 p-4">
            <h2 className="text-2xl font-bold mb-6">Profile Details</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Profile updated successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Full Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="input input-bordered w-full"
                        defaultValue={user.name}
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        disabled
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="input input-bordered w-full"
                        defaultValue={user.email}
                        required
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Biography</span>
                    </label>
                    <textarea
                        name="biography"
                        className="textarea textarea-bordered h-24 w-full"
                        placeholder="Tell us about yourself"
                        defaultValue={user.biography}
                    ></textarea>
                </div>

                <div className="form-control mt-6">
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingSpinner size="small" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileDetails;