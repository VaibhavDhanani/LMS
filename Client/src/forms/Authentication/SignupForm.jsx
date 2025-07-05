import GoogleSignInButton from "@/components/ui/googleButton";
import { useState } from "react";

export const SignupForm = ({ formData, handleChange, handleSubmit, handleGoogleSubmit }) => {
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [roleSelected, setRoleSelected] = useState(false);


  // Password validation rules
  const validatePassword = (password) => {
    const rules = [
      { rule: password.length >= 8, message: "At least 8 characters long" },
      { rule: /[A-Z]/.test(password), message: "At least one capital letter" },
      { rule: /[0-9]/.test(password), message: "At least one number" },
      {
        rule: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: "At least one special character",
      },
    ];
    setPasswordErrors(rules.filter((r) => !r.rule).map((r) => r.message));
  };

  // Handle password change & validation
  const handlePasswordChange = (e) => {
    handleChange(e);
    validatePassword(e.target.value);
  };

  // Confirm Password Validation
  const handleConfirmPasswordChange = (e) => {
    handleChange(e);
    setConfirmPasswordError(
      e.target.value !== formData.password ? "Passwords do not match" : ""
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md bg-white">
      {/* Role Selection (Mandatory Before Showing Signup Options) */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">What are you?</span>
          </label>
          <select
            name="role"
            className="select select-bordered"
            value={formData.role}
            onChange={(e) => {
              handleChange(e);
              setRoleSelected(!!e.target.value);
            }}
            required
          >
            <option value="" disabled>
              Select your role
            </option>
            <option value="false">Student</option>
            <option value="true">Instructor</option>
          </select>
        </div>
      </form>

      {/* Show Signup Options Only After Role Selection */}
      {roleSelected && (
        <>
          <div className=" my-4" />
          {/* Google Signup */}
          <div className="text-center">
            <p className="text-lg font-semibold">Sign up with Google</p>

          <GoogleSignInButton onClick={handleGoogleSubmit}/>
          </div>

          <div className="divider my-4">OR</div>

          {/* Manual Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                className="input input-bordered"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input with Validation */}
            <div className="form-control relative">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                className="input input-bordered"
                value={formData.password}
                onChange={handlePasswordChange}
                required
              />
              {passwordErrors.length > 0 && (
                <div className="mt-1 text-sm bg-white border border-gray-200 rounded-md p-2 shadow-md">
                  <p className="text-gray-600 font-semibold mb-1">
                    Password Requirements:
                  </p>
                  <ul className="space-y-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="text-xs text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="input input-bordered"
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {confirmPasswordError && (
                <p className="text-xs text-red-600 mt-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordErrors.length > 0 || confirmPasswordError}
              >
                Sign Up
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SignupForm;
