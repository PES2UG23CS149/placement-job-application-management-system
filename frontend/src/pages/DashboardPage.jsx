import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import api from '../api/axios';

const STATUS_STYLES = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  SELECTED: 'bg-green-100 text-green-700',
  WITHDRAWN: 'bg-slate-100 text-slate-600',
};

const STATUS_BARS = {
  APPLIED: 'bg-blue-500',
  SHORTLISTED: 'bg-yellow-500',
  REJECTED: 'bg-red-500',
  SELECTED: 'bg-green-500',
  WITHDRAWN: 'bg-slate-400',
};

const STATUS_ORDER = [
  'APPLIED',
  'SHORTLISTED',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          '/api/student/applications'
        );

        setApplications(response.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          err.response?.data ||
          'Unable to load your applications.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const total = applications.length;

  const byStatus = {
    APPLIED: 0,
    SHORTLISTED: 0,
    SELECTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  applications.forEach((application) => {
    const status = application.status;

    if (byStatus[status] !== undefined) {
      byStatus[status]++;
    }
  });

  /*
   * Response rate represents applications that
   * have received a positive placement response.
   *
   * APPLIED is not counted as a response.
   */
  const responseRate =
    total > 0
      ? Math.round(
          ((byStatus.SHORTLISTED + byStatus.SELECTED) /
            total) *
            100
        )
      : 0;

  const stats = [
    {
      label: 'Total Applications',
      value: total,
      icon: '📋',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Applied',
      value: byStatus.APPLIED,
      icon: '📨',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Shortlisted',
      value: byStatus.SHORTLISTED,
      icon: '⭐',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Selected',
      value: byStatus.SELECTED,
      icon: '🎉',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Rejected',
      value: byStatus.REJECTED,
      icon: '✕',
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Withdrawn',
      value: byStatus.WITHDRAWN,
      icon: '↩',
      color: 'bg-slate-100 text-slate-600',
    },
  ];

  const chartData = STATUS_ORDER.map((status) => ({
    status:
      status.charAt(0) +
      status.slice(1).toLowerCase(),
    count: byStatus[status],
  }));

  const recentApplications = applications
    .slice()
    .sort((a, b) => {
      const dateA = a.appliedAt
        ? new Date(a.appliedAt).getTime()
        : 0;

      const dateB = b.appliedAt
        ? new Date(b.appliedAt).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Placement Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Track your placement applications and their current status.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          /* Loading */
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <div className="animate-pulse">
              <p className="text-slate-500">
                Loading dashboard...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {stat.label}
                      </p>

                      <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                        {stat.value}
                      </p>
                    </div>

                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl ${stat.color}`}
                    >
                      {stat.icon}
                    </div>

                  </div>
                </div>
              ))}

            </div>

            {/* Response Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                  <h3 className="font-semibold text-slate-700">
                    Placement Response Rate
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Percentage of applications that reached
                    shortlisted or selected status.
                  </p>
                </div>

                <div className="text-3xl font-bold text-indigo-600">
                  {responseRate}%
                </div>

              </div>

              <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-indigo-500 rounded-full transition-all"
                  style={{
                    width: `${responseRate}%`,
                  }}
                />
              </div>

            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Status Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

                <h3 className="font-semibold text-slate-700 mb-5">
                  Application Status
                </h3>

                <div className="space-y-4">

                  {STATUS_ORDER.map((status) => {
                    const count = byStatus[status];

                    return (
                      <div
                        key={status}
                        className="flex items-center gap-3"
                      >

                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full w-28 text-center ${STATUS_STYLES[status]}`}
                        >
                          {status}
                        </span>

                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${STATUS_BARS[status]}`}
                            style={{
                              width:
                                total > 0
                                  ? `${(count / total) * 100}%`
                                  : '0%',
                            }}
                          />
                        </div>

                        <span className="text-sm font-medium text-slate-600 w-6 text-right">
                          {count}
                        </span>

                      </div>
                    );
                  })}

                </div>

              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

                <h3 className="font-semibold text-slate-700 mb-5">
                  Application Overview
                </h3>

                {total === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    No applications yet
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={240}
                  >
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />

                      <XAxis
                        dataKey="status"
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                        name="Applications"
                      />

                    </BarChart>
                  </ResponsiveContainer>
                )}

              </div>

            </div>

            {/* Recent Applications */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">

              <div className="mb-5">
                <h3 className="font-semibold text-slate-700">
                  Recent Applications
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Your latest placement applications
                </p>
              </div>

              {recentApplications.length === 0 ? (
                <div className="py-10 text-center">

                  <div className="text-4xl mb-3">
                    📋
                  </div>

                  <p className="text-slate-500 font-medium">
                    No applications yet
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Apply to a placement drive to see it here.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {recentApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100"
                    >

                      {/* Application Information */}
                      <div className="min-w-0">

                        <p className="font-semibold text-slate-800 truncate">
                          {application.drive?.jobTitle ||
                            'Placement Drive'}
                        </p>

                        <p className="text-sm text-indigo-600 mt-1">
                          {application.drive?.company?.name ||
                            'Company'}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {application.drive?.location ||
                            'Location not specified'}
                        </p>

                      </div>

                      {/* Status */}
                      <div className="sm:text-right shrink-0">

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[application.status] ||
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {application.status}
                        </span>

                        <p className="text-xs text-slate-400 mt-2">
                          {application.appliedAt
                            ? new Date(
                                application.appliedAt
                              ).toLocaleDateString()
                            : 'Date unavailable'}
                        </p>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}