import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, Navigation, Phone, ExternalLink, Loader2, AlertCircle, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom hospital icon
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Hospital {
  id: number;
  lat: number;
  lon: number;
  name: string;
  phone?: string;
  website?: string;
  amenity: string;
}

// Component to dynamically center map
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

const Hospitals: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user's live location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc: [number, number] = [latitude, longitude];
        setUserLocation(loc);
        setMapCenter(loc);
        fetchNearbyHospitals(latitude, longitude);
      },
      (err) => {
        setIsLoading(false);
        setError('Failed to access location. Please enable location permissions or search manually.');
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Manual search using Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        fetchNearbyHospitals(lat, lon);
      } else {
        setError('Location not found. Try a different search term.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch hospitals using Overpass API
  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      // Query OpenStreetMap for hospitals within ~5km radius (5000 meters)
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          node["amenity"="clinic"](around:5000,${lat},${lon});
        );
        out body;
      `;
      
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      
      const data = await res.json();
      
      const results: Hospital[] = data.elements
        .filter((el: any) => el.tags && el.tags.name) // Only hospitals with names
        .map((el: any) => ({
          id: el.id,
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name,
          phone: el.tags.phone || el.tags['contact:phone'],
          website: el.tags.website || el.tags['contact:website'],
          amenity: el.tags.amenity
        }));
        
      setHospitals(results);
      if (results.length === 0) {
        setError('No hospitals found within 5km of this location.');
      }
    } catch (err) {
      setError('Failed to fetch hospitals. The map service might be busy.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-txt mb-1">Find Nearby Hospitals</h2>
          <p className="text-txt-secondary text-sm">Locate clinics and hospitals near you and get instant directions.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3 flex-col sm:flex-row">
          <button 
            onClick={handleGetLocation}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20 transition-all"
          >
            <Crosshair size={18} />
            Use My Location
          </button>
          
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search city or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm font-medium text-txt outline-none focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-glow)] transition-all"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-danger-bg border border-danger/20 text-danger px-5 py-4 rounded-xl flex items-center gap-3 shrink-0">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative z-0">
        {isLoading && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
            <Loader2 size={40} className="text-brand animate-spin mb-3" />
            <p className="text-sm font-semibold text-txt-secondary">Locating facilities...</p>
          </div>
        )}
        
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className="font-semibold text-sm">You are here</div>
              </Popup>
            </Marker>
          )}

          {/* Hospital Markers */}
          {hospitals.map((hospital) => (
            <Marker 
              key={hospital.id} 
              position={[hospital.lat, hospital.lon]}
              icon={hospitalIcon}
            >
              <Popup className="hospital-popup">
                <div className="p-1 max-w-[200px]">
                  <h3 className="font-bold text-sm text-txt mb-1 leading-tight">{hospital.name}</h3>
                  <p className="text-[0.65rem] uppercase tracking-wider text-txt-muted font-bold mb-3">{hospital.amenity}</p>
                  
                  {hospital.phone && (
                    <div className="flex items-center gap-2 text-xs text-txt-secondary mb-1.5">
                      <Phone size={12} className="text-brand" />
                      <a href={`tel:${hospital.phone}`} className="!text-txt-secondary hover:!text-brand">{hospital.phone}</a>
                    </div>
                  )}
                  
                  {hospital.website && (
                    <div className="flex items-center gap-2 text-xs text-txt-secondary mb-3">
                      <ExternalLink size={12} className="text-brand" />
                      <a href={hospital.website} target="_blank" rel="noreferrer" className="!text-txt-secondary hover:!text-brand truncate">Website</a>
                    </div>
                  )}

                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 !bg-brand !text-white text-xs font-semibold rounded-lg hover:!bg-brand-hover transition-colors"
                  >
                    <Navigation size={14} className="!text-white" />
                    Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Hospitals;
