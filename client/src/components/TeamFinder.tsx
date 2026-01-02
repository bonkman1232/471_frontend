import { useState, useEffect } from 'react';

interface GroupPost {
  _id: string;
  projectName: string;
  details: string;
  department: string;
  maxMembers: number;
  currentMembers: number;
  supervisorName: string;
  techStack: string[];
  postedBy: {
    _id: string;
    name: string;
    email: string;
    universityId: string;
    profile?: {
      department: string;
    };
  };
  members: {
    user: {
      _id: string;
      name: string;
      email: string;
      universityId: string;
    };
    joinedAt: string;
  }[];
  status: 'active' | 'filled' | 'archived';
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeamFinder() {
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    details: '',
    department: '',
    maxMembers: 4,
    supervisorName: '',
    techStack: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/group-posts');
      const data = await res.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch group posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/group-posts/${postId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: 'current-user-id' // This should come from auth context
        })
      });
      
      if (res.ok) {
        alert('✅ Successfully joined the team!');
        fetchPosts();
      } else {
        const error = await res.json();
        alert(`❌ Failed to join: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error joining post:", error);
      alert('❌ Server error');
    }
  };

  const handleLeavePost = async (postId: string) => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      const res = await fetch(`/api/group-posts/${postId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id' // This should come from auth context
        })
      });
      
      if (res.ok) {
        alert('✅ Successfully left the team!');
        fetchPosts();
      } else {
        alert('❌ Failed to leave team');
      }
    } catch (error) {
      console.error("Error leaving post:", error);
      alert('❌ Server error');
    }
  };

  const isCurrentUserMember = (post: GroupPost) => {
    // Check if current user is already a member (this should use actual auth context)
    return post.members.some(member => member.user._id === 'current-user-id');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/group-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s),
          postedBy: 'current-user-id' // This should come from auth context
        })
      });
      
      if (res.ok) {
        alert('✅ Team post created successfully!');
        setShowCreateForm(false);
        setFormData({
          projectName: '',
          details: '',
          department: '',
          maxMembers: 4,
          supervisorName: '',
          techStack: ''
        });
        fetchPosts();
      } else {
        alert('❌ Failed to create post');
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert('❌ Server error');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading team posts...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Team Finder</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Team Post
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Team Post</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Details</label>
                <textarea
                  required
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe your project"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Computer Science"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Supervisor Name</label>
                  <input
                    type="text"
                    required
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({...formData, supervisorName: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Dr. Smith"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.techStack}
                    onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="React, Express, MongoDB"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Max Members</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    required
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No team posts found. Create the first one!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{post.projectName}</h3>
                  <p className="text-sm text-gray-600">by {post.postedBy.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : post.status === 'filled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                  {post.status === 'active' && (
                    <button
                      onClick={() => isCurrentUserMember(post) ? handleLeavePost(post._id) : handleJoinPost(post._id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isCurrentUserMember(post)
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : post.currentMembers >= post.maxMembers
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      disabled={post.status !== 'active' || post.currentMembers >= post.maxMembers}
                    >
                      {isCurrentUserMember(post) ? 'Leave Team' : 
                       post.currentMembers >= post.maxMembers ? 'Full' : 'Join Team'}
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{post.details}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Department:</h4>
                  <p className="text-gray-600 text-sm">{post.department}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Supervisor:</h4>
                  <p className="text-gray-600 text-sm">{post.supervisorName}</p>
                </div>
              </div>
              
              {post.techStack.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-700 mb-2">Tech Stack:</h4>
                  <div className="flex flex-wrap gap-1">
                    {post.techStack.map((tech, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Members:</span> {post.currentMembers}/{post.maxMembers}
                  {post.members.length > 0 && (
                    <span className="ml-2">({post.members.map(m => m.user.name).join(', ')})</span>
                  )}
                </div>
                <div>
                  Created {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
