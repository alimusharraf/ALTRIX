import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import ShapRiskBreakdown from '../components/ShapRiskBreakdown';
import axios from 'axios';

const UserIntelligence = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [shapData, setShapData] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users');
      setAllUsers(response.data);
      
      // Auto-select first user
      if (response.data.length > 0) {
        setSelectedUserId(response.data[0].user_id);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserDetails = async (userId) => {
    try {
      const [userRes, historyRes, activitiesRes, incidentsRes, shapRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/users/${userId}`),
        axios.get(`http://localhost:8000/api/users/${userId}/risk-history`),
        axios.get(`http://localhost:8000/api/users/${userId}/activities?limit=15`),
        axios.get(`http://localhost:8000/api/users/${userId}/incidents`),
        axios.get(`http://localhost:8000/api/users/${userId}/shap-values`)
      ]);

      setSelectedUser(userRes.data);
      
      const formattedHistory = historyRes.data.map(h => ({
        date: new Date(h.timestamp).toLocaleDateString(),
        score: h.risk_score
      }));
      setRiskHistory(formattedHistory);
      
      setActivities(activitiesRes.data);
      setIncidents(incidentsRes.data);
      setShapData(shapRes.data);
    } catch (error) {
      console.error('Error loading user details:', error);
      setShapData([]);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const riskLevel = selectedUser.risk_score < 30 ? 'Low' : 
                    selectedUser.risk_score < 60 ? 'Medium' : 
                    selectedUser.risk_score < 80 ? 'High' : 'Critical';
  
  const riskColor = selectedUser.risk_score < 30 ? 'text-green-500' : 
                    selectedUser.risk_score < 60 ? 'text-yellow-500' : 
                    selectedUser.risk_score < 80 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar onLogout={handleLogout} role="admin" onOpenChange={setIsSidebarOpen} />
      
      <div className={`transition-all duration-300 p-8 pt-24 ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Intelligence</h1>
          <p className="text-gray-400">Deep Dive Analysis</p>
        </div>

        {/* User Selector */}
        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6 mb-8">
          <label className="block text-white font-semibold mb-3">Select Employee</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-3 bg-dark-700 border border-primary-800/30 rounded-lg text-white focus:outline-none focus:border-primary-500 text-lg"
          >
            {allUsers.map(u => (
              <option key={u.user_id} value={u.user_id}>
                {u.user_id} - {u.name} ({u.department}) - Risk: {u.risk_score.toFixed(1)}
              </option>
            ))}
          </select>
        </div>

        {/* User Profile Card */}
        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-pink-purple rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                <p className="text-gray-400">{selectedUser.department} • {selectedUser.user_id}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${riskColor} mb-1`}>
                {selectedUser.risk_score.toFixed(1)}
              </div>
              <div className={`text-sm ${riskColor}`}>{riskLevel} Risk</div>
              {selectedUser.is_malicious && (
                <div className="mt-2 px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                  Known Threat Actor
                </div>
              )}
            </div>
          </div>

          {/* Risk Progress Bar */}
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-pink-purple transition-all duration-500"
              style={{ width: `${selectedUser.risk_score}%` }}
            />
          </div>
        </div>

        {/* IT Score Trend */}
        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary-500" />
            IT Risk Score Trend (Last 7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ec4899' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#colorGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', r: 5 }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Timeline */}
          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="text-primary-500" />
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">{activity.description}</p>
                    <span className="text-sm text-primary-500">
                      +{activity.risk_contribution.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-primary-900/20 text-primary-400 rounded text-xs">
                    {activity.activity_type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Incidents */}
          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-primary-500" />
              Incident History
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium">{incident.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      incident.severity === 'critical' ? 'bg-red-900/30 text-red-400' :
                      incident.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                      incident.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{incident.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      incident.status === 'open' ? 'bg-yellow-900/30 text-yellow-400' :
                      incident.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>
                      {incident.status}
                    </span>
                    {incident.status === 'resolved' && incident.is_guilty !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        incident.is_guilty ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                      }`}>
                        {incident.is_guilty ? 'Guilty' : 'Not Guilty'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(incident.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {incidents.length === 0 && (
                <p className="text-gray-500 text-center py-8">No incidents recorded</p>
              )}
            </div>
          </div>
        </div>

        <ShapRiskBreakdown shapData={shapData} />
      </div>
    </div>
  );
};

export default UserIntelligence;
