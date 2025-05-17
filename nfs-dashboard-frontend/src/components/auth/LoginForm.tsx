import React, { useState } from 'react';
import { KeyRound, Mail, Shield } from 'lucide-react';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [pendingToken, setPendingToken] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call backend login API
      const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        setError(errData.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const { token } = await loginRes.json();

      // 2. Fetch user profile using the token
      const profileRes = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: token },
      });

      if (!profileRes.ok) {
        setError('Failed to fetch user profile');
        setLoading(false);
        return;
      }

      const user = await profileRes.json();

      // 3. If user has 2FA enabled, prompt for 2FA code
      if (user.twoFASecret) {
        setShow2FA(true);
        setPendingToken(token);
        setPendingUser(user);
        setLoading(false);
        return;
      }

      // 4. Normal login
      localStorage.setItem('token', token);
      onLogin(user);
      if (user.role?.name === 'admin') {
        navigate('/admin');
        return;
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pendingToken,
        },
        body: JSON.stringify({
          secret: pendingUser?.twoFASecret,
          token: twoFACode,
        }),
      });

      if (!res.ok) {
        setError('Invalid 2FA code');
        setLoading(false);
        return;
      }

      // 2FA success: proceed with login
      localStorage.setItem('token', pendingToken);
      onLogin(pendingUser!);
      if (pendingUser?.role?.name === 'admin') {
        navigate('/admin');
        return;
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to NFS Explorer
          </h2>
        </div>
        {!show2FA ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handle2FASubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="twofa" className="sr-only">2FA Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    id="twofa"
                    type="text"
                    required
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    className="appearance-none rounded relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter 2FA code"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Verifying...' : 'Verify 2FA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;