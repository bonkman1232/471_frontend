import { useState } from 'react';
import QRScanner from './QRScanner';
import { MapPin, QrCode, Search, Navigation } from 'lucide-react';

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

export default function LocationFinder() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedLocation, setScannedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScanSuccess = (location: Location) => {
    setScannedLocation(location);
    setShowScanner(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/locations/qr/${encodeURIComponent(searchTerm.trim())}`);
      if (res.ok) {
        const location = await res.json();
        setScannedLocation(location);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setScannedLocation(null);
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Location Finder</h2>
          <p className="text-slate-600 mt-1">Find locations using QR codes or search by QR reference</p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          Scan QR Code
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border">
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter QR code reference (e.g., QR-001)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {scannedLocation && (
            <button
              onClick={resetSearch}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Location Details */}
      {scannedLocation && (
        <div className="bg-white rounded-lg shadow p-6 border mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                Floor {scannedLocation.floor}, Block {scannedLocation.block}
              </h3>
              <p className="text-sm text-gray-600">QR Code: {scannedLocation.qrCodeRef}</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Location Found</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-700 mb-3">Rooms ({scannedLocation.rooms.length}):</h4>
              <div className="grid grid-cols-2 gap-2">
                {scannedLocation.rooms.map((room, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                    <span className="font-medium text-blue-600">{room.code}</span>
                    <span className="text-gray-600 ml-1">({room.number})</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 mb-3">Navigation:</h4>
              {scannedLocation.closestBlocks.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Closest Blocks:</p>
                  <div className="flex flex-wrap gap-1">
                    {scannedLocation.closestBlocks.map((block, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {block}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {scannedLocation.closestRooms.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Closest Rooms:</p>
                  <div className="flex flex-wrap gap-1">
                    {scannedLocation.closestRooms.map((room, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {room}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                Created {new Date(scannedLocation.createdAt).toLocaleDateString()}
                {scannedLocation.updatedAt !== scannedLocation.createdAt && (
                  <span className="ml-2">• Updated {new Date(scannedLocation.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                <span>Ready for navigation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!scannedLocation && (
        <div className="bg-white rounded-lg shadow p-8 text-center border">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Find a Location</h3>
            <p className="text-gray-600 mb-6">
              Scan a QR code or enter a QR reference to find location details and navigation information.
            </p>
            <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-sm text-gray-700">Click "Scan QR Code" to use your camera</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm text-gray-700">Point camera at a location QR code</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-sm text-gray-700">View location details instantly</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
