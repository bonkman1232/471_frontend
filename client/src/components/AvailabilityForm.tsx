import { useState } from 'react';

const AvailabilityForm = () => {
  const [capacity, setCapacity] = useState(0);
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  // ⚠️ Keep your real user ID here
  const userId = "PASTE_YOUR_COPIED_ID_HERE"; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/faculty/update-availability/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisionCapacity: capacity,
          availabilitySlots: [{ day, startTime, endTime }]
        })
      });
      
      if (res.ok) alert('✅ Availability updated!');
      else alert('❌ Update failed. Check User ID.');
      
    } catch (err) {
      console.error(err);
      alert('❌ Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-6">
      
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Blue Header Section */}
        <div className="bg-[#0056D2] p-8 text-center"> 
          <h2 className="text-3xl font-bold text-white tracking-wide">
            Faculty Settings
          </h2>
          <p className="text-blue-100 mt-2 text-sm">
            APCMS Module 2: Resource Management
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Capacity Field */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Student Capacity
            </label>
            <div className="flex items-center border-2 border-slate-200 rounded-lg focus-within:border-[#0056D2] transition-colors overflow-hidden">
              <span className="pl-4 text-slate-400">
                 👥
              </span>
              <input 
                type="number" 
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full p-3 outline-none text-slate-700 font-medium"
                placeholder="Ex. 5"
              />
            </div>
            <p className="text-xs text-slate-400">Max number of students you can supervise.</p>
          </div>

          <div className="border-t border-slate-100 my-4"></div>

          {/* Time Slot Section */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
              Weekly Consultation Slot
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Day Dropdown */}
              <div className="relative">
                <select 
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">▼</div>
              </div>

              {/* Start Time */}
              <input 
                type="time" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                onChange={(e) => setStartTime(e.target.value)}
              />

              {/* End Time */}
              <input 
                type="time" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              loading 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-[#0056D2] hover:bg-blue-700 hover:shadow-blue-200"
            }`}
          >
            {loading ? "Saving Changes..." : "Update System"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AvailabilityForm;