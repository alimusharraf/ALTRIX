import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';

const UserDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [riskHistory, setRiskHistory] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user.user_id]);

  const loadDashboardData = async () => {
    try {
      // Load risk history
      const historyRes = await axios.get(`http://localhost:8000/api/users/${user.user_id}/risk-history`);
      const formattedHistory = historyRes.data.map(h => ({
        date: new Date(h.timestamp).toLocaleDateString(),
        score: h.risk_score
      }));
      setRiskHistory(formattedHistory);

      // Load activities
      const activitiesRes = await axios.get(`http://localhost:8000/api/users/${user.user_id}/activities?limit=10`);
      setActivities(activitiesRes.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const currentRisk = riskHistory.length > 0 ? riskHistory[riskHistory.length - 1].score : 0;
  const riskLevel = currentRisk < 30 ? 'Low' : currentRisk < 60 ? 'Medium' : currentRisk < 80 ? 'High' : 'Critical';
  const riskColor = currentRisk < 30 ? 'text-green-500' : currentRisk < 60 ? 'text-yellow-500' : currentRisk < 80 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar onLogout={handleLogout} role="user" onOpenChange={setIsSidebarOpen} />
      
      <div className={`transition-all duration-300 p-8 pt-24 ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-400">Your Security Dashboard</p>
        </div>

        {/* IT Risk Score Card */}
        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-primary-500" />
              Your IT Risk Score
            </h2>
            <div className={`text-3xl font-bold ${riskColor}`}>
              {currentRisk.toFixed(1)}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Risk Level: <span className={riskColor}>{riskLevel}</span></span>
              <span>Last Updated: Today</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-pink-purple transition-all duration-500"
                style={{ width: `${currentRisk}%` }}
              />
            </div>
          </div>

          {/* Risk Trend Chart */}
          <div className="h-64 mt-6">
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
                  dot={{ fill: '#ec4899', r: 4 }}
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

        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-primary-500" />
            Recent Activity Timeline
          </h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-dark-700 rounded-lg">
                <div className="mt-1">
                  <Activity size={20} className="text-primary-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  Risk: <span className="text-primary-500">+{activity.risk_contribution.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
