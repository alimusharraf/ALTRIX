import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { Users, AlertTriangle, Shield, FileText, Gauge, Activity, RefreshCw } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, incidentsRes, requestsRes, distRes] = await Promise.all([
        axios.get('http://localhost:8000/api/users'),
        axios.get('http://localhost:8000/api/incidents'),
        axios.get('http://localhost:8000/api/access-requests?status=pending'),
        axios.get('http://localhost:8000/api/dashboard/risk-distribution')
      ]);

      setUsers(usersRes.data);
      setIncidents(incidentsRes.data);
      setAccessRequests(requestsRes.data);
      setRiskDistribution(distRes.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const highRiskUsers = users.filter(u => u.risk_score >= 60).length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const maliciousUsers = users.filter(u => u.is_malicious).length;

  const avgRiskScore = users.length > 0
    ? users.reduce((sum, u) => sum + u.risk_score, 0) / users.length
    : 0;

  const highRiskRatio = users.length > 0 ? (highRiskUsers / users.length) * 100 : 0;
  const resolutionRate = incidents.length > 0 ? (resolvedIncidents / incidents.length) * 100 : 0;

  const severityData = ['critical', 'high', 'medium', 'low'].map((severity) => ({
    severity: severity.charAt(0).toUpperCase() + severity.slice(1),
    count: incidents.filter((incident) => incident.severity === severity).length,
  }));

  const trendMap = incidents.reduce((acc, incident) => {
    const day = new Date(incident.created_at).toLocaleDateString();
    if (!acc[day]) {
      acc[day] = { day, total: 0, critical: 0 };
    }
    acc[day].total += 1;
    if (incident.severity === 'critical') {
      acc[day].critical += 1;
    }
    return acc;
  }, {});

  const incidentTrendData = Object.values(trendMap)
    .sort((a, b) => new Date(a.day) - new Date(b.day))
    .slice(-7);

  const topRiskUsers = [...users]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const riskPulse = highRiskRatio >= 35 ? 'Critical' : highRiskRatio >= 20 ? 'Elevated' : 'Controlled';
  const riskPulseColor = highRiskRatio >= 35 ? 'text-red-400' : highRiskRatio >= 20 ? 'text-orange-400' : 'text-green-400';

  const metricCards = [
    {
      title: 'Total Users',
      value: users.length,
      sub: `${maliciousUsers} known threat actor(s)`,
      icon: Users,
      border: 'border-cyan-800/40',
      bg: 'from-cyan-500/10 to-transparent',
      iconColor: 'text-cyan-400',
    },
    {
      title: 'High-Risk Users',
      value: highRiskUsers,
      sub: `${highRiskRatio.toFixed(1)}% of workforce`,
      icon: AlertTriangle,
      border: 'border-red-800/40',
      bg: 'from-red-500/10 to-transparent',
      iconColor: 'text-red-400',
    },
    {
      title: 'Open Incidents',
      value: openIncidents,
      sub: `${criticalIncidents} critical severity`,
      icon: Shield,
      border: 'border-amber-800/40',
      bg: 'from-amber-500/10 to-transparent',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Pending Requests',
      value: accessRequests.length,
      sub: `${resolutionRate.toFixed(1)}% incidents resolved`,
      icon: FileText,
      border: 'border-blue-800/40',
      bg: 'from-blue-500/10 to-transparent',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Sidebar onLogout={handleLogout} role="admin" onOpenChange={setIsSidebarOpen} />
      
      <div className={`transition-all duration-300 p-8 pt-24 ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Security command center with live risk intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-dark-800 border border-primary-800/30 text-sm text-gray-300">
              Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
            </div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 rounded-lg bg-dark-800 border border-primary-800/30 text-gray-200 hover:border-primary-500 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 rounded-2xl border border-primary-700/40 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_45%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_40%),#0f172a] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Security Posture</p>
                <h2 className="text-2xl font-bold text-white mb-2">Risk Pulse: <span className={riskPulseColor}>{riskPulse}</span></h2>
                <p className="text-gray-300 max-w-2xl">
                  {highRiskUsers} of {users.length} users currently require attention. Keep critical incidents below 10% of total cases for stable posture.
                </p>
              </div>
              <Gauge className="text-primary-400" size={30} />
            </div>
            <div className="mt-5 h-2 bg-dark-900/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${Math.min(100, highRiskRatio)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>{highRiskRatio.toFixed(1)}% High-Risk Density</span>
              <span>100%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-800/30 bg-dark-800 p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Activity size={18} className="text-cyan-400" />
              Quick Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-dark-700 text-gray-200">Average user risk score: <span className="text-white font-semibold">{avgRiskScore.toFixed(1)}</span></div>
              <div className="p-3 rounded-lg bg-dark-700 text-gray-200">Incident resolution rate: <span className="text-white font-semibold">{resolutionRate.toFixed(1)}%</span></div>
              <div className="p-3 rounded-lg bg-dark-700 text-gray-200">Critical incident share: <span className="text-white font-semibold">{incidents.length ? ((criticalIncidents / incidents.length) * 100).toFixed(1) : '0.0'}%</span></div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card) => (
            <div key={card.title} className={`bg-gradient-to-br ${card.bg} bg-dark-800 border ${card.border} rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-2">
                <card.icon className={card.iconColor} size={30} />
                <span className="text-3xl font-bold text-white">{card.value}</span>
              </div>
              <p className="text-gray-300 font-medium">{card.title}</p>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution Pie Chart */}
          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #22d3ee', borderRadius: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-3">Distribution spotlight helps identify concentration of risky populations at a glance.</p>
          </div>

          {/* Incident Severity Distribution */}
          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Incident Severity Mix</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="severity" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #22d3ee', borderRadius: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`severity-${index}`}
                      fill={
                        entry.severity === 'Critical'
                          ? '#ef4444'
                          : entry.severity === 'High'
                          ? '#f97316'
                          : entry.severity === 'Medium'
                          ? '#f59e0b'
                          : '#22c55e'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Incident Trend (Last 7 points)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={incidentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #22d3ee', borderRadius: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
                <Line type="monotone" dataKey="critical" stroke="#fb7185" strokeWidth={3} dot={{ r: 4, fill: '#fb7185' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Top Risk Users</h2>
            <div className="space-y-3">
              {topRiskUsers.map((u) => (
                <div key={u.user_id} className="p-3 bg-dark-700 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.user_id} • {u.department}</p>
                  </div>
                  <span className={`text-sm font-semibold ${u.risk_score >= 80 ? 'text-red-400' : u.risk_score >= 60 ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {u.risk_score.toFixed(1)}
                  </span>
                </div>
              ))}
              {topRiskUsers.length === 0 && (
                <p className="text-gray-500 text-sm">No users available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-dark-800 border border-primary-800/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Incident Feed</h2>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="p-4 bg-dark-700 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-white font-medium">{incident.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{incident.user_name} • {new Date(incident.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    incident.severity === 'critical' ? 'bg-red-900/40 text-red-300' :
                    incident.severity === 'high' ? 'bg-orange-900/40 text-orange-300' :
                    incident.severity === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                    'bg-green-900/40 text-green-300'
                  }`}>
                    {incident.severity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    incident.status === 'open' ? 'bg-yellow-900/40 text-yellow-300' :
                    incident.status === 'in_progress' ? 'bg-blue-900/40 text-blue-300' :
                    'bg-green-900/40 text-green-300'
                  }`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
            {recentIncidents.length === 0 && (
              <p className="text-gray-500 text-sm">No recent incidents found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
