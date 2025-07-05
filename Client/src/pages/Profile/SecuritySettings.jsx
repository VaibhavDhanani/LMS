import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { updateUserPassword } from '@/services/user.service';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
const SecuritySettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {  token } = useAuth();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await updateUserPassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        },
        token
      );
      
      if (response.success) {
        setSuccess(response.message || 'Password updated successfully');
        toast.success(response.message);
      } else {
        setError(response.message || 'Failed to update password');
        toast.warn(response.message);
      }
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to update password');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center mb-8">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
            </div>

            {/* Password Change Section */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Change Password
              </h2>

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Recommendations */}
            <div className="mt-12 border-t pt-8">
              <h2 className="text-lg font-medium text-gray-900">Security Recommendations</h2>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Use a strong password with at least 8 characters, including numbers and special characters
                  </p>
                </li>
                {/* <li className="flex items-start">
                  <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Enable two-factor authentication for additional security
                  </p>
                </li> */}
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Regularly update your password and never share it with others
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;