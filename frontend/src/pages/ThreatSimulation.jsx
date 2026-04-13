import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AlertTriangle, Shield } from 'lucide-react';
import axios from 'axios';

const ThreatSimulation = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('logon');

  const activityOptions = [
    { value: 'logon', label: 'Logon Activity' },
    { value: 'file_access', label: 'Sensitive File Access' },
    { value: 'usb_activity', label: 'USB Device Activity' },
    { value: 'email_activity', label: 'Email Activity' },
    { value: 'http_activity', label: 'HTTP / Web Activity' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRes = await axios.get('http://localhost:8000/api/users');
      const sortedUsers = [...usersRes.data].sort((a, b) => b.risk_score - a.risk_score);
      setUsers(sortedUsers);
      if (sortedUsers.length > 0) {
        setSelectedUserId(sortedUsers[0].user_id);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSimulation = async () => {
    if (!selectedUserId) {
      alert('Please select a user first');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/simulate-threat', null, {
        params: {
          user_id: selectedUserId,
          activity_type: selectedActivity,
        },
      });
      alert('Threat simulation executed successfully');
      loadUsers();
    } catch (error) {
      console.error('Error executing simulation:', error);
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
          <h1 className="text-3xl font-bold text-white mb-2">Threat Simulation</h1>
          <p className="text-gray-400">Launch controlled insider threat simulations</p>
        </div>

        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6 max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-primary-500" />
            Simulation Panel
          </h2>

          <p className="text-gray-400 mb-4">
            Select a real user from your current dataset to create a controlled incident and test detection workflows.
          </p>

          <label className="text-sm text-gray-300 mb-2 block">User</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-3 bg-dark-700 border border-primary-800/30 rounded-lg text-white focus:outline-none focus:border-primary-500 mb-4"
          >
            {users.map((userObj) => {
              return (
                <option key={userObj.user_id} value={userObj.user_id}>
                  {userObj.user_id} - {userObj.name} (Score: {userObj.risk_score.toFixed(1)})
                </option>
              );
            })}
          </select>

          <label className="text-sm text-gray-300 mb-2 block">Activity To Simulate</label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="w-full px-4 py-3 bg-dark-700 border border-primary-800/30 rounded-lg text-white focus:outline-none focus:border-primary-500 mb-4"
          >
            {activityOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>

          <button
            onClick={handleSimulation}
            className="w-full px-4 py-3 bg-gradient-pink-purple text-white rounded-lg font-semibold hover:opacity-90 transition-all mb-4"
          >
            Run Simulation
          </button>

          <div className="text-sm text-gray-500 space-y-1 border border-primary-800/20 rounded-lg p-4 bg-dark-700/50">
            <p className="flex items-center gap-2"><Shield size={14} /> Creates critical incident</p>
            <p>• Increases risk score by +15</p>
            <p>• Logs suspicious activity in user timeline</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThreatSimulation;
