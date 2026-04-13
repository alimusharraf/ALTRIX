import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AlertTriangle } from 'lucide-react';
import axios from 'axios';
import ShapRiskBreakdown from '../components/ShapRiskBreakdown';

const UserAlerts = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [shapData, setShapData] = useState([]);

  useEffect(() => {
    loadShapData();
  }, [user.user_id]);

  const loadShapData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/users/${user.user_id}/shap-values`);
      setShapData(response.data);
    } catch (error) {
      console.error('Error loading SHAP data:', error);
      setShapData([]);
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
          <h1 className="text-3xl font-bold text-white mb-2">Alerts Feed</h1>
          <p className="text-gray-400">Explainable AI alert drivers for your risk score</p>
        </div>

        <div className="mb-4 flex items-center gap-2 text-white">
          <AlertTriangle className="text-primary-500" />
          <h3 className="text-xl font-bold">SHAP Explainability</h3>
        </div>

        <ShapRiskBreakdown shapData={shapData} />
      </div>
    </div>
  );
};

export default UserAlerts;
