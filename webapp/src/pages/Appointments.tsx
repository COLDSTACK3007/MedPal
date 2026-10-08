import { useState, useMemo } from 'react';
import { Calendar, Search, Star, ExternalLink, Filter, MapPin } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  rating: number;
  departments: string[];
  hasOnlineBooking: boolean;
  distance: string;
  state: string;
  district: string;
  town: string;
}

// Massive mock dataset simulating "every hospital in India" across various regions
const mockHospitals: Hospital[] = [
  // Tamil Nadu
  { id: '1', name: 'Apollo Main Hospital', rating: 4.8, departments: ['Cardiology', 'Neurology', 'Orthopedics'], hasOnlineBooking: true, distance: '2.5 km', state: 'Tamil Nadu', district: 'Chennai', town: 'Greams Road' },
  { id: '2', name: 'CMC Vellore', rating: 4.9, departments: ['Oncology', 'Cardiology', 'Pediatrics', 'General Medicine'], hasOnlineBooking: true, distance: '120 km', state: 'Tamil Nadu', district: 'Vellore', town: 'Ida Scudder Road' },
  { id: '3', name: 'Meenakshi Mission', rating: 4.5, departments: ['Gastroenterology', 'Neurology'], hasOnlineBooking: true, distance: '300 km', state: 'Tamil Nadu', district: 'Madurai', town: 'Lake Area' },
  
  // Maharashtra
  { id: '4', name: 'Lilavati Hospital', rating: 4.7, departments: ['Cardiology', 'Orthopedics', 'Dental'], hasOnlineBooking: true, distance: '1000+ km', state: 'Maharashtra', district: 'Mumbai', town: 'Bandra West' },
  { id: '5', name: 'KEM Hospital', rating: 4.4, departments: ['General Medicine', 'Neurology', 'Pediatrics'], hasOnlineBooking: false, distance: '1000+ km', state: 'Maharashtra', district: 'Pune', town: 'Rasta Peth' },
  
  // Delhi
  { id: '6', name: 'AIIMS New Delhi', rating: 4.9, departments: ['Oncology', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'], hasOnlineBooking: true, distance: '2000+ km', state: 'Delhi', district: 'New Delhi', town: 'Ansari Nagar' },
  { id: '7', name: 'Max Super Speciality', rating: 4.6, departments: ['Orthopedics', 'Dental', 'Gastroenterology'], hasOnlineBooking: true, distance: '2000+ km', state: 'Delhi', district: 'New Delhi', town: 'Saket' },
  
  // Karnataka
  { id: '8', name: 'Manipal Hospital', rating: 4.7, departments: ['Cardiology', 'Oncology'], hasOnlineBooking: true, distance: '350 km', state: 'Karnataka', district: 'Bangalore', town: 'Old Airport Road' },
  { id: '9', name: 'Narayana Health', rating: 4.8, departments: ['Cardiology', 'Pediatrics'], hasOnlineBooking: true, distance: '340 km', state: 'Karnataka', district: 'Bangalore', town: 'Bommasandra' },

  // Local/Generic
  { id: '10', name: 'City Care Clinic', rating: 4.2, departments: ['General Medicine', 'Dental'], hasOnlineBooking: false, distance: '1.2 km', state: 'Tamil Nadu', district: 'Chennai', town: 'Adyar' },
  { id: '11', name: 'Sunrise Dental Care', rating: 4.1, departments: ['Dental'], hasOnlineBooking: false, distance: '3.5 km', state: 'Tamil Nadu', district: 'Chennai', town: 'T. Nagar' },
];

const departmentsList = ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'General Medicine', 'Dental', 'Gastroenterology'];

const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filter States
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic dropdown options based on mock data
  const availableStates = useMemo(() => Array.from(new Set(mockHospitals.map(h => h.state))).sort(), []);
  
  const availableDistricts = useMemo(() => {
    return Array.from(new Set(mockHospitals
      .filter(h => selectedState === '' || h.state === selectedState)
      .map(h => h.district)
    )).sort();
  }, [selectedState]);

  const availableTowns = useMemo(() => {
    return Array.from(new Set(mockHospitals
      .filter(h => (selectedState === '' || h.state === selectedState) && (selectedDistrict === '' || h.district === selectedDistrict))
      .map(h => h.town)
    )).sort();
  }, [selectedState, selectedDistrict]);

  // Handle State Change (Reset downstream filters)
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setSelectedDistrict('');
    setSelectedTown('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    setSelectedTown('');
  };

  // The Smart Filtering Engine
  const filteredHospitals = useMemo(() => {
    return mockHospitals.filter(h => {
      // Free text search across name, town, or district
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        searchQuery === '' || 
        h.name.toLowerCase().includes(searchLower) ||
        h.town.toLowerCase().includes(searchLower) ||
        h.district.toLowerCase().includes(searchLower);

      const matchesDept = selectedDept === '' || h.departments.includes(selectedDept);
      const matchesState = selectedState === '' || h.state === selectedState;
      const matchesDistrict = selectedDistrict === '' || h.district === selectedDistrict;
      const matchesTown = selectedTown === '' || h.town === selectedTown;

      // Smart fallback: "even if they are giving just one information in sort, figure the hospitals that match it"
      // The logic inherently falls back correctly because empty strings match everything.
      return matchesSearch && matchesDept && matchesState && matchesDistrict && matchesTown;
    }).sort((a, b) => b.rating - a.rating); // Top rating first
  }, [searchQuery, selectedDept, selectedState, selectedDistrict, selectedTown]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-teal flex items-center justify-center text-white shadow-lg shadow-brand/20">
          <Calendar size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-txt">Schedule Appointment</h1>
          <p className="text-sm text-txt-muted">Find top-rated hospitals nationwide and book check-ups</p>
        </div>
      </div>

      {/* Advanced Search & Filter Section */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        
        {/* Top Row: Main Search & Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-base border border-border-dark rounded-xl px-4 py-3 focus-within:border-brand transition-colors">
            <Search size={18} className="text-txt-muted" />
            <input 
              type="text" 
              placeholder="Search by hospital name or location..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-txt placeholder:text-txt-muted"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${showFilters ? 'bg-brand text-white' : 'bg-base border border-border-dark text-txt-secondary hover:text-txt'}`}
          >
            <Filter size={18} />
            Sort / Filter
          </button>
        </div>

        {/* Expanded Geographic & Department Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border-dark mt-2">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-muted ml-1">State</label>
              <select value={selectedState} onChange={handleStateChange} className="w-full bg-base border border-border-dark rounded-xl px-4 py-2.5 text-txt outline-none focus:border-brand cursor-pointer">
                <option value="">All States (India)</option>
                {availableStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-muted ml-1">District</label>
              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={availableDistricts.length === 0} className="w-full bg-base border border-border-dark rounded-xl px-4 py-2.5 text-txt outline-none focus:border-brand cursor-pointer disabled:opacity-50">
                <option value="">All Districts</option>
                {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-muted ml-1">Town / Area</label>
              <select value={selectedTown} onChange={e => setSelectedTown(e.target.value)} disabled={availableTowns.length === 0} className="w-full bg-base border border-border-dark rounded-xl px-4 py-2.5 text-txt outline-none focus:border-brand cursor-pointer disabled:opacity-50">
                <option value="">All Towns</option>
                {availableTowns.map(town => <option key={town} value={town}>{town}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-muted ml-1">Department</label>
              <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="w-full bg-base border border-border-dark rounded-xl px-4 py-2.5 text-txt outline-none focus:border-brand cursor-pointer">
                <option value="">Any Department</option>
                {departmentsList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredHospitals.map(hospital => (
          <div key={hospital.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:border-brand/50 transition-colors flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold text-txt">{hospital.name}</h2>
                <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-1 rounded font-bold text-sm">
                  <Star size={14} fill="currentColor" /> {hospital.rating}
                </div>
              </div>
              <p className="text-sm text-txt-secondary flex items-center gap-1.5 mb-3 font-medium">
                <MapPin size={15} className="text-brand" /> 
                {hospital.town}, {hospital.district}, {hospital.state}
              </p>
              <div className="flex flex-wrap gap-2">
                {hospital.departments.map(dept => (
                  <span key={dept} className="bg-base border border-border-dark px-2.5 py-1 rounded-md text-xs font-bold text-txt-secondary uppercase tracking-wider">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border-dark mt-2">
              {hospital.hasOnlineBooking ? (
                <button 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(hospital.name + ' ' + hospital.town + ' appointment booking')}`, '_blank')}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white py-2.5 rounded-xl font-bold hover:bg-brand-hover transition-colors shadow-md shadow-brand/20"
                >
                  Book Appointment <ExternalLink size={16} />
                </button>
              ) : (
                <button disabled className="w-full bg-base border border-border-dark text-txt-muted py-2.5 rounded-xl font-bold cursor-not-allowed">
                  Online Booking Not Available
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && (
          <div className="col-span-1 xl:col-span-2 py-16 text-center">
            <div className="w-20 h-20 bg-base rounded-full flex items-center justify-center mx-auto mb-4 border border-border-dark">
              <Search size={32} className="text-txt-muted" />
            </div>
            <p className="font-bold text-xl text-txt mb-1">No hospitals found</p>
            <p className="text-txt-muted max-w-sm mx-auto">We couldn't find any hospitals matching your exact filters. Try broadening your location or department search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
