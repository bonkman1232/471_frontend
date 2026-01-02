import { useState, useEffect } from 'react';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  role: string;
  capacity: number; // New Field
  slots: { day: string; start: string; end: string }[]; // New Field
  availability?: {
    status: string;
  };
  profile?: {
    department?: string;
    office?: string;
  }
}

interface StudentViewProps {
  onChatStart: (faculty: Faculty) => void;
}

export default function StudentView({ onChatStart }: StudentViewProps) {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Faculty
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch('/api/faculty/all');
        const data = await res.json();
        setFacultyList(data);
      } catch (error) {
        console.error("Failed to fetch faculty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading directory...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Faculty Directory</h2>
        <p className="text-slate-500">Find a supervisor, check their capacity, and view office hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facultyList.map((faculty) => (
          <div key={faculty._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:shadow-md">
            
            {/* HEADER: Name & Status */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{faculty.name}</h3>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {faculty.profile?.department || 'CSE Department'}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                faculty.availability?.status === 'available' ? 'bg-green-100 text-green-700' :
                faculty.availability?.status === 'busy' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {faculty.availability?.status?.toUpperCase() || 'UNAVAILABLE'}
              </span>
            </div>

            {/* INFO ROWS */}
            <div className="space-y-3 mb-6 flex-1">
              
              {/* Email */}
              <div className="text-sm text-slate-600">
                <span className="font-semibold block text-xs text-slate-400">EMAIL</span>
                {faculty.email}
              </div>

              {/* Office & Capacity Row */}
              <div className="flex justify-between items-start">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold block text-xs text-slate-400">OFFICE</span>
                  {faculty.profile?.office || 'Not Listed'}
                </div>
                
                {/* --- NEW: CAPACITY --- */}
                <div className="text-sm text-right">
                  <span className="font-semibold block text-xs text-slate-400">CAPACITY</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold text-xs">
                     {faculty.capacity} Students
                  </span>
                </div>
              </div>

              {/* --- NEW: OFFICE HOURS DROPDOWN --- */}
              <div className="pt-2">
                 <span className="font-semibold block text-xs text-slate-400 mb-1">OFFICE HOURS</span>
                 <select className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none text-slate-700">
                    <option>📅 View Hours ({faculty.slots?.length || 0})</option>
                    {faculty.slots && faculty.slots.length > 0 ? (
                      faculty.slots.map((slot, idx) => (
                        <option key={idx} disabled>
                           {slot.day}: {slot.start} - {slot.end}
                        </option>
                      ))
                    ) : (
                      <option disabled>No office hours listed</option>
                    )}
                 </select>
              </div>

            </div>

            {/* MESSAGE BUTTON */}
            <button
              onClick={() => onChatStart(faculty)}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>💬</span> Send Message
            </button>
            
          </div>
        ))}
      </div>
    </div>
  );
}