import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface TwoFactorSetupProps {
  user: User;
}
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ user }) => {
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const generateSecret = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_URL}/api/generate-2fa-secret`, {
          method: 'POST',
          headers: {
            Authorization: token || '',
          },
        });

        if (!response.ok) throw new Error('Failed to generate 2FA secret');
        const data = await response.json();
        setSecret(data.secret);

        const qrCodeUrl = `otpauth://totp/NFSExplorer:${data.email}?secret=${data.secret}&issuer=NFSExplorer`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
        setQrCode(qrCodeImage);
      } catch (err) {
        setError('Failed to generate 2FA secret');
      }
    };

    generateSecret();
  }, []);

  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        navigate('/');
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [success, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          secret,
          token: verificationCode,
        }),
      });

      if (!response.ok) throw new Error('Invalid verification code');

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <Shield className="h-12 w-12 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">
        Welcome {user.name}
        Set Up Two-Factor Authentication
      </h2>

      {!success ? (
        <>
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              1. Install an authenticator app like Google Authenticator or Authy
            </p>
            <p className="text-gray-600 mb-4">
              2. Scan the QR code below with your authenticator app
            </p>
            <p className="text-gray-600">
              3. Enter the verification code from your app
            </p>
          </div>

          {qrCode && (
            <div className="flex justify-center mb-6">
              <img src={qrCode} alt="2FA QR Code" className="border p-2 rounded" />
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="\d{6}"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify and Enable 2FA
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-4 text-green-600">
            <Shield className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            2FA Successfully Enabled
          </h3>
          <p className="text-gray-600">
            Your account is now protected with two-factor authentication.
          </p>
          <p className="text-gray-500 mt-4">
            Returning to home in {redirectCountdown} seconds...
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/')}
          >
            Return to Home Now
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;