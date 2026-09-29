import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [drivesResponse, applicationsResponse] =
        await Promise.all([
          api.get('/api/student/drives'),
          api.get('/api/student/applications'),
        ]);

      setDrives(drivesResponse.data);
      setApplications(applicationsResponse.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to load placement drives.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const appliedDriveIds = useMemo(() => {
    return new Set(
      applications
        .filter(
          (application) =>
            application.status !== 'WITHDRAWN'
        )
        .map(
          (application) =>
            application.drive?.id
        )
    );
  }, [applications]);

  const branches = useMemo(() => {
    const uniqueBranches = drives
      .map((drive) => drive.eligibleBranch)
      .filter(Boolean);

    return [...new Set(uniqueBranches)];
  }, [drives]);

  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        drive.jobTitle
          ?.toLowerCase()
          .includes(searchText) ||
        drive.company?.name
          ?.toLowerCase()
          .includes(searchText) ||
        drive.location
          ?.toLowerCase()
          .includes(searchText);

      const matchesBranch =
        branchFilter === 'ALL' ||
        drive.eligibleBranch === branchFilter ||
        !drive.eligibleBranch;

      return matchesSearch && matchesBranch;
    });
  }, [drives, search, branchFilter]);

  const isDeadlinePassed = (deadline) => {
    if (!deadline) {
      return false;
    }

    const deadlineDate = new Date(`${deadline}T23:59:59`);

    return deadlineDate < new Date();
  };

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return 'Not specified';
    }

    return new Date(
      `${deadline}T00:00:00`
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleApply = async (driveId) => {
    try {
      setApplying(driveId);
      setMessage('');
      setError('');

      await api.post(
        `/api/student/applications/${driveId}`
      );

      setMessage(
        'Application submitted successfully.'
      );

      // Refresh applications so the button changes
      // to the correct state immediately.
      const response = await api.get(
        '/api/student/applications'
      );

      setApplications(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to submit application.'
      );
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500">
              Loading placement drives...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Placement Drives
        </h1>

        <p className="text-slate-500 mt-2">
          View available placement opportunities and apply
          for eligible positions.
        </p>

      </div>

      <div className="max-w-7xl mx-auto">

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by job title, company or location..."
                className="w-full border border-slate-300 rounded-lg px-4 py-3
                           focus:outline-none focus:ring-2
                           focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Branch
              </label>

              <select
                value={branchFilter}
                onChange={(event) =>
                  setBranchFilter(event.target.value)
                }
                className="w-full border border-slate-300 rounded-lg
                           px-4 py-3 bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-indigo-500"
              >
                <option value="ALL">
                  All Branches
                </option>

                {branches.map((branch) => (
                  <option
                    key={branch}
                    value={branch}
                  >
                    {branch}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-4 text-sm text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredDrives.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">
              {drives.length}
            </span>{' '}
            placement drives
          </div>

        </div>

        {/* No drives */}
        {drives.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">

            <div className="text-4xl mb-4">
              📢
            </div>

            <h2 className="text-lg font-semibold text-slate-700">
              No open placement drives
            </h2>

            <p className="text-slate-500 mt-2">
              Check again later for new opportunities.
            </p>

          </div>
        ) : filteredDrives.length === 0 ? (
          /* No search results */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">

            <div className="text-4xl mb-4">
              🔍
            </div>

            <h2 className="text-lg font-semibold text-slate-700">
              No matching drives
            </h2>

            <p className="text-slate-500 mt-2">
              Try changing your search or branch filter.
            </p>

            <button
              onClick={() => {
                setSearch('');
                setBranchFilter('ALL');
              }}
              className="mt-5 px-5 py-2.5 rounded-lg bg-indigo-600
                         hover:bg-indigo-700 text-white font-medium"
            >
              Clear Filters
            </button>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {filteredDrives.map((drive) => {
              const alreadyApplied =
                appliedDriveIds.has(drive.id);

              const deadlinePassed =
                isDeadlinePassed(drive.deadline);

              return (
                <div
                  key={drive.id}
                  className="bg-white rounded-xl shadow-sm
                             border border-slate-200 p-6
                             hover:shadow-md transition-shadow"
                >

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <h2 className="text-xl font-bold text-slate-800">
                        {drive.jobTitle}
                      </h2>

                      <p className="text-indigo-600 font-semibold mt-1">
                        {drive.company?.name ||
                          'Company'}
                      </p>

                    </div>

                    <span className="shrink-0 px-3 py-1 rounded-full
                                     text-xs font-semibold
                                     bg-green-100 text-green-700">
                      {drive.status}
                    </span>

                  </div>

                  {/* Details */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Location
                      </p>

                      <p className="text-slate-700 mt-1">
                        📍 {drive.location || 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Salary
                      </p>

                      <p className="text-slate-700 mt-1">
                        ₹ {drive.salary || 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Minimum CGPA
                      </p>

                      <p className="text-slate-700 mt-1">
                        {drive.minCgpa ?? 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Eligible Branch
                      </p>

                      <p className="text-slate-700 mt-1">
                        {drive.eligibleBranch ||
                          'All branches'}
                      </p>
                    </div>

                  </div>

                  {/* Deadline */}
                  <div className="mt-5 rounded-lg bg-slate-50 border border-slate-100 p-4">

                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Application Deadline
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        deadlinePassed
                          ? 'text-red-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatDeadline(drive.deadline)}

                      {deadlinePassed && (
                        <span className="ml-2 text-xs">
                          (Closed)
                        </span>
                      )}
                    </p>

                  </div>

                  {/* Description */}
                  {drive.description && (
                    <div className="mt-5 pt-5 border-t border-slate-100">

                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                        Job Description
                      </p>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {drive.description}
                      </p>

                    </div>
                  )}

                  {/* Apply Button */}
                  {alreadyApplied ? (
                    <button
                      disabled
                      className="w-full mt-6 bg-green-50
                                 border border-green-200
                                 text-green-700 font-semibold
                                 py-3 rounded-lg cursor-not-allowed"
                    >
                      ✓ Already Applied
                    </button>
                  ) : deadlinePassed ? (
                    <button
                      disabled
                      className="w-full mt-6 bg-slate-100
                                 text-slate-400 font-semibold
                                 py-3 rounded-lg cursor-not-allowed"
                    >
                      Application Closed
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleApply(drive.id)
                      }
                      disabled={applying === drive.id}
                      className="w-full mt-6 bg-indigo-600
                                 hover:bg-indigo-700
                                 disabled:bg-indigo-300
                                 disabled:cursor-not-allowed
                                 text-white font-semibold py-3
                                 rounded-lg transition-colors"
                    >
                      {applying === drive.id
                        ? 'Applying...'
                        : 'Apply Now'}
                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}