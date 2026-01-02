import { useState, useEffect } from 'react';

// 1. INTERFACES
interface Project {
  _id: string;
  title: string;
  department: string;
  status: string; 
  supervisorName?: string;
}

export default function AdvancedSearch() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // 2. FETCH PROJECTS
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('title', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (deptFilter) params.append('department', deptFilter);

        const res = await fetch(`http://localhost:1532/api/projects/search?${params.toString()}`);
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchProjects, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, deptFilter]);

  // 3. HELPER: STATUS BADGES
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase().replace(' ', '-') || 'unknown';

    switch (s) {
      case 'completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">COMPLETED</span>;
      case 'in-progress': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">IN PROGRESS</span>;
      case 'proposal': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">PROPOSAL</span>;
      case 'under_review': 
      case 'under-review': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">UNDER REVIEW</span>;
      default: return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">{s.toUpperCase()}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Project Search</h2>
          <p className="text-slate-500">Find and filter student projects</p>
        </div>

        {/* --- SEARCH INPUTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <input
            type="text"
            placeholder="Search by project title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="proposal">Proposal</option>
            <option value="in-progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="BBA">BBA</option>
            <option value="English">English</option>
            <option value="Architecture">Architecture</option>
          </select>
        </div>
      </div>

      {/* --- RESULTS TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Project Title</th>
              <th className="px-6 py-4">Supervisor</th>
              <th className="px-6 py-4">Dept</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No projects found matching filters.</td></tr>
            ) : (
              projects.map((project) => (
                <tr key={project._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{project.title}</td>
                  <td className="px-6 py-4">{project.supervisorName || "Unassigned"}</td>
                  <td className="px-6 py-4">{project.department || "-"}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(project.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}