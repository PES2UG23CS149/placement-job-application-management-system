import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const STATUS_STYLES = {
  APPLIED:
    'bg-blue-500/10 text-blue-300 border-blue-500/20',

  SHORTLISTED:
    'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',

  SELECTED:
    'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',

  REJECTED:
    'bg-red-500/10 text-red-300 border-red-500/20',

  WITHDRAWN:
    'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const STATUS_OPTIONS = [
  'APPLIED',
  'SHORTLISTED',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
];

function AdminApplicantsPage() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [driveFilter, setDriveFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError('');

      const drivesResponse = await api.get(
        '/api/admin/drives'
      );

      const drivesData = drivesResponse.data || [];

      setDrives(drivesData);

      if (drivesData.length === 0) {
        setApplications([]);
        return;
      }

      const responses = await Promise.all(
        drivesData.map((drive) =>
          api.get(
            `/api/admin/drives/${drive.id}/applications`
          )
        )
      );

      const allApplications = responses.flatMap(
        (response) => response.data || []
      );

      setApplications(allApplications);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to load applicants.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  const getStudentName = (application) => {
    return (
      application.student?.name ||
      application.student?.email ||
      'Unknown Student'
    );
  };

  const getStudentEmail = (application) => {
    return application.student?.email || '—';
  };

  const getCompanyName = (application) => {
    return (
      application.drive?.company?.name ||
      'Unknown Company'
    );
  };

  const getJobTitle = (application) => {
    return application.drive?.jobTitle || '—';
  };

  const getDriveId = (application) => {
    return application.drive?.id
      ? String(application.drive.id)
      : '';
  };

  const formatDate = (date) => {
    if (!date) {
      return '—';
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

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const studentName =
        getStudentName(application).toLowerCase();

      const studentEmail =
        getStudentEmail(application).toLowerCase();

      const company =
        getCompanyName(application).toLowerCase();

      const jobTitle =
        getJobTitle(application).toLowerCase();

      const branch =
        application.student?.branch?.toLowerCase() || '';

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        company.includes(query) ||
        jobTitle.includes(query) ||
        branch.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        application.status === statusFilter;

      const matchesDrive =
        driveFilter === 'ALL' ||
        getDriveId(application) === driveFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDrive
      );
    });
  }, [
    applications,
    search,
    statusFilter,
    driveFilter,
  ]);

  const updateStatus = async (
    applicationId,
    newStatus
  ) => {
    try {
      setUpdatingId(applicationId);
      setError('');
      setSuccess('');

      await api.put(
        `/api/admin/applications/${applicationId}/status`,
        {
          status: newStatus,
        }
      );

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: newStatus,
              }
            : application
        )
      );

      setSuccess(
        `Application status changed to ${newStatus}.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to update application status.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = applications.length;

  const appliedCount = applications.filter(
    (application) =>
      application.status === 'APPLIED'
  ).length;

  const shortlistedCount = applications.filter(
    (application) =>
      application.status === 'SHORTLISTED'
  ).length;

  const selectedCount = applications.filter(
    (application) =>
      application.status === 'SELECTED'
  ).length;

  const rejectedCount = applications.filter(
    (application) =>
      application.status === 'REJECTED'
  ).length;

  const withdrawnCount = applications.filter(
    (application) =>
      application.status === 'WITHDRAWN'
  ).length;

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Applicants
          </h1>

          <p className="text-slate-400 mt-2">
            Review student applications and manage
            application status.
          </p>
        </div>

        <button
          onClick={loadApplicants}
          disabled={loading}
          className="w-full lg:w-auto px-4 py-2.5 rounded-lg
                     border border-slate-600
                     bg-slate-800 text-slate-200
                     hover:bg-slate-700 transition
                     disabled:opacity-50
                     disabled:cursor-not-allowed"
        >
          ↻ {loading ? 'Refreshing...' : 'Refresh'}
        </button>

      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30
                        bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/30
                        bg-emerald-500/10 px-4 py-3 text-emerald-300">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

        <StatCard
          label="Total"
          value={totalCount}
          icon="👥"
        />

        <StatCard
          label="Applied"
          value={appliedCount}
          icon="📨"
        />

        <StatCard
          label="Shortlisted"
          value={shortlistedCount}
          icon="⭐"
        />

        <StatCard
          label="Selected"
          value={selectedCount}
          icon="🎉"
        />

        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon="✕"
        />

        <StatCard
          label="Withdrawn"
          value={withdrawnCount}
          icon="↩"
        />

      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 mb-6">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Search */}
          <div className="lg:col-span-2">

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Student, email, company, job..."
              className="w-full px-4 py-3 rounded-lg
                         bg-slate-900 border border-slate-600
                         text-slate-100
                         placeholder-slate-500
                         focus:outline-none
                         focus:border-indigo-500"
            />

          </div>

          {/* Status */}
          <div>

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg
                         bg-slate-900 border border-slate-600
                         text-slate-100
                         focus:outline-none
                         focus:border-indigo-500"
            >
              <option value="ALL">
                All Statuses
              </option>

              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

          </div>

          {/* Drive */}
          <div>

            <label className="block text-sm font-medium text-slate-300 mb-2">
              Placement Drive
            </label>

            <select
              value={driveFilter}
              onChange={(e) =>
                setDriveFilter(e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg
                         bg-slate-900 border border-slate-600
                         text-slate-100
                         focus:outline-none
                         focus:border-indigo-500"
            >
              <option value="ALL">
                All Drives
              </option>

              {drives.map((drive) => (
                <option
                  key={drive.id}
                  value={drive.id}
                >
                  {drive.company?.name || 'Company'} -{' '}
                  {drive.jobTitle}
                </option>
              ))}
            </select>

          </div>

        </div>

        <div className="mt-4 text-sm text-slate-400">
          Showing{' '}
          <span className="text-slate-200 font-medium">
            {filteredApplications.length}
          </span>{' '}
          of{' '}
          <span className="text-slate-200 font-medium">
            {applications.length}
          </span>{' '}
          applications
        </div>

      </div>

      {/* Applications */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

        {loading ? (

          <div className="p-12 text-center text-slate-400">
            Loading applicants...
          </div>

        ) : filteredApplications.length === 0 ? (

          <div className="p-12 text-center">

            <div className="text-4xl mb-3">
              👥
            </div>

            <h3 className="text-lg font-semibold text-slate-200">
              {applications.length === 0
                ? 'No applications yet'
                : 'No matching applications'}
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {applications.length === 0
                ? 'Student applications will appear here.'
                : 'Try changing your search or filters.'}
            </p>

          </div>

        ) : (

          <>
            {/* Desktop Table */}
            <div className="hidden xl:block overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Academic
                    </th>

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Company
                    </th>

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Position
                    </th>

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Applied
                    </th>

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-slate-400 font-medium">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700">

                  {filteredApplications.map(
                    (application) => (

                      <tr
                        key={application.id}
                        className="hover:bg-slate-700/20 transition"
                      >

                        {/* Student */}
                        <td className="px-5 py-4">

                          <div className="font-semibold text-slate-100">
                            {getStudentName(
                              application
                            )}
                          </div>

                          <div className="text-xs text-slate-400 mt-1">
                            {getStudentEmail(
                              application
                            )}
                          </div>

                        </td>

                        {/* Academic */}
                        <td className="px-5 py-4">

                          <div className="text-slate-200">
                            CGPA:{' '}
                            {application.student?.cgpa ??
                              '—'}
                          </div>

                          <div className="text-xs text-slate-400 mt-1">
                            {application.student?.branch ||
                              '—'}
                          </div>

                        </td>

                        {/* Company */}
                        <td className="px-5 py-4">

                          <span className="text-indigo-300 font-medium">
                            {getCompanyName(
                              application
                            )}
                          </span>

                        </td>

                        {/* Position */}
                        <td className="px-5 py-4 text-slate-200">
                          {getJobTitle(application)}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-400">
                          {formatDate(
                            application.appliedAt
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full
                                        border text-xs font-semibold
                                        ${
                                          STATUS_STYLES[
                                            application.status
                                          ] ||
                                          STATUS_STYLES.APPLIED
                                        }`}
                          >
                            {application.status}
                          </span>

                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">

                          <StatusSelector
                            application={application}
                            updatingId={updatingId}
                            onUpdate={updateStatus}
                          />

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile / Tablet Cards */}
            <div className="xl:hidden divide-y divide-slate-700">

              {filteredApplications.map(
                (application) => (

                  <div
                    key={application.id}
                    className="p-5"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                      <div className="min-w-0">

                        <h3 className="text-lg font-semibold text-slate-100">
                          {getStudentName(
                            application
                          )}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1 break-all">
                          {getStudentEmail(
                            application
                          )}
                        </p>

                        <div className="mt-4 space-y-2 text-sm">

                          <p>
                            <span className="text-slate-500">
                              Company:{' '}
                            </span>

                            <span className="text-indigo-300">
                              {getCompanyName(
                                application
                              )}
                            </span>
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Position:{' '}
                            </span>

                            <span className="text-slate-200">
                              {getJobTitle(
                                application
                              )}
                            </span>
                          </p>

                          <p>
                            <span className="text-slate-500">
                              CGPA:{' '}
                            </span>

                            <span className="text-slate-200">
                              {application.student?.cgpa ??
                                '—'}
                            </span>
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Branch:{' '}
                            </span>

                            <span className="text-slate-200">
                              {application.student?.branch ||
                                '—'}
                            </span>
                          </p>

                          <p>
                            <span className="text-slate-500">
                              Applied:{' '}
                            </span>

                            <span className="text-slate-300">
                              {formatDate(
                                application.appliedAt
                              )}
                            </span>
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-3">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full
                                      border text-xs font-semibold
                                      ${
                                        STATUS_STYLES[
                                          application.status
                                        ] ||
                                        STATUS_STYLES.APPLIED
                                      }`}
                        >
                          {application.status}
                        </span>

                        <StatusSelector
                          application={application}
                          updatingId={updatingId}
                          onUpdate={updateStatus}
                        />

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

function StatusSelector({
  application,
  updatingId,
  onUpdate,
}) {
  return (
    <select
      value={application.status}
      disabled={updatingId === application.id}
      onChange={(e) =>
        onUpdate(
          application.id,
          e.target.value
        )
      }
      className="px-3 py-2 rounded-lg
                 bg-slate-900
                 border border-slate-600
                 text-slate-200
                 text-sm
                 focus:outline-none
                 focus:border-indigo-500
                 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((status) => (
        <option
          key={status}
          value={status}
        >
          {updatingId === application.id &&
          status === application.status
            ? 'Updating...'
            : status}
        </option>
      ))}
    </select>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">

      <div className="flex items-center justify-between gap-3">

        <div>
          <p className="text-xs sm:text-sm text-slate-400">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-100 mt-1">
            {value}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full
                        bg-indigo-500/10
                        flex items-center justify-center
                        text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default AdminApplicantsPage;