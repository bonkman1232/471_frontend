import { useEffect, useState } from 'react';

const AdminView = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for assignment inputs
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newSupervisor, setNewSupervisor] = useState('');

  // Fetch Projects on Load
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetching all projects via search endpoint (empty query = all)
      const res = await fetch('http://localhost:1532/api/projects/search');
      const data = await res.json();
      setProjects(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (projectId: string) => {
    if (!newSupervisor) return alert("Please enter a supervisor name");

    try {
      const res = await fetch('http://localhost:1532/api/projects/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          supervisorName: newSupervisor,
          adminId: "admin_001" // Mock Admin ID
        })
      });

      if (res.ok) {
        alert("✅ Supervisor Assigned Successfully");
        setNewSupervisor('');
        setSelectedProject(null);
        fetchProjects(); // Refresh list
      } else {
        alert("❌ Assignment Failed");
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">
          Admin Dashboard: Project Allocation
        </h1>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
            <div className="col-span-5">Project Title</div>
            <div className="col-span-3">Current Supervisor</div>
            <div className="col-span-4">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading assignments...</div>
            ) : projects.map((p) => (
              <div key={p._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                
                {/* Title */}
                <div className="col-span-5">
                  <div className="font-medium text-slate-800">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.status}</div>
                </div>

                {/* Supervisor */}
                <div className="col-span-3 text-sm text-slate-600">
                  {p.supervisorName || <span className="text-red-400 italic">Unassigned</span>}
                </div>

                {/* Assign Action */}
                <div className="col-span-4">
                  {selectedProject === p._id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter Sup. Name"
                        className="w-full p-2 text-sm border rounded"
                        value={newSupervisor}
                        onChange={(e) => setNewSupervisor(e.target.value)}
                      />
                      <button 
                        onClick={() => handleAssign(p._id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setSelectedProject(null)}
                        className="px-3 py-1 bg-slate-300 text-slate-700 text-xs font-bold rounded"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectedProject(p._id)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100"
                    >
                      {p.supervisorName === "Unassigned" ? "Assign Supervisor" : "Reassign"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;