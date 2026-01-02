import { useState } from 'react';

// TYPES
interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

interface SupervisorData {
  name: string;
  universityId: string;
  availability: string;
  capacity: number;
  slots: TimeSlot[];
}

export default function Supervisor() {
  // 1. STATE
  const [searchId, setSearchId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [data, setData] = useState<SupervisorData>({
    name: '',
    universityId: '',
    availability: 'available',
    capacity: 5,
    slots: []
  });

  // New Slot Input State
  const [newSlot, setNewSlot] = useState<TimeSlot>({ day: 'Monday', start: '', end: '' });

  // 2. FETCH DATA (Login Simulation)
  const handleLoadProfile = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:1532/api/faculty/${searchId}`);
      if (res.ok) {
        const profile = await res.json();
        setData(profile);
        setIsLoaded(true);
      } else {
        alert("Supervisor ID not found in database!");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. HANDLE UPDATES
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:1532/api/faculty/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) // Send full state to backend
      });

      if (res.ok) {
        alert("✅ Availability Published Successfully!");
      } else {
        alert("❌ Failed to update profile.");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4. SLOT MANAGEMENT
  const addSlot = () => {
    if (!newSlot.start || !newSlot.end) return alert("Please fill in start and end times.");
    // Add to list
    setData({ ...data, slots: [...data.slots, newSlot] });
    // Reset inputs
    setNewSlot({ day: 'Monday', start: '', end: '' });
  };

  const removeSlot = (indexToRemove: number) => {
    setData({
      ...data,
      slots: data.slots.filter((_, idx) => idx !== indexToRemove)
    });
  };

  // --- VIEW 1: LOGIN / SEARCH ---
  if (!isLoaded) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Supervisor Login</h2>
        <p className="text-slate-500 mb-6">Enter your Faculty ID to manage your availability.</p>
        
        <input 
          type="text" 
          placeholder="e.g. 23101532"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 mb-4 text-center text-lg"
        />
        
        <button 
          onClick={handleLoadProfile}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Searching..." : "Load Profile"}
        </button>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="max-w-5xl mx-auto px-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Supervisor Dashboard</h2>
          <p className="text-slate-500">Welcome back, <span className="font-semibold text-blue-600">{data.name}</span></p>
        </div>
        <button onClick={() => setIsLoaded(false)} className="text-sm text-slate-400 hover:text-red-500 underline">
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SETTINGS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Availability Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span>🟢</span> Current Status
            </h3>
            <select 
              value={data.availability}
              onChange={(e) => setData({...data, availability: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="away">On Leave</option>
            </select>
          </div>

          {/* Capacity Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span>👥</span> Supervision Capacity
            </h3>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                value={data.capacity}
                onChange={(e) => setData({...data, capacity: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <span className="text-sm text-slate-500 whitespace-nowrap">Students</span>
            </div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            {loading ? "Saving..." : "Publish Availability"}
          </button>

        </div>

        {/* RIGHT COLUMN: OFFICE HOURS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📅</span> Office Hours Management
          </h3>

          {/* ADD NEW SLOT FORM */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-bold text-slate-500 mb-1">DAY</label>
              <select 
                value={newSlot.day}
                onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-bold text-slate-500 mb-1">FROM</label>
              <input 
                type="time" 
                value={newSlot.start}
                onChange={(e) => setNewSlot({...newSlot, start: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-bold text-slate-500 mb-1">TO</label>
              <input 
                type="time" 
                value={newSlot.end}
                onChange={(e) => setNewSlot({...newSlot, end: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <button 
              onClick={addSlot}
              className="px-6 py-2 bg-slate-800 text-white font-bold rounded-md hover:bg-slate-900 transition-colors"
            >
              Add
            </button>
          </div>

          {/* SLOT LIST */}
          <div className="space-y-3">
            {data.slots.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">No office hours listed yet.</div>
            ) : (
              data.slots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-blue-700 w-24">{slot.day}</span>
                    <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                  
                  {/* DELETE BUTTON */}
                  <button 
                    onClick={() => removeSlot(index)}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove Slot"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}