import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from 'react-router-dom';

const Navigationbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Destructure user and logout from AuthContext
  const navigate = useNavigate();
  return (
    <div className="navbar bg-base-100 border border-black">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl"
        onClick={()=> navigate('/')}
        >LMS</a>
      </div>

      {user && user.isInstructor &&(
        <div className="flex-1">
          <a className="btn btn-ghost text-xl"
            onClick={() => navigate('/mycourses')} 
          >
            My Courses
          </a>
        </div>
      )}
      {user && !user.isInstructor &&(
        <div className="flex-1">
          <a className="btn btn-ghost text-xl"
            onClick={() => navigate('/mylearnings')} 
          >
            My Learnings
          </a>
        </div>
      )}

      <div className="flex-none gap-2">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />
        </div>

        {/* Mobile Dropdown Menu */}
        <div className="dropdown dropdown-end md:hidden">
          <label
            tabIndex={0}
            className="btn btn-ghost md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </label>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 w-52 p-2 shadow bg-base-100 rounded-box"
            >
              <li>
                <a>My Learning</a>
              </li>
              <li>
                <a>Watch List</a>
              </li>
            </ul>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a>My Learning</a>
            </li>
            <li>
              <a>Watch List</a>
            </li>
          </ul>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="User Avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {user ? (
              <>
                <li>
                  <a href="/user/profile" className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/auth">Login</a>
                </li>
                <li>
                  <a href="/auth">Sign Up</a>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Logout Button for Desktop */}
        {user && (
          <button
            onClick={logout}
            className="btn btn-error ml-4 hidden md:block"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navigationbar;
