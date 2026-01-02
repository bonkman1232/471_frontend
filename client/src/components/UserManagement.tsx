import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Edit, Trash2, Search } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  universityId: string;
  roles: string[];
  profile?: {
    department: string;
  };
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    universityId: '',
    password: '',
    roles: ['student'],
    department: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert('✅ User created successfully!');
        setShowCreateForm(false);
        resetForm();
        fetchUsers();
      } else {
        alert('❌ Failed to create user');
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert('❌ Server error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        universityId: formData.universityId,
        roles: formData.roles,
        department: formData.department
      };

      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (res.ok) {
        alert('✅ User updated successfully!');
        setEditingUser(null);
        resetForm();
        fetchUsers();
      } else {
        alert('❌ Failed to update user');
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert('❌ Server error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        alert('✅ User deleted successfully!');
        fetchUsers();
      } else {
        alert('❌ Failed to delete user');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert('❌ Server error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      universityId: '',
      password: '',
      roles: ['student'],
      department: ''
    });
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      universityId: user.universityId,
      password: '',
      roles: user.roles,
      department: user.profile?.department || ''
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.universityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    faculty: users.filter(u => u.roles.includes('faculty')).length,
    students: users.filter(u => u.roles.includes('student')).length,
    admin: users.filter(u => u.roles.includes('admin')).length
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Total Users</h3>
          <p className="text-2xl text-gray-900 mb-1">{stats.total}</p>
          <p className="text-sm text-gray-600">Active accounts</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Faculty</h3>
          <p className="text-2xl text-gray-900 mb-1">{stats.faculty}</p>
          <p className="text-sm text-gray-600">Faculty members</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Students</h3>
          <p className="text-2xl text-gray-900 mb-1">{stats.students}</p>
          <p className="text-sm text-gray-600">Enrolled</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Admins</h3>
          <p className="text-2xl text-gray-900 mb-1">{stats.admin}</p>
          <p className="text-sm text-gray-600">System admins</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">User</th>
                <th className="text-left p-4 font-medium text-gray-700">University ID</th>
                <th className="text-left p-4 font-medium text-gray-700">Roles</th>
                <th className="text-left p-4 font-medium text-gray-700">Department</th>
                <th className="text-left p-4 font-medium text-gray-700">Last Login</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{user.universityId}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {user.roles.map((role, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            role === 'admin' ? 'bg-red-100 text-red-800' :
                            role === 'faculty' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{user.profile?.department || '-'}</td>
                  <td className="p-4 text-gray-700">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </div>
      </div>

      {(showCreateForm || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            <form onSubmit={editingUser ? handleUpdate : handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="john@university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">University ID</label>
                <input
                  type="text"
                  required
                  value={formData.universityId}
                  onChange={(e) => setFormData({...formData, universityId: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="123456"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Roles</label>
                <select
                  multiple
                  value={formData.roles}
                  onChange={(e) => setFormData({...formData, roles: Array.from(e.target.selectedOptions, option => option.value)})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="ST">ST</option>
                  <option value="RA">RA</option>
                  <option value="TA">TA</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple roles</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Computer Science"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
