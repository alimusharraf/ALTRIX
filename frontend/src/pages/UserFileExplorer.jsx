import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Folder, Lock, Send } from 'lucide-react';
import axios from 'axios';

const UserFileExplorer = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sensitiveFiles, setSensitiveFiles] = useState([]);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/sensitive-files');
      setSensitiveFiles(response.data);
    } catch (error) {
      console.error('Error loading sensitive files:', error);
      setSensitiveFiles([]);
    }
  };

  const handleRequestAccess = async (fileId) => {
    if (!requestReason.trim()) {
      alert('Please provide a reason for access request');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/access-requests', null, {
        params: {
          user_id: user.user_id,
          file_id: fileId,
          reason: requestReason,
        },
      });
      alert('Access request submitted successfully');
      setRequestReason('');
    } catch (error) {
      console.error('Error submitting access request:', error);
      alert('Failed to submit access request');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar onLogout={handleLogout} role="user" onOpenChange={setIsSidebarOpen} />

      <div className={`transition-all duration-300 p-8 pt-24 ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">File Explorer</h1>
          <p className="text-gray-400">Browse sensitive files and request controlled access</p>
        </div>

        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Folder className="text-primary-500" />
            Sensitive Files
          </h3>
          <div className="space-y-4">
            {sensitiveFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <Lock className="text-red-500" size={24} />
                  <div>
                    <p className="text-white font-medium">{file.filename}</p>
                    <p className="text-sm text-gray-400">
                      {file.category} • {file.sensitivity_level} • {file.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Reason for access"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="px-3 py-2 bg-dark-800 border border-primary-800/30 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={() => handleRequestAccess(file.id)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Send size={16} />
                    Request Access
                  </button>
                </div>
              </div>
            ))}
            {sensitiveFiles.length === 0 && (
              <p className="text-gray-500 py-6 text-center">No sensitive files available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFileExplorer;
