import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadApplications = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError('');

      const response = await api.get(
        '/api/student/applications'
      );

      setApplications(response.data || []);
    } catch (err) {
      console.error('Application loading error:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to load applications.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to withdraw this application?\n\nYou can reapply later if the placement drive is still open.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setWithdrawingId(applicationId);
      setError('');
      setSuccess('');

      await api.put(
        `/api/student/applications/${applicationId}/withdraw`
      );

      setSuccess(
        'Application withdrawn successfully.'
      );

      await loadApplications(false);
    } catch (err) {
      console.error('Withdrawal error:', err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to withdraw application.'
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (application) =>
          application.status === 'APPLIED'
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

      withdrawn: applications.filter(
        (application) =>
          application.status === 'WITHDRAWN'
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return applications
      .filter((application) => {
        const companyName =
          application.drive?.company?.name?.toLowerCase() || '';

        const jobTitle =
          application.drive?.jobTitle?.toLowerCase() || '';

        const location =
          application.drive?.location?.toLowerCase() || '';

        const matchesSearch =
          !searchText ||
          companyName.includes(searchText) ||
          jobTitle.includes(searchText) ||
          location.includes(searchText);

        const matchesStatus =
          statusFilter === 'ALL' ||
          application.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = a.appliedAt
          ? new Date(a.appliedAt).getTime()
          : 0;

        const dateB = b.appliedAt
          ? new Date(b.appliedAt).getTime()
          : 0;

        return dateB - dateA;
      });
  }, [applications, search, statusFilter]);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-100 text-blue-700';

      case 'SHORTLISTED':
        return 'bg-yellow-100 text-yellow-700';

      case 'SELECTED':
        return 'bg-green-100 text-green-700';

      case 'REJECTED':
        return 'bg-red-100 text-red-700';

      case 'WITHDRAWN':
        return 'bg-slate-200 text-slate-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              My Applications
            </h1>

            <p className="text-slate-500 mt-2">
              Track the status of your placement applications.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-slate-500">
              Loading applications...
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
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            My Applications
          </h1>

          <p className="text-slate-500 mt-2">
            Track the status of your placement applications.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Error:</span>{' '}
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span className="font-semibold">✓</span>{' '}
            {success}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

          <SummaryCard
            label="Total"
            value={counts.total}
            color="text-slate-800"
          />

          <SummaryCard
            label="Applied"
            value={counts.applied}
            color="text-blue-600"
          />

          <SummaryCard
            label="Shortlisted"
            value={counts.shortlisted}
            color="text-yellow-600"
          />

          <SummaryCard
            label="Selected"
            value={counts.selected}
            color="text-green-600"
          />

          <SummaryCard
            label="Rejected"
            value={counts.rejected}
            color="text-red-600"
          />

          <SummaryCard
            label="Withdrawn"
            value={counts.withdrawn}
            color="text-slate-600"
          />

        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Applications
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search company, position or location..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300
                           focus:outline-none focus:ring-2
                           focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full px-4 py-3 rounded-lg border border-slate-300
                           bg-white focus:outline-none
                           focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="APPLIED">
                  Applied
                </option>

                <option value="SHORTLISTED">
                  Shortlisted
                </option>

                <option value="SELECTED">
                  Selected
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="WITHDRAWN">
                  Withdrawn
                </option>
              </select>
            </div>

          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-semibold text-slate-700">
                {filteredApplications.length}
              </span>{' '}
              application(s)
            </p>

            {(search || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear Filters
              </button>
            )}

          </div>

        </div>

        {/* Applications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Applications
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your most recent applications are shown first.
              </p>
            </div>

            <button
              onClick={() => loadApplications(false)}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg border border-slate-300
                         text-sm font-medium text-slate-700
                         hover:bg-slate-50
                         disabled:opacity-50
                         disabled:cursor-not-allowed transition"
            >
              {refreshing ? 'Refreshing...' : '↻ Refresh'}
            </button>

          </div>

          {filteredApplications.length === 0 ? (

            <div className="p-12 text-center">

              <div className="text-4xl mb-4">
                📄
              </div>

              <h3 className="font-semibold text-slate-700">
                {applications.length === 0
                  ? 'No applications yet'
                  : 'No applications found'}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                {applications.length === 0
                  ? 'Apply to a placement drive to see your applications here.'
                  : 'Try changing your search or status filter.'}
              </p>

              {applications.length > 0 &&
                (search || statusFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('ALL');
                    }}
                    className="mt-5 px-5 py-2.5 rounded-lg
                               bg-indigo-600 hover:bg-indigo-700
                               text-white font-medium"
                  >
                    Clear Filters
                  </button>
                )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Company
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Position
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Location
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Applied On
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredApplications.map((application) => {

                    const status = application.status;

                    const canWithdraw =
                      status === 'APPLIED';

                    const isWithdrawing =
                      withdrawingId === application.id;

                    return (
                      <tr
                        key={application.id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* Company */}
                        <td className="px-6 py-4">

                          <div className="font-semibold text-slate-800">
                            {application.drive?.company?.name ||
                              '-'}
                          </div>

                        </td>

                        {/* Position */}
                        <td className="px-6 py-4">

                          <div className="text-sm font-medium text-slate-700">
                            {application.drive?.jobTitle ||
                              '-'}
                          </div>

                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">

                          <div className="text-sm text-slate-600">
                            {application.drive?.location ||
                              '-'}
                          </div>

                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">

                          <div className="text-sm text-slate-600">
                            {formatDate(
                              application.appliedAt
                            )}
                          </div>

                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(status)}`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">

                          {canWithdraw ? (

                            <button
                              onClick={() =>
                                handleWithdraw(
                                  application.id
                                )
                              }
                              disabled={isWithdrawing}
                              className="px-3 py-2 rounded-lg
                                         bg-orange-500
                                         text-white text-sm
                                         font-medium
                                         hover:bg-orange-600
                                         disabled:opacity-50
                                         disabled:cursor-not-allowed
                                         transition"
                            >
                              {isWithdrawing
                                ? 'Withdrawing...'
                                : 'Withdraw'}
                            </button>

                          ) : status === 'WITHDRAWN' ? (

                            <span className="text-sm font-medium text-slate-500">
                              Withdrawn
                            </span>

                          ) : (

                            <span className="text-sm text-slate-400">
                              No action
                            </span>

                          )}

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

function SummaryCard({
  label,
  value,
  color,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`text-2xl font-bold mt-1 ${color}`}
      >
        {value}
      </p>
    </div>
  );
}

export default ApplicationsPage;