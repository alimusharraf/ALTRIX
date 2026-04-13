import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import axios from 'axios';

const IncidentManagement = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const incidentsRes = await axios.get('http://localhost:8000/api/incidents');
      setIncidents(incidentsRes.data);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const handleResolveIncident = async (incidentId, isGuilty) => {
    try {
      await axios.patch(`http://localhost:8000/api/incidents/${incidentId}`, {
        status: 'resolved',
        is_guilty: isGuilty,
      });
      loadIncidents();
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error resolving incident:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const openIncidents = incidents.filter((i) => i.status === 'open').length;
  const inProgressIncidents = incidents.filter((i) => i.status === 'in_progress').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar onLogout={handleLogout} role="admin" onOpenChange={setIsSidebarOpen} />

      <div className={`transition-all duration-300 p-8 pt-24 ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Incident Management</h1>
          <p className="text-gray-400">Track, triage, and resolve security incidents</p>
        </div>

        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Open ({openIncidents})
              </h3>
              <div className="space-y-3">
                {incidents
                  .filter((i) => i.status === 'open')
                  .map((incident) => (
                    <div
                      key={incident.id}
                      className="p-4 bg-dark-700 rounded-lg cursor-pointer hover:border-primary-500 border border-transparent transition-all"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <p className="text-white font-medium text-sm mb-1">{incident.title}</p>
                      <p className="text-xs text-gray-400">{incident.user_name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          incident.severity === 'critical'
                            ? 'bg-red-900/30 text-red-400'
                            : incident.severity === 'high'
                            ? 'bg-orange-900/30 text-orange-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-500 mb-4 flex items-center gap-2">
                <Shield size={20} />
                In Progress ({inProgressIncidents})
              </h3>
              <div className="space-y-3">
                {incidents
                  .filter((i) => i.status === 'in_progress')
                  .map((incident) => (
                    <div
                      key={incident.id}
                      className="p-4 bg-dark-700 rounded-lg cursor-pointer hover:border-primary-500 border border-transparent transition-all"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <p className="text-white font-medium text-sm mb-1">{incident.title}</p>
                      <p className="text-xs text-gray-400">{incident.user_name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          incident.severity === 'critical'
                            ? 'bg-red-900/30 text-red-400'
                            : incident.severity === 'high'
                            ? 'bg-orange-900/30 text-orange-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-500 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Resolved ({resolvedIncidents})
              </h3>
              <div className="space-y-3">
                {incidents
                  .filter((i) => i.status === 'resolved')
                  .slice(0, 8)
                  .map((incident) => (
                    <div key={incident.id} className="p-4 bg-dark-700 rounded-lg">
                      <p className="text-white font-medium text-sm mb-1">{incident.title}</p>
                      <p className="text-xs text-gray-400 mb-1">{incident.user_name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          incident.is_guilty
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-green-900/30 text-green-400'
                        }`}
                      >
                        {incident.is_guilty ? 'Guilty' : 'Not Guilty'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-4">{selectedIncident.title}</h2>
            <div className="space-y-3 mb-6">
              <p className="text-gray-400">
                <span className="text-white font-semibold">User:</span> {selectedIncident.user_name}
              </p>
              <p className="text-gray-400">
                <span className="text-white font-semibold">Severity:</span>{' '}
                <span className="text-red-400">{selectedIncident.severity}</span>
              </p>
              <p className="text-gray-400">
                <span className="text-white font-semibold">Description:</span> {selectedIncident.description}
              </p>
            </div>

            <div className="flex gap-4">
              {selectedIncident.status !== 'resolved' && (
                <>
                  <button
                    onClick={() => handleResolveIncident(selectedIncident.id, true)}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark Resolved (Guilty)
                  </button>
                  <button
                    onClick={() => handleResolveIncident(selectedIncident.id, false)}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark Resolved (Not Guilty)
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;
