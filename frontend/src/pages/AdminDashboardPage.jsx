import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const STATUS_STYLES = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  SELECTED: 'bg-green-100 text-green-700',
  WITHDRAWN: 'bg-slate-200 text-slate-700',
};

const STATUS_ORDER = [
  'APPLIED',
  'SHORTLISTED',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

export default function AdminDashboardPage() {
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError('');

      const [
        companiesResponse,
        drivesResponse,
      ] = await Promise.all([
        api.get('/api/admin/companies'),
        api.get('/api/admin/drives'),
      ]);

      const companiesData =
        companiesResponse.data || [];

      const drivesData =
        drivesResponse.data || [];

      setCompanies(companiesData);
      setDrives(drivesData);

      /*
       * Load applicants for every placement drive.
       */
      const applicantResponses =
        await Promise.all(
          drivesData.map((drive) =>
            api.get(
              `/api/admin/drives/${drive.id}/applications`
            )
          )
        );

      const allApplications =
        applicantResponses.flatMap(
          (response) => response.data || []
        );

      setApplications(allApplications);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to load admin dashboard.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const counts = useMemo(() => {
    return {
      openDrives: drives.filter(
        (drive) =>
          drive.status?.toUpperCase() === 'OPEN'
      ).length,

      shortlisted: applications.filter(
        (application) =>
          application.status === 'SHORTLISTED'
      ).length,

      selected: applications.filter(
        (application) =>
          application.status === 'SELECTED'
      ).length,

      rejected: applications.filter(
        (application) =>
          application.status === 'REJECTED'
      ).length,

      applied: applications.filter(
        (application) =>
          application.status === 'APPLIED'
      ).length,

      withdrawn: applications.filter(
        (application) =>
          application.status === 'WITHDRAWN'
      ).length,
    };
  }, [drives, applications]);

  const statusData = STATUS_ORDER.map(
    (status) => ({
      status,
      count:
        applications.filter(
          (application) =>
            application.status === status
        ).length,
    })
  );

  const recentDrives = useMemo(() => {
    return [...drives]
      .sort((a, b) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;

        return idB - idA;
      })
      .slice(0, 5);
  }, [drives]);

  const stats = [
    {
      label: 'Total Companies',
      value: companies.length,
      icon: '🏢',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Placement Drives',
      value: drives.length,
      icon: '💼',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Open Drives',
      value: counts.openDrives,
      icon: '📢',
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Applicants',
      value: applications.length,
      icon: '👥',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Shortlisted',
      value: counts.shortlisted,
      icon: '⭐',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Selected',
      value: counts.selected,
      icon: '🎉',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">

        <div className="max-w-7xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Admin Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Manage companies, placement drives and student applications.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-slate-500">
              Loading admin dashboard...
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Admin Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Manage companies, placement drives and student applications.
            </p>
          </div>

          <button
            onClick={() => loadDashboard(false)}
            disabled={refreshing}
            className="self-start lg:self-auto flex items-center gap-2
                       px-4 py-2.5 bg-white border border-slate-300
                       text-slate-700 hover:bg-slate-50 rounded-lg
                       text-sm font-medium transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={refreshing ? 'animate-spin' : ''}>
              ↻
            </span>

            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            <span className="font-semibold">
              Error:
            </span>{' '}
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm
                         border border-slate-200 p-5"
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
                  className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0
                              rounded-full flex items-center justify-center
                              text-lg sm:text-xl ${stat.color}`}
                >
                  {stat.icon}
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Application Status + Placement Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Application Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            <h2 className="font-semibold text-slate-700 mb-5">
              Application Status
            </h2>

            <div className="space-y-4">

              {statusData.map(
                ({ status, count }) => {

                  const percentage =
                    applications.length > 0
                      ? (count /
                          applications.length) *
                        100
                      : 0;

                  return (
                    <div
                      key={status}
                      className="flex items-center gap-3"
                    >

                      <span
                        className={`w-28 text-center px-2.5 py-1
                                    rounded-full text-xs font-semibold
                                    ${STATUS_STYLES[status]}`}
                      >
                        {status}
                      </span>

                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">

                        <div
                          className="h-2 rounded-full bg-indigo-500 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <span className="w-8 text-right text-sm font-semibold text-slate-600">
                        {count}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* Placement Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">

            <h2 className="font-semibold text-slate-700 mb-5">
              Placement Overview
            </h2>

            <div className="space-y-3">

              <OverviewRow
                label="Companies registered"
                value={companies.length}
              />

              <OverviewRow
                label="Total drives"
                value={drives.length}
              />

              <OverviewRow
                label="Open drives"
                value={counts.openDrives}
                className="bg-green-50"
                valueClass="text-green-700"
                labelClass="text-green-700"
              />

              <OverviewRow
                label="Total applicants"
                value={applications.length}
                className="bg-purple-50"
                valueClass="text-purple-700"
                labelClass="text-purple-700"
              />

              <OverviewRow
                label="Selected students"
                value={counts.selected}
                className="bg-emerald-50"
                valueClass="text-emerald-700"
                labelClass="text-emerald-700"
              />

            </div>

          </div>

        </div>

        {/* Recent Placement Drives */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="p-6 border-b border-slate-200">

            <h2 className="font-semibold text-slate-700">
              Recent Placement Drives
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Recently created placement opportunities
            </p>

          </div>

          {recentDrives.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-4xl mb-3">
                💼
              </div>

              <p className="text-slate-500">
                No placement drives created yet.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-sm">

                <thead>

                  <tr className="bg-slate-50 border-b border-slate-200">

                    <th className="px-6 py-4 text-left font-semibold text-slate-600">
                      Company
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-slate-600">
                      Position
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-slate-600">
                      Location
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-slate-600">
                      Deadline
                    </th>

                    <th className="px-6 py-4 text-left font-semibold text-slate-600">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {recentDrives.map((drive) => {

                    const isOpen =
                      drive.status?.toUpperCase() ===
                      'OPEN';

                    return (
                      <tr
                        key={drive.id}
                        className="hover:bg-slate-50 transition"
                      >

                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {drive.company?.name ||
                            'Unknown Company'}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {drive.jobTitle ||
                            '-'}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {drive.location ||
                            '—'}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {drive.deadline ||
                            '—'}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex px-3 py-1
                                        rounded-full text-xs font-semibold ${
                                          isOpen
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                          >
                            {drive.status ||
                              'UNKNOWN'}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

function OverviewRow({
  label,
  value,
  className = 'bg-slate-50',
  labelClass = 'text-slate-600',
  valueClass = 'text-slate-800',
}) {
  return (
    <div
      className={`flex items-center justify-between
                  p-4 rounded-lg ${className}`}
    >
      <span className={labelClass}>
        {label}
      </span>

      <span className={`font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}