import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, LogOut, Settings, Shield, Smartphone  } from 'lucide-react';
import { User } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/auth/profile`, {
      headers: { Authorization: token || '' }
    })
      .then(res => res.ok ? res.json() : user)
      .then(data => setProfile(data))
      .catch(() => setProfile(user));
  }, [isOpen, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsOpen(false);
    onLogout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
      >
        <UserCircle className="h-8 w-8 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{profile?.email || user.email}</p>
            <p className="text-xs text-gray-500">
              {profile?.role?.name || user.role?.name || ''}
            </p>
          </div>

          {(profile?.role?.name || user.role?.name) === 'admin' && (
            <Link
              to="/admin"
              className="block px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Link>
          )}

          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Link>

          <Link
            to="/2fa-setup"
            className="block px-4 py-2 text-sm text-purple-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            {(profile?.twoFASecret || profile?.twoFactorEnabled) ? 'Manage 2FA' : 'Enable 2FA'}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;