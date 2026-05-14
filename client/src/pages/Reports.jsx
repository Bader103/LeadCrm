import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users as UsersIcon,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/reports/performance');
        setData(data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#10b981', '#34d399', '#059669', '#065f46', '#064e3b'];

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Analyzing performance data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '-1.5px' }}>Performance Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Deep insights into lead conversion and agent productivity</p>
        </div>
        <button className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
          <Download size={18} /> Export Full Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <TrendingUp size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: '900' }}>{data.conversionRate}%</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overall Conversion Rate</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <UsersIcon size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: '900' }}>{data.summary.total}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Managed Leads</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <PieChartIcon size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: '900' }}>{data.summary.closed}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Successfully Closed</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Agent Performance */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UsersIcon size={20} color="var(--primary)" /> Agent Workload
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PieChartIcon size={20} color="var(--primary)" /> Status Breakdown
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
