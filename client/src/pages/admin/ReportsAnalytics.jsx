import React, { useEffect, useState, useMemo } from 'react';
import { BarChart3, CheckCircle, Clock, XCircle, Download, Calendar, Activity, Info, Loader } from 'lucide-react';
import adminService from '../../services/admin.service';
import resourceService from '../../services/resource.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';

export default function ReportsAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7D'); // '7D', '30D', 'ALL'

  useEffect(() => {
    setIsLoading(true);
    Promise.all([adminService.getAllBookings(), resourceService.getAllResources()])
      .then(([bookingsRes, resourcesRes]) => {
        setData({
          bookings: bookingsRes.bookings || [],
          resources: resourcesRes.resources || []
        });
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load reports data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return [];
    if (dateRange === 'ALL') return data.bookings;
    const now = new Date();
    const startDate = dateRange === '7D' ? subDays(now, 7) : subDays(now, 30);
    return data.bookings.filter(b => {
      const bDate = (b.created_at || b.start_time) ? new Date(b.created_at || b.start_time) : new Date();
      return isAfter(bDate, startDate) && isBefore(bDate, now);
    });
  }, [data?.bookings, dateRange]);

  const handleExport = () => {
    if (!filteredBookings.length) return;
    const headers = ['Booking ID', 'User ID', 'Resource ID', 'Status', 'Start Time', 'End Time', 'Created At'];
    const csvRows = [headers.join(',')];
    
    for (const b of filteredBookings) {
      const row = [b.id, b.user_id, b.resource_id, b.status, b.start_time, b.end_time, b.created_at];
      csvRows.push(row.map(r => `"${r || ''}"`).join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculations
  const total = filteredBookings.length;
  const approved = filteredBookings.filter(b => b.status === 'APPROVED').length;
  const pending = filteredBookings.filter(b => b.status === 'PENDING').length;
  const rejected = filteredBookings.filter(b => b.status === 'REJECTED').length;

  const pct = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

  // Chart data
  const chartData = useMemo(() => {
    if (!filteredBookings.length) return [];
    
    const countsByDate = {};
    filteredBookings.forEach(b => {
      const d = format((b.created_at || b.start_time) ? new Date(b.created_at || b.start_time) : new Date(), 'MMM dd');
      countsByDate[d] = (countsByDate[d] || 0) + 1;
    });

    return Object.keys(countsByDate).sort((a,b) => new Date(a) - new Date(b)).map(date => ({
      date,
      bookings: countsByDate[date]
    }));
  }, [filteredBookings]);

  let peakDay = { date: '-', count: 0 };
  let dailyAvg = 0;
  if (chartData.length > 0) {
    peakDay = chartData.reduce((max, cur) => cur.bookings > max.bookings ? cur : max, chartData[0]);
    const days = dateRange === '7D' ? 7 : (dateRange === '30D' ? 30 : Math.max(chartData.length, 1));
    dailyAvg = (total / days).toFixed(2);
  }

  // Top resources
  const topResources = useMemo(() => {
    if (!filteredBookings.length) return [];
    const counts = {};
    filteredBookings.forEach(b => {
      counts[b.resource_id] = (counts[b.resource_id] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => {
        const res = data?.resources.find(r => String(r.id) === String(id));
        return { id, name: res?.name || `Resource ${id}`, count };
      });
  }, [filteredBookings, data?.resources]);

  const maxResourceCount = topResources.length > 0 ? topResources[0].count : 1;

  // Pie chart data
  const pieData = [
    { name: 'Approved', value: approved, color: '#10b981' }, 
    { name: 'Pending', value: pending, color: '#f59e0b' },  
    { name: 'Rejected', value: rejected, color: '#ef4444' }  
  ].filter(d => d.value > 0);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#94a3b8' }} /></div>;
  }
  if (error) {
    return <div style={{ color: '#ef4444', padding: '16px' }}>{error}</div>;
  }

  return (
    <div className="ra-dashboard">
      <style>{`
        .ra-dashboard {
          width: 100%;
          margin: 0 auto;
          color: #0f172a;
        }
        .ra-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          gap: 16px;
        }
        .ra-header-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .ra-header-subtitle {
          color: #64748b;
          margin: 0;
          font-size: 15px;
        }
        .ra-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .ra-select {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          outline: none;
        }
        .ra-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .ra-btn-primary {
          background: #0f172a;
          color: #ffffff;
        }
        .ra-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }
        .ra-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }
        .ra-kpi-icon {
          width: 40px; height: 40px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .ra-kpi-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .ra-kpi-value {
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 8px;
        }
        .ra-kpi-desc {
          font-size: 13px;
          color: #94a3b8;
        }
        .ra-progress-bg {
          height: 4px;
          background: #f1f5f9;
          border-radius: 2px;
          margin-top: 12px;
          overflow: hidden;
        }
        .ra-progress-fill {
          height: 100%;
          border-radius: 2px;
        }
        
        .ra-secondary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .ra-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .ra-chart-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        .ra-chart-stats {
          display: flex;
          gap: 32px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }
        .ra-stat-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .ra-resource-item {
          margin-bottom: 20px;
        }
        .ra-resource-item:last-child {
          margin-bottom: 0;
        }
        
        .ra-insights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ra-insight-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          background: #f8fafc;
        }

        @media (max-width: 1024px) {
          .ra-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .ra-secondary-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .ra-header { flex-direction: column; }
          .ra-controls { width: 100%; justify-content: flex-start; }
        }
        @media (max-width: 640px) {
          .ra-kpi-grid { grid-template-columns: 1fr; }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div className="ra-header">
        <div>
          <h1 className="ra-header-title">Reports & Analytics</h1>
          <p className="ra-header-subtitle">Operational insight from your current booking and resource data.</p>
        </div>
        <div className="ra-controls">
          <select className="ra-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="ALL">All Time</option>
          </select>
          <button className="ra-btn ra-btn-primary" onClick={handleExport} disabled={!total}>
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="ra-kpi-grid">
        <div className="ra-card">
          <div className="ra-kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><BarChart3 size={20} /></div>
          <div className="ra-kpi-label">Total Bookings</div>
          <div className="ra-kpi-value">{total}</div>
          <div className="ra-kpi-desc">All time bookings</div>
        </div>
        
        <div className="ra-card">
          <div className="ra-kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><CheckCircle size={20} /></div>
          <div className="ra-kpi-label">Approved</div>
          <div className="ra-kpi-value">{approved}</div>
          <div className="ra-kpi-desc">{pct(approved)}% of total</div>
          <div className="ra-progress-bg"><div className="ra-progress-fill" style={{ width: `${pct(approved)}%`, background: '#10b981' }}></div></div>
        </div>

        <div className="ra-card">
          <div className="ra-kpi-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><Clock size={20} /></div>
          <div className="ra-kpi-label">Pending</div>
          <div className="ra-kpi-value">{pending}</div>
          <div className="ra-kpi-desc">{pct(pending)}% of total</div>
          <div className="ra-progress-bg"><div className="ra-progress-fill" style={{ width: `${pct(pending)}%`, background: '#f59e0b' }}></div></div>
        </div>

        <div className="ra-card">
          <div className="ra-kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><XCircle size={20} /></div>
          <div className="ra-kpi-label">Rejected</div>
          <div className="ra-kpi-value">{rejected}</div>
          <div className="ra-kpi-desc">{pct(rejected)}% of total</div>
          <div className="ra-progress-bg"><div className="ra-progress-fill" style={{ width: `${pct(rejected)}%`, background: '#ef4444' }}></div></div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="ra-card" style={{ marginBottom: '24px' }}>
        <div className="ra-chart-header">
          <h3 className="ra-chart-title">Bookings Overview</h3>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No booking data available for this period.
            </div>
          )}
        </div>
        
        <div className="ra-chart-stats">
          <div className="ra-stat-item">
            <div style={{ padding: '8px', background: '#eff6ff', color: '#3b82f6', borderRadius: '6px' }}><Activity size={16} /></div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Peak Day</div>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{peakDay.date}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{peakDay.count} bookings</div>
            </div>
          </div>
          <div className="ra-stat-item">
            <div style={{ padding: '8px', background: '#f0fdf4', color: '#10b981', borderRadius: '6px' }}><Calendar size={16} /></div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Daily Average</div>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{dailyAvg}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>bookings per day</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ra-secondary-grid">
        {/* Most Used Resources */}
        <div className="ra-card">
          <div className="ra-chart-header">
            <h3 className="ra-chart-title">Most-used Resources</h3>
          </div>
          <div>
            {topResources.length > 0 ? topResources.map((res, idx) => (
              <div key={res.id} className="ra-resource-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{res.name}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{res.count} <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '12px' }}>bookings</span></span>
                </div>
                <div className="ra-progress-bg" style={{ marginTop: '0' }}>
                  <div 
                    className="ra-progress-fill" 
                    style={{ width: `${Math.round((res.count / maxResourceCount) * 100)}%`, background: idx === 0 ? '#4f46e5' : idx === 1 ? '#10b981' : '#3b82f6' }}
                  ></div>
                </div>
              </div>
            )) : (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0', fontSize: '14px' }}>No resource usage yet.</div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="ra-card">
          <h3 className="ra-chart-title" style={{ marginBottom: '24px' }}>Booking Status Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', height: '200px', gap: '24px' }}>
            {total > 0 ? (
              <>
                <div style={{ width: '50%', height: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{total}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Total</span>
                  </div>
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div><span style={{ color: '#475569' }}>Approved</span></div>
                    <span style={{ fontWeight: '600' }}>{approved} <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>({pct(approved)}%)</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div><span style={{ color: '#475569' }}>Pending</span></div>
                    <span style={{ fontWeight: '600' }}>{pending} <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>({pct(pending)}%)</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div><span style={{ color: '#475569' }}>Rejected</span></div>
                    <span style={{ fontWeight: '600' }}>{rejected} <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>({pct(rejected)}%)</span></span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', color: '#94a3b8', textAlign: 'center', fontSize: '14px' }}>No booking statuses available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="ra-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Info color="#4f46e5" size={20} />
          <h3 className="ra-chart-title">Booking Insights</h3>
        </div>
        <div>
          {total === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>Not enough booking data to generate insights.</div>
          ) : (
            <div className="ra-insights-list">
              {approved === total && total > 0 && (
                <div className="ra-insight-item">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🎉</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>All current bookings are approved</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Great job! You have a 100% approval rate in this period.</div>
                  </div>
                </div>
              )}
              
              {pending > 0 && (
                <div className="ra-insight-item">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Clock size={16} /></div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{pending} booking{pending > 1 ? 's' : ''} pending review</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>You have {pending} pending request{pending > 1 ? 's' : ''} waiting for action.</div>
                  </div>
                </div>
              )}

              {topResources.length > 0 && (
                <div className="ra-insight-item">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Activity size={16} /></div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Most-used resource: {topResources[0].name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>It's the most-booked resource with {topResources[0].count} bookings.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}