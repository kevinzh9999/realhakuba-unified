// apps/web/src/app/[locale]/admin/owners/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Save, RefreshCw, Key } from 'lucide-react';

interface PropertyOwner {
  propertyName: string;
  hasPassword: boolean;
  lastUpdated?: string;
}

export default function AdminOwnersPage() {
  const t = useTranslations('Admin');
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOwner, setUpdatingOwner] = useState<string | null>(null);
  const [passwords, setPasswords] = useState<{ [key: string]: string }>({});
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 加载所有物业owners
  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/owners');
      if (response.ok) {
        const data = await response.json();
        setOwners(data.owners);
      } else {
        setErrorMessage('Failed to load owners');
      }
    } catch (error) {
      setErrorMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (propertyName: string, newPassword: string) => {
    if (!newPassword.trim()) {
      setErrorMessage('Password cannot be empty');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      setUpdatingOwner(propertyName);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await fetch('/api/admin/owners/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyName, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Password updated for ${propertyName}`);
        setPasswords(prev => ({ ...prev, [propertyName]: '' })); // 清空密码输入
        setShowPasswords(prev => ({ ...prev, [propertyName]: false }));
        // 刷新数据
        loadOwners();
      } else {
        setErrorMessage(data.error || 'Failed to update password');
      }
    } catch (error) {
      setErrorMessage('Network error');
    } finally {
      setUpdatingOwner(null);
    }
  };

  const togglePasswordVisibility = (propertyName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [propertyName]: !prev[propertyName]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading property owners...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Property Owner Settings</h1>
          <p className="text-gray-600 mt-1">Manage login passwords for property owners</p>
        </div>
        <Button onClick={loadOwners} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Owners List */}
      <div className="grid gap-4">
        {owners.map((owner) => (
          <Card key={owner.propertyName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="w-5 h-5 mr-2 text-blue-600" />
                  <span>{owner.propertyName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {owner.hasPassword ? (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      Password Set
                    </span>
                  ) : (
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      No Password
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Property Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Login Name:</span>
                    <span className="ml-2 font-medium">{owner.propertyName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Access URL:</span>
                    <span className="ml-2 text-blue-600">
                      /owner/login
                    </span>
                  </div>
                </div>

                {/* Password Update */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {owner.hasPassword ? 'Update Password' : 'Set Initial Password'}
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showPasswords[owner.propertyName] ? 'text' : 'password'}
                        value={passwords[owner.propertyName] || ''}
                        onChange={(e) => setPasswords(prev => ({
                          ...prev,
                          [owner.propertyName]: e.target.value
                        }))}
                        placeholder={owner.hasPassword ? "Enter new password" : "Set initial password"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(owner.propertyName)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords[owner.propertyName] ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <Button
                      onClick={() => updatePassword(owner.propertyName, passwords[owner.propertyName] || '')}
                      disabled={updatingOwner === owner.propertyName || !passwords[owner.propertyName]?.trim()}
                      className="whitespace-nowrap"
                    >
                      {updatingOwner === owner.propertyName ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span className="ml-2">
                        {owner.hasPassword ? 'Update' : 'Set Password'}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters. Owner will use property name + this password to login.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {owners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No properties found in configuration</p>
          <p className="text-sm mt-2">Check PROPS_SECRET_JSON environment variable</p>
        </div>
      )}
    </div>
  );
}