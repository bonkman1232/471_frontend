import { useState, useEffect } from 'react';

interface Assignment {
  _id: string;
  title: string;
  supervisorName: string;
  status: string;
  assignedHistory?: { assignedBy: string; new: string; date: string }[];
}

interface Faculty {
  _id: string;
  name: string;
}

export default function AdminAssignment() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'reassigned' | 'unassigned'>('active');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [targetSupervisorName, setTargetSupervisorName] = useState('');

  // 1. FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const projRes = await fetch('http://localhost:1532/api/projects/search');
      const projData = await projRes.json();
      setAssignments(projData);

      const facRes = await fetch('http://localhost:1532/api/faculty/all');
      const facData = await facRes.json();
      setFacultyList(facData);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. HELPER: BADGES
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

  // 3. HANDLERS
  const openNewAssignmentModal = () => {
    setTargetProjectId('');
    setTargetSupervisorName('');
    setIsModalOpen(true);
  };

  const openEditModal = (project: Assignment) => {
    setTargetProjectId(project._id);
    setTargetSupervisorName(project.supervisorName === 'Unassigned' ? '' : project.supervisorName);
    setIsModalOpen(true);
  };

  const handleAssign = async () => {
    if (!targetProjectId || !targetSupervisorName) {
      alert("Please select both a project and a supervisor.");
      return;
    }

    try {
      const res = await fetch('http://localhost:1532/api/projects/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetProjectId,
          supervisorName: targetSupervisorName,
          adminName: "Admin"
        })
      });

      const data = await res.json(); // Read JSON response first

      if (res.ok) {
        alert("✅ Assignment Successful");
        setIsModalOpen(false);
        fetchData(); 
      } else {
        // Now 'data.message' will exist because backend sends it properly
        alert(`❌ Failed: ${data.message || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error("Assign error:", error);
      alert("❌ Network Error: Could not connect to server.");
    }
  };

  const handleRemove = async (projectId: string) => {
    if (!window.confirm("Remove this supervisor?")) return;
    try {
      const res = await fetch('http://localhost:1532/api/projects/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          supervisorName: "Unassigned",
          adminName: "Admin"
        })
      });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  // 4. FILTERING
  const unassignedCount = assignments.filter(p => p.supervisorName === 'Unassigned').length;
  const activeCount = assignments.filter(p => p.supervisorName !== 'Unassigned').length;

  const filteredAssignments = assignments.filter(project => {
    if (activeTab === 'unassigned') return project.supervisorName === 'Unassigned';
    if (activeTab === 'active') return project.supervisorName !== 'Unassigned';
    if (activeTab === 'reassigned') return project.assignedHistory && project.assignedHistory.length > 1;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Supervisor Assignments</h2>
          <p className="text-slate-500">Manage pairings & track history</p>
        </div>
        <button onClick={openNewAssignmentModal} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2">
          <span>+</span> Assign Supervisor
        </button>
      </div>

      <div className="border-b border-slate-200 mb-6 flex gap-8">
        <button onClick={() => setActiveTab('active')} className={`pb-2 font-bold ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Active ({activeCount})</button>
        <button onClick={() => setActiveTab('reassigned')} className={`pb-2 font-bold ${activeTab === 'reassigned' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Reassigned</button>
        <button onClick={() => setActiveTab('unassigned')} className={`pb-2 font-bold ${activeTab === 'unassigned' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Unassigned ({unassignedCount})</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Supervisor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={4} className="px-6 py-10 text-center">Loading...</td></tr> : 
             filteredAssignments.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center italic">No projects found.</td></tr> :
             filteredAssignments.map((project) => (
                <tr key={project._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{project.title}</td>
                  <td className="px-6 py-4">
                    {project.supervisorName === 'Unassigned' ? <span className="text-slate-400 italic">Unassigned</span> : 
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{project.supervisorName.charAt(0)}</div>
                        <span className="text-slate-700">{project.supervisorName}</span>
                      </div>
                    }
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => openEditModal(project)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">✎</button>
                    {project.supervisorName !== 'Unassigned' && (
                      <button onClick={() => handleRemove(project._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">✕</button>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Assign Supervisor</h3>
            
            <label className="block text-xs font-bold text-slate-500 mb-1">SELECT PROJECT</label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 bg-white"
            >
              <option value="" disabled>-- Choose a Project --</option>
              {assignments.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>

            <label className="block text-xs font-bold text-slate-500 mb-1">SELECT SUPERVISOR</label>
            <select
              value={targetSupervisorName}
              onChange={(e) => setTargetSupervisorName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 bg-white"
            >
              <option value="" disabled>-- Choose a Faculty --</option>
              {facultyList.map(f => (
                <option key={f._id} value={f.name}>{f.name}</option>
              ))}
            </select>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAssign} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}