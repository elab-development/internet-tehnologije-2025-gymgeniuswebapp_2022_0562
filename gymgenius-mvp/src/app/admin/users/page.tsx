'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Edit, Trash2, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/utils/api-client';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiFetch(`/api/admin/users?${params.toString()}`, {
              });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
              });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Update role error:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user, roleFilter]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            leftIcon={<ArrowLeft size={20} />}
            className="mb-4"
          >
            Nazad na admin kontrolnu tablu
          </Button>

          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Upravljanje korisnicima</h1>
          </div>
          <p className="text-gray-600">Upravljajte nalozima i dozvolama korisnika</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Pretraži po imejlu ili imenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              leftIcon={<Search size={20} />}
              fullWidth
            />

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sve uloge</option>
                <option value="guest">Gost</option>
                <option value="user">Korisnik</option>
                <option value="premium">Premium</option>
                <option value="admin">Admin</option>
              </select>

              <Button onClick={fetchUsers}>Pretraži</Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Korisnik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Imejl
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Uloga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kreiran
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.displayName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.userId, e.target.value)}
                        className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="guest">Guest</option>
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.userId)}
                        leftIcon={<Trash2 size={16} />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Obriši
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">Nema korisnika</div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
