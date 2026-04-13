import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { CheckCircle, FileText, XCircle } from 'lucide-react';
import axios from 'axios';

const SensitiveAccessControl = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accessRequests, setAccessRequests] = useState([]);

  useEffect(() => {
    loadAccessRequests();
  }, []);

  const loadAccessRequests = async () => {
    try {
      const requestsRes = await axios.get('http://localhost:8000/api/access-requests?status=pending');
      setAccessRequests(requestsRes.data);
    } catch (error) {
      console.error('Error loading access requests:', error);
    }
  };

  const handleAccessRequest = async (requestId, action) => {
    try {
      await axios.patch(`http://localhost:8000/api/access-requests/${requestId}`, {
        action,
        admin_id: user.user_id,
      });
      loadAccessRequests();
    } catch (error) {
      console.error('Error handling access request:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar onLogout={handleLogout} role="admin" onOpenChange={setIsSidebarOpen} />

      <div className={`transition-all duration-300 p-8 pt-24 ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sensitive Access Control</h1>
          <p className="text-gray-400">Review and approve sensitive file access requests</p>
        </div>

        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="text-primary-500" />
            Pending Requests ({accessRequests.length})
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            Note: excessive file access requests increase the user's ML risk score.
          </p>

          <div className="space-y-4">
            {accessRequests.map((request) => (
              <div key={request.id} className="p-4 bg-dark-700 rounded-lg flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-medium">{request.user_name}</p>
                  <p className="text-sm text-gray-400">{request.filename}</p>
                  <p className="text-xs text-gray-500 mt-1">Reason: {request.reason}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccessRequest(request.id, 'approve')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Allow
                  </button>
                  <button
                    onClick={() => handleAccessRequest(request.id, 'deny')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <XCircle size={16} />
                    Deny
                  </button>
                </div>
              </div>
            ))}

            {accessRequests.length === 0 && (
              <p className="text-gray-500 text-center py-8">No pending access requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensitiveAccessControl;
