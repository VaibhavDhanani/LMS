import React, { useState } from "react";

export const SignupForm = ({ formData, handleChange, handleSubmit }) => {
  const [isPasswordEntering, setIsPasswordEntering] = useState(false);

  // Password validation rules
  const passwordRules = [
    { 
      rule: formData.password.length >= 8, 
      message: "At least 8 characters long" 
    },
    { 
      rule: /[A-Z]/.test(formData.password), 
      message: "Contains at least one capital letter" 
    },
    { 
      rule: /[0-9]/.test(formData.password), 
      message: "Contains at least one number" 
    },
    { 
      rule: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), 
      message: "Contains at least one special symbol" 
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="Enter username"
          className="input input-bordered"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          className="input input-bordered"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="form-control relative">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          className="input input-bordered"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setIsPasswordEntering(true)}
          onBlur={() => setIsPasswordEntering(false)}
        />
        <div className="absolute left-0 right-0 top-full">
          {isPasswordEntering && formData.password && (
            <div 
              className="mt-1 text-sm bg-white border border-gray-200 rounded-b-md p-2 shadow-md"
              style={{ 
                position: 'absolute', 
                zIndex: 10,
                maxHeight: '120px', 
                overflowY: 'auto' 
              }}
            >
              <p className="text-gray-600 font-semibold mb-1">Password Requirements:</p>
              <ul className="space-y-1">
                {passwordRules.map((rule, index) => (
                  <li 
                    key={index} 
                    className={`text-xs ${rule.rule ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {rule.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Confirm Password</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          className="input input-bordered"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">What are you?</span>
        </label>
        <select
          name="role"
          className="select select-bordered"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="" disabled>
            Select your role
          </option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
      </div>
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default SignupForm;