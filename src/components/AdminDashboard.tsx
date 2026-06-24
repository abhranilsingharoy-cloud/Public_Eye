import React, { useMemo } from 'react';
import { Issue } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, ShieldCheck, Database, FileSpreadsheet } from 'lucide-react';

interface AdminDashboardProps {
  issues: Issue[];
}

export default function AdminDashboard({ issues }: AdminDashboardProps) {
  const categoryData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const statusData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#6B7280'];

  const exportToCSV = () => {
    if (issues.length === 0) return;
    
    const headers = ['ID', 'Title', 'Category', 'Status', 'Severity', 'Latitude', 'Longitude', 'Reporter', 'Created At'];
    const rows = issues.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.status,
      i.aiSeverity,
      i.latitude,
      i.longitude,
      i.reporter,
      i.createdAt
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `public_eye_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" /> Administrative Console
          </h2>
          <p className="text-sm text-slate-400">Aggregate metrics and data export engine.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="glass-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold text-white hover:text-cyan-400 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Issues by Category</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[350px]">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Resolution Status Flow</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f0f14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#00f0ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
