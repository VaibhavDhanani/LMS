// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import { User, Book, PlayCircle, Heart, Settings, LogOut } from 'lucide-react';
import {useAuth} from "@/context/AuthContext.jsx";
import {getUser} from "@/services/user.service.jsx";
import { LoadingSpinner } from '@/components/ui/loading.jsx';
import ProfileDetails from "@/components/User/ProfileDetails.jsx";
import {UserCourses} from "@/components/User/UserCourses.jsx";
import {UserLearning} from "@/components/User/UserLearning.jsx";
import {UserWishlist} from "@/components/User/UserWishlist.jsx";
import {AccountSettings} from "@/components/User/AccountSettings.jsx";

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const authToken = localStorage.getItem('authToken');
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const userData = await getUser(user.id, authToken);
        if (mounted) {
          setLoggedUser(userData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [authToken, user.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileDetails user={loggedUser} />;
      case 'courses':
        return <UserCourses user={loggedUser} />;
      case 'learning':
        return <UserLearning user={loggedUser} />;
      case 'wishlist':
        return <UserWishlist user={loggedUser} />;
      case 'settings':
        return <AccountSettings user={loggedUser} />;
      default:
        return <ProfileDetails user={loggedUser} />;
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
              { loggedUser ? renderContent() : <div className="flex justify-center items-center h-40">
                <LoadingSpinner variant="primary" size="large" />
              </div>  }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;