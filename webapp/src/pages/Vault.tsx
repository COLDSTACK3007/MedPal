import { useState, useRef } from 'react';
import { Shield, FileText, Upload, FileUp, Download, Eye, FileDigit, FileIcon, Search, Calendar, Filter, X } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: 'Lab Report' | 'Prescription' | 'Vaccination' | 'ID Card';
  date: string;
  size: string;
  fileUrl?: string; // For user uploaded files
}

const Vault = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Lab Report' | 'Prescription' | 'Vaccination' | 'ID Card'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<'Lab Report' | 'Prescription' | 'Vaccination' | 'ID Card'>('Lab Report');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', title: 'Complete Blood Count (CBC)', type: 'Lab Report', date: '2026-07-28', size: '1.2 MB' },
    { id: '2', title: 'Dr. Smith - Lisinopril', type: 'Prescription', date: '2026-07-15', size: '450 KB' },
    { id: '3', title: 'COVID-19 Booster', type: 'Vaccination', date: '2025-12-10', size: '200 KB' },
    { id: '4', title: 'National Health Insurance ID', type: 'ID Card', date: '2024-01-05', size: '2.5 MB' },
    { id: '5', title: 'Lipid Panel Results', type: 'Lab Report', date: '2026-06-20', size: '1.0 MB' },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Auto-fill name if empty
      if (!uploadName) {
        setUploadName(file.name.split('.')[0]);
      }
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName) return;

    // Create a local object URL for the uploaded file so we can view/download it later
    const fileUrl = URL.createObjectURL(uploadFile);
    const sizeInMB = (uploadFile.size / 1024 / 1024).toFixed(2);
    const displaySize = sizeInMB === '0.00' ? `${(uploadFile.size / 1024).toFixed(1)} KB` : `${sizeInMB} MB`;
    
    const newDoc: Document = {
      id: Date.now().toString(),
      title: uploadName,
      type: uploadType,
      date: new Date().toISOString().split('T')[0],
      size: displaySize,
      fileUrl: fileUrl,
    };

    setDocuments([newDoc, ...documents]);
    
    // Reset and close
    setUploadFile(null);
    setUploadName('');
    setUploadType('Lab Report');
    setShowUploadModal(false);
  };

  const openAndDownloadDocument = (doc: Document) => {
    let urlToOpen = doc.fileUrl;
    let fileName = `${doc.title.replace(/\s+/g, '_')}`;

    if (!urlToOpen) {
      // Mock for pre-existing documents
      const blob = new Blob([`Mock content for ${doc.title}`], { type: 'text/plain' });
      urlToOpen = URL.createObjectURL(blob);
      fileName += '.txt';
    } else {
      // If the user uploaded a file, keep its original extension if possible
      // (For this mock, the browser will figure out how to save it based on the blob type,
      // but appending a proper extension is better in production)
    }

    // 1. Open in new tab (Natively opens PDFs, Images in the browser viewer)
    window.open(urlToOpen, '_blank');

    // 2. Trigger actual file download
    const a = document.createElement('a');
    a.href = urlToOpen;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up mock URLs
    if (!doc.fileUrl) {
      setTimeout(() => URL.revokeObjectURL(urlToOpen!), 100);
    }
  };

  const filteredDocs = documents.filter(doc => 
    (activeTab === 'All' || doc.type === activeTab) &&
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = ['All', 'Lab Report', 'Prescription', 'Vaccination', 'ID Card'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-teal flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-txt">Digital Health Vault</h1>
            <p className="text-sm text-txt-muted">Securely store and manage your medical documents</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-brand/20 hover:bg-brand-hover transition-colors"
          >
            <Upload size={18} />
            Upload Document
          </button>
          <span className="text-[0.65rem] text-txt-muted uppercase font-bold tracking-wider">Accepted: PDF, PNG, JPG</span>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Controls Bar */}
        <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row justify-between gap-4 bg-base/50">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                  ? 'bg-brand text-white shadow-sm' 
                  : 'bg-base border border-border-dark text-txt-secondary hover:text-txt'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 min-w-[250px]">
            <div className="flex-1 flex items-center gap-2 bg-base border border-border-dark rounded-xl px-3 py-1.5 focus-within:border-brand transition-colors">
              <Search size={16} className="text-txt-muted" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-txt placeholder:text-txt-muted"
              />
            </div>
            <button className="p-2 border border-border-dark bg-base rounded-xl text-txt-secondary hover:text-brand transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="divide-y divide-border-dark">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base/30 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${doc.type === 'Lab Report' ? 'bg-blue-500/10 text-blue-500' :
                    doc.type === 'Prescription' ? 'bg-purple-500/10 text-purple-500' :
                    doc.type === 'Vaccination' ? 'bg-teal/10 text-teal' :
                    'bg-orange-500/10 text-orange-500'
                  }
                `}>
                  {doc.type === 'Lab Report' ? <FileDigit size={20} /> :
                   doc.type === 'Prescription' ? <FileText size={20} /> :
                   doc.type === 'Vaccination' ? <Shield size={20} /> :
                   <FileIcon size={20} />
                  }
                </div>
                <div>
                  <button 
                    onClick={() => openAndDownloadDocument(doc)}
                    className="text-sm font-bold text-txt hover:text-brand transition-colors text-left"
                    title="Click to Download and Open Native Viewer"
                  >
                    {doc.title}
                  </button>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-txt-muted mt-0.5">
                    <span className="font-medium text-txt-secondary">{doc.type}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {doc.date}</span>
                    <span className="flex items-center gap-1"><FileText size={12} /> {doc.size}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="p-2 rounded-lg text-txt-secondary hover:bg-brand/10 hover:text-brand transition-colors" 
                  title="Quick Preview"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => openAndDownloadDocument(doc)}
                  className="p-2 rounded-lg text-txt-secondary hover:bg-brand/10 hover:text-brand transition-colors" 
                  title="Download & Open"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-base border-2 border-dashed border-border-dark flex items-center justify-center text-txt-muted mb-3">
                <FileUp size={24} />
              </div>
              <p className="text-txt font-semibold">No documents found</p>
              <p className="text-sm text-txt-muted mt-1">Upload a new file or adjust your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-dark flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-dark bg-base">
              <h3 className="font-bold text-txt flex items-center gap-2">
                <Upload size={18} className="text-brand" />
                Upload New Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1.5 rounded-lg text-txt-secondary hover:bg-danger/10 hover:text-danger transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUpload} className="p-5 space-y-4 bg-base">
              {/* File Drop/Select Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploadFile ? 'border-brand bg-brand/5' : 'border-border-dark hover:border-brand/50 bg-surface'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg" 
                  className="hidden" 
                  required={!uploadFile}
                />
                {uploadFile ? (
                  <div className="flex flex-col items-center">
                    <FileText size={32} className="text-brand mb-2" />
                    <p className="text-sm font-bold text-txt">{uploadFile.name}</p>
                    <p className="text-xs text-txt-muted mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-brand font-bold mt-3">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-txt-muted">
                    <FileUp size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-bold text-txt">Click to browse files</p>
                    <p className="text-xs mt-1">Supports PDF, PNG, JPG (Max 10MB)</p>
                  </div>
                )}
              </div>

              {/* Document Details */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-muted ml-1">Document Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Blood Test Results" 
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" 
                  required 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-muted ml-1">Document Type</label>
                <select 
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand cursor-pointer"
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="ID Card">ID Card</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-surface border border-border-dark text-txt hover:bg-base transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!uploadFile}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand/20"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Quick Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border-dark flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-border-dark bg-base">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 text-brand rounded-lg">
                  {selectedDoc.type === 'Lab Report' ? <FileDigit size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-txt">{selectedDoc.title}</h3>
                  <p className="text-xs text-txt-muted">{selectedDoc.date} • {selectedDoc.size}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-lg text-txt-secondary hover:bg-danger/10 hover:text-danger transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body (Fake Document) */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-white text-black min-h-[400px]">
              
              {/* If it's a newly uploaded user file, we can't show a custom HTML preview, so we show an icon or native iframe */}
              {selectedDoc.fileUrl ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-20">
                  <FileText size={64} className="mb-4 text-brand opacity-80" />
                  <p className="text-lg font-bold text-gray-800">User Uploaded Document</p>
                  <p className="text-sm mt-1">This document has been securely stored.</p>
                  <button 
                    onClick={() => openAndDownloadDocument(selectedDoc)}
                    className="mt-6 px-4 py-2 bg-brand text-white rounded-lg font-bold hover:bg-brand-hover shadow-md flex items-center gap-2"
                  >
                    <Download size={16} /> Download & Open Native Viewer
                  </button>
                </div>
              ) : selectedDoc.id === '1' ? (
                // CBC HTML Preview
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider">City PathLabs</h2>
                    <p>Complete Blood Count (CBC) Report</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <p><span className="font-bold">Patient Name:</span> Pranesh M</p>
                      <p><span className="font-bold">Age/Gender:</span> 28/M</p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-bold">Date:</span> 2026-07-28</p>
                      <p><span className="font-bold">Sample:</span> Blood</p>
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="py-2">Test Name</th>
                        <th className="py-2">Result</th>
                        <th className="py-2">Units</th>
                        <th className="py-2">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Hemoglobin</td>
                        <td className="py-2 font-bold">14.2</td>
                        <td className="py-2">g/dL</td>
                        <td className="py-2">13.0 - 17.0</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">White Blood Cells</td>
                        <td className="py-2 font-bold">7.2</td>
                        <td className="py-2">x 10^3/uL</td>
                        <td className="py-2">4.0 - 11.0</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Red Blood Cells</td>
                        <td className="py-2 font-bold">4.8</td>
                        <td className="py-2">x 10^6/uL</td>
                        <td className="py-2">4.5 - 5.5</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-red-600">Platelets</td>
                        <td className="py-2 font-bold text-red-600">140</td>
                        <td className="py-2">x 10^3/uL</td>
                        <td className="py-2">150 - 450 (Low)</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="pt-8 text-center text-xs text-gray-500">
                    <p>*** End of Report ***</p>
                    <p>Electronically verified by Dr. A. Sharma</p>
                  </div>
                </div>
              ) : selectedDoc.id === '5' ? (
                // Lipid Panel HTML Preview
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider">City PathLabs</h2>
                    <p>Lipid Panel & Fasting Glucose Report</p>
                  </div>
                  <table className="w-full text-left border-collapse mt-6">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="py-2">Test Name</th>
                        <th className="py-2">Result</th>
                        <th className="py-2">Units</th>
                        <th className="py-2">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">Total Cholesterol</td>
                        <td className="py-2 font-bold">185</td>
                        <td className="py-2">mg/dL</td>
                        <td className="py-2">&lt; 200</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2">HDL Cholesterol</td>
                        <td className="py-2 font-bold">55</td>
                        <td className="py-2">mg/dL</td>
                        <td className="py-2">&gt; 40</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 text-red-600">LDL Cholesterol</td>
                        <td className="py-2 font-bold text-red-600">110</td>
                        <td className="py-2">mg/dL</td>
                        <td className="py-2">&lt; 100 (High)</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-2">Fasting Blood Sugar</td>
                        <td className="py-2 font-bold">90</td>
                        <td className="py-2">mg/dL</td>
                        <td className="py-2">70 - 100</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-2">Resting Blood Pressure</td>
                        <td className="py-2 font-bold">118/78</td>
                        <td className="py-2">mmHg</td>
                        <td className="py-2">&lt; 120/80</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-4 italic text-xs">* Note: Your Fasting Blood Sugar (90 mg/dL) and BP (118/78) match the records automatically synced to your Vital Signs Monitor.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
                  <FileText size={64} className="mb-4 opacity-50" />
                  <p className="text-lg">HTML Preview Unavailable</p>
                  <p className="text-sm">Click below to download or view natively.</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-border-dark bg-base flex justify-end gap-3">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-lg font-bold text-txt-secondary hover:bg-surface transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  if (selectedDoc) openAndDownloadDocument(selectedDoc);
                }}
                className="px-4 py-2 rounded-lg font-bold bg-brand text-white hover:bg-brand-hover transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download & Open Native Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;
