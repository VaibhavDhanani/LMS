import React from "react";


export const LoginForm = ({ formData, handleChange, handleSubmit }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="form-control">
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
        />
      </div>
      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </div>
    </form>
  );