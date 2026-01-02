import { useState, useEffect } from 'react';

interface Location {
  _id: string;
  floor: number;
  block: string;
  rooms: {
    number: string;
    code: string;
  }[];
  closestBlocks: string[];
  closestRooms: string[];
  qrCodeRef: string;
  createdAt: string;
  updatedAt: string;
}

export default function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    floor: 1,
    block: '',
    rooms: [{ number: '', code: '' }],
    closestBlocks: '',
    closestRooms: '',
    qrCodeRef: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        closestBlocks: formData.closestBlocks.split(',').map(s => s.trim()).filter(s => s),
        closestRooms: formData.closestRooms.split(',').map(s => s.trim()).filter(s => s),
        rooms: formData.rooms.filter(room => room.number && room.code)
      };

      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('✅ Location created successfully!');
        setShowCreateForm(false);
        resetForm();
        fetchLocations();
      } else {
        alert('❌ Failed to create location');
      }
    } catch (error) {
      console.error("Error creating location:", error);
      alert('❌ Server error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    try {
      const payload = {
        ...formData,
        closestBlocks: formData.closestBlocks.split(',').map(s => s.trim()).filter(s => s),
        closestRooms: formData.closestRooms.split(',').map(s => s.trim()).filter(s => s),
        rooms: formData.rooms.filter(room => room.number && room.code)
      };

      const res = await fetch(`/api/locations/${editingLocation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('✅ Location updated successfully!');
        setEditingLocation(null);
        resetForm();
        fetchLocations();
      } else {
        alert('❌ Failed to update location');
      }
    } catch (error) {
      console.error("Error updating location:", error);
      alert('❌ Server error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        alert('✅ Location deleted successfully!');
        fetchLocations();
      } else {
        alert('❌ Failed to delete location');
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      alert('❌ Server error');
    }
  };

  const resetForm = () => {
    setFormData({
      floor: 1,
      block: '',
      rooms: [{ number: '', code: '' }],
      closestBlocks: '',
      closestRooms: '',
      qrCodeRef: ''
    });
  };

  const startEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      floor: location.floor,
      block: location.block,
      rooms: location.rooms,
      closestBlocks: location.closestBlocks.join(', '),
      closestRooms: location.closestRooms.join(', '),
      qrCodeRef: location.qrCodeRef
    });
  };

  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { number: '', code: '' }]
    });
  };

  const updateRoom = (index: number, field: 'number' | 'code', value: string) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index][field] = value;
    setFormData({
      ...formData,
      rooms: updatedRooms
    });
  };

  const removeRoom = (index: number) => {
    setFormData({
      ...formData,
      rooms: formData.rooms.filter((_, i) => i !== index)
    });
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading locations...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Location Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Location
        </button>
      </div>

      {(showCreateForm || editingLocation) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingLocation ? 'Edit Location' : 'Create New Location'}
            </h3>
            <form onSubmit={editingLocation ? handleUpdate : handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Floor</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Block</label>
                  <input
                    type="text"
                    required
                    value={formData.block}
                    onChange={(e) => setFormData({...formData, block: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="A"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">QR Code Reference</label>
                <input
                  type="text"
                  required
                  value={formData.qrCodeRef}
                  onChange={(e) => setFormData({...formData, qrCodeRef: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="QR-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rooms</label>
                {formData.rooms.map((room, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      required
                      value={room.number}
                      onChange={(e) => updateRoom(index, 'number', e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                      placeholder="Room number (01-18)"
                    />
                    <input
                      type="text"
                      required
                      value={room.code}
                      onChange={(e) => updateRoom(index, 'code', e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                      placeholder="Room code (e.g., 7B-16)"
                    />
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRoom}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Add Room
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Closest Blocks (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.closestBlocks}
                    onChange={(e) => setFormData({...formData, closestBlocks: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="A, B, C"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Closest Rooms (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.closestRooms}
                    onChange={(e) => setFormData({...formData, closestRooms: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="7A-16, 7B-15"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingLocation(null);
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
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {locations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No locations found. Add your first location!</p>
          </div>
        ) : (
          locations.map((location) => (
            <div key={location._id} className="bg-white rounded-lg shadow p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Floor {location.floor}, Block {location.block}</h3>
                  <p className="text-sm text-gray-600">QR Code: {location.qrCodeRef}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(location)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location._id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-slate-700 mb-2">Rooms ({location.rooms.length}):</h4>
                <div className="grid grid-cols-3 gap-2">
                  {location.rooms.map((room, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                      <span className="font-medium">{room.code}</span>
                      <span className="text-gray-600 ml-1">({room.number})</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {(location.closestBlocks.length > 0 || location.closestRooms.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {location.closestBlocks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Closest Blocks:</h4>
                      <div className="flex flex-wrap gap-1">
                        {location.closestBlocks.map((block, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {block}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {location.closestRooms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Closest Rooms:</h4>
                      <div className="flex flex-wrap gap-1">
                        {location.closestRooms.map((room, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {room}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Created {new Date(location.createdAt).toLocaleDateString()}
                {location.updatedAt !== location.createdAt && (
                  <span className="ml-2">• Updated {new Date(location.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
