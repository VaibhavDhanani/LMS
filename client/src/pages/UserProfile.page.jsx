import React, { useState } from 'react';
import { User, Book, PlayCircle, Heart, Settings, LogOut } from 'lucide-react';

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePicture: 'https://i.pravatar.cc/150?img=3',
    type: 'Instructor'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileDetails user={user} />;
      case 'courses':
        return <MyCourses />;
      case 'learning':
        return <MyLearning />;
      case 'wishlist':
        return <Wishlist />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <ProfileDetails user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="avatar online">
                <div className="w-24 rounded-full">
                  <img src={user.profilePicture} alt="Profile" />
                </div>
              </div>
              <h2 className="card-title">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="badge badge-primary">{user.type}</p>

              <div className="w-full mt-4 space-y-2">
                {[
                  { icon: <User />, label: 'Profile', value: 'profile' },
                  { icon: <Book />, label: 'My Courses', value: 'courses' },
                  { icon: <PlayCircle />, label: 'My Learning', value: 'learning' },
                  { icon: <Heart />, label: 'Wishlist', value: 'wishlist' },
                  { icon: <Settings />, label: 'Account Settings', value: 'settings' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setActiveTab(item.value)}
                    className={`btn btn-ghost w-full justify-start ${
                      activeTab === item.value ? 'btn-active' : ''
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                <div className="divider"></div>

                <button className="btn btn-ghost btn-error w-full justify-start">
                  <LogOut />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDetails = ({ user }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
      <form className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Full Name</span>
          </label>
          <input 
            type="text" 
            placeholder="Full Name" 
            className="input input-bordered" 
            defaultValue={user.name} 
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input 
            type="email" 
            placeholder="Email" 
            className="input input-bordered" 
            defaultValue={user.email} 
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Headline</span>
          </label>
          <input 
            type="text" 
            placeholder="Professional Headline" 
            className="input input-bordered" 
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Biography</span>
          </label>
          <textarea 
            className="textarea textarea-bordered h-24" 
            placeholder="Tell us about yourself"
          ></textarea>
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

const MyCourses = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Courses</h2>
      <div className="space-y-4">
        <div className="card card-side bg-base-100 shadow-xl">
          <figure className="w-48"><img src="https://img.daisyui.com/images/stock/photo-1635805737707-575c4f40470d.jpg" alt="Course"/></figure>
          <div className="card-body">
            <h2 className="card-title">React Complete Course</h2>
            <p>Learn React from Scratch to Advanced</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">View Course</button>
            </div>
          </div>
        </div>
        {/* Add more course cards */}
      </div>
    </div>
  );
};

const MyLearning = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Learning</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <figure><img src="https://img.daisyui.com/images/stock/photo-1635805737707-575c4f40470d.jpg" alt="Course"/></figure>
          <div className="card-body">
            <h2 className="card-title">Python Programming</h2>
            <progress className="progress progress-primary w-full" value="60" max="100"></progress>
            <p>60% Completed</p>
          </div>
        </div>
        {/* Add more learning progress cards */}
      </div>
    </div>
  );
};

const Wishlist = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Wishlist</h2>
      <div className="space-y-4">
        <div className="card card-side bg-base-100 shadow-xl">
          <figure className="w-48"><img src="https://img.daisyui.com/images/stock/photo-1635805737707-575c4f40470d.jpg" alt="Course"/></figure>
          <div className="card-body">
            <h2 className="card-title">Machine Learning A-Z</h2>
            <p>Complete Machine Learning Course</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Add to Cart</button>
              <button className="btn btn-ghost">Remove</button>
            </div>
          </div>
        </div>
        {/* Add more wishlist items */}
      </div>
    </div>
  );
};

const AccountSettings = () => {
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

export default UserProfilePage;