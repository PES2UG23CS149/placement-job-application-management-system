import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  companyId: '',
  jobTitle: '',
  location: '',
  salary: '',
  description: '',
  deadline: '',
  minCgpa: '',
  eligibleBranch: 'CSE',
  status: 'OPEN',
};

const STATUS_STYLES = {
  OPEN: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  CLOSED: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const BRANCHES = [
  'CSE',
  'ISE',
  'ECE',
  'EEE',
  'ME',
  'CIVIL',
  'AIML',
  'DS',
];

function AdminPlacementDrivesPage() {
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [companiesResponse, drivesResponse] =
        await Promise.all([
          api.get('/api/admin/companies'),
          api.get('/api/admin/drives'),
        ]);

      setCompanies(companiesResponse.data || []);
      setDrives(drivesResponse.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to load placement drives.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDrives = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drives.filter((drive) => {
      const matchesSearch =
        !query ||
        [
          drive.company?.name,
          drive.jobTitle,
          drive.location,
          drive.eligibleBranch,
        ]
          .filter(Boolean)
          .some((value) =>
            value.toLowerCase().includes(query)
          );

      const matchesStatus =
        statusFilter === 'ALL' ||
        drive.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drives, search, statusFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!form.companyId) {
      setError('Please select a company.');
      return;
    }

    if (!form.jobTitle.trim()) {
      setError('Job title is required.');
      return;
    }

    if (!form.location.trim()) {
      setError('Location is required.');
      return;
    }

    if (!form.deadline) {
      setError('Application deadline is required.');
      return;
    }

    const minCgpa = Number(form.minCgpa);

    if (
      form.minCgpa === '' ||
      Number.isNaN(minCgpa) ||
      minCgpa < 0 ||
      minCgpa > 10
    ) {
      setError('Minimum CGPA must be between 0 and 10.');
      return;
    }

    if (!form.salary.trim()) {
      setError('Salary/package is required.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        company: {
          id: Number(form.companyId),
        },
        jobTitle: form.jobTitle.trim(),
        location: form.location.trim(),
        salary: form.salary.trim(),
        description: form.description.trim(),
        deadline: form.deadline,
        minCgpa: minCgpa,
        eligibleBranch: form.eligibleBranch,
        status: form.status,
      };

      if (editingId) {
        await api.put(
          `/api/admin/drives/${editingId}`,
          payload
        );

        setSuccess(
          'Placement drive updated successfully.'
        );
      } else {
        await api.post(
          '/api/admin/drives',
          payload
        );

        setSuccess(
          'Placement drive created successfully.'
        );
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to save placement drive.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (drive) => {
    setEditingId(drive.id);

    setForm({
      companyId: drive.company?.id
        ? String(drive.company.id)
        : '',
      jobTitle: drive.jobTitle || '',
      location: drive.location || '',
      salary: drive.salary || '',
      description: drive.description || '',
      deadline: drive.deadline || '',
      minCgpa:
        drive.minCgpa !== null &&
        drive.minCgpa !== undefined
          ? String(drive.minCgpa)
          : '',
      eligibleBranch: drive.eligibleBranch || 'CSE',
      status: drive.status || 'OPEN',
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (drive) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${drive.jobTitle}" at ${
        drive.company?.name || 'this company'
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(drive.id);
      setError('');
      setSuccess('');

      await api.delete(
        `/api/admin/drives/${drive.id}`
      );

      if (editingId === drive.id) {
        setForm(emptyForm);
        setEditingId(null);
      }

      setSuccess(
        'Placement drive deleted successfully.'
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to delete placement drive.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openCount = drives.filter(
    (drive) => drive.status === 'OPEN'
  ).length;

  const closedCount = drives.filter(
    (drive) => drive.status === 'CLOSED'
  ).length;

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Placement Drives
          </h1>

          <p className="text-slate-400 mt-2">
            Create and manage campus placement opportunities.
          </p>
        </div>

        <button
          onClick={loadData}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-sm text-slate-400">
            Total Drives
          </p>

          <p className="text-3xl font-bold text-slate-100 mt-1">
            {drives.length}
          </p>
        </div>

        <div className="bg-slate-800 border border-emerald-500/20 rounded-xl p-5">
          <p className="text-sm text-emerald-300">
            Open Drives
          </p>

          <p className="text-3xl font-bold text-emerald-300 mt-1">
            {openCount}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <p className="text-sm text-slate-400">
            Closed Drives
          </p>

          <p className="text-3xl font-bold text-slate-200 mt-1">
            {closedCount}
          </p>
        </div>

      </div>

      {/* Add / Edit Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 mb-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              {editingId
                ? 'Edit Placement Drive'
                : 'Create Placement Drive'}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {editingId
                ? 'Update the placement opportunity details.'
                : 'Create a new campus placement opportunity.'}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company *
              </label>

              <select
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100
                           focus:outline-none focus:border-indigo-500"
              >
                <option value="">
                  Select company
                </option>

                {companies.map((company) => (
                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name}
                  </option>
                ))}
              </select>

              {companies.length === 0 && (
                <p className="text-xs text-amber-300 mt-2">
                  Add a company before creating a placement drive.
                </p>
              )}
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Job Title *
              </label>

              <input
                type="text"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                maxLength={150}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location *
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                maxLength={100}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Salary / Package *
              </label>

              <input
                type="text"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. 8 LPA"
                maxLength={50}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Application Deadline *
              </label>

              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Minimum CGPA */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum CGPA *
              </label>

              <input
                type="number"
                name="minCgpa"
                value={form.minCgpa}
                onChange={handleChange}
                placeholder="e.g. 7.0"
                min="0"
                max="10"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Eligible Branch */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Eligible Branch *
              </label>

              <select
                name="eligibleBranch"
                value={form.eligibleBranch}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100
                           focus:outline-none focus:border-indigo-500"
              >
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status *
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100
                           focus:outline-none focus:border-indigo-500"
              >
                <option value="OPEN">
                  OPEN
                </option>

                <option value="CLOSED">
                  CLOSED
                </option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Job Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                maxLength={1500}
                placeholder="Describe the role, responsibilities and requirements..."
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500
                           resize-none"
              />

              <div className="text-right text-xs text-slate-500 mt-1">
                {form.description.length}/1500
              </div>

            </div>

          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">

            <button
              type="submit"
              disabled={saving || companies.length === 0}
              className="px-5 py-2.5 rounded-lg
                         bg-indigo-600 text-white font-medium
                         hover:bg-indigo-500 transition
                         disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Drive'
                  : 'Create Drive'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg
                           bg-slate-700 text-slate-200
                           hover:bg-slate-600 transition
                           disabled:opacity-50"
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>

      {/* Drives List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

        {/* List Header */}
        <div className="p-5 sm:p-6 border-b border-slate-700">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Placement Drives
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Showing {filteredDrives.length} of {drives.length} drives
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full
                            bg-indigo-500/10 text-indigo-300
                            text-sm font-medium w-fit">
              {drives.length}
            </div>

          </div>

          {/* Search + Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, job, location..."
              className="md:col-span-2 w-full px-4 py-3 rounded-lg
                         bg-slate-900 border border-slate-600
                         text-slate-100 placeholder-slate-500
                         focus:outline-none focus:border-indigo-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg
                         bg-slate-900 border border-slate-600
                         text-slate-100
                         focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="OPEN">
                Open
              </option>

              <option value="CLOSED">
                Closed
              </option>
            </select>

          </div>

        </div>

        {/* List */}
        {loading ? (

          <div className="p-10 text-center text-slate-400">
            Loading placement drives...
          </div>

        ) : filteredDrives.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl mb-3">
              💼
            </div>

            <h3 className="text-lg font-semibold text-slate-200">
              {drives.length === 0
                ? 'No placement drives'
                : 'No matching drives'}
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {drives.length === 0
                ? 'Create your first placement drive using the form above.'
                : 'Try changing your search or status filter.'}
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-700">

            {filteredDrives.map((drive) => (

              <div
                key={drive.id}
                className="p-5 sm:p-6 hover:bg-slate-700/20 transition"
              >

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">

                  {/* Drive Details */}
                  <div className="flex items-start gap-4 min-w-0">

                    <div className="w-12 h-12 rounded-xl
                                    bg-indigo-500/10
                                    border border-indigo-500/20
                                    flex items-center justify-center
                                    text-2xl flex-shrink-0">
                      💼
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-semibold text-slate-100">
                          {drive.jobTitle}
                        </h3>

                        <span
                          className={`px-2.5 py-1 rounded-full border
                                      text-xs font-semibold
                                      ${STATUS_STYLES[drive.status] ||
                                        STATUS_STYLES.CLOSED}`}
                        >
                          {drive.status}
                        </span>

                      </div>

                      <p className="text-indigo-400 font-medium mt-1">
                        {drive.company?.name ||
                          'Unknown Company'}
                      </p>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-slate-400">

                        <span>
                          📍 {drive.location || '—'}
                        </span>

                        <span>
                          💰 {drive.salary || '—'}
                        </span>

                        <span>
                          🎓 {drive.eligibleBranch || '—'}
                        </span>

                        <span>
                          📊 Min CGPA: {drive.minCgpa ?? '—'}
                        </span>

                        <span>
                          📅 Deadline: {drive.deadline || '—'}
                        </span>

                      </div>

                      {drive.description && (
                        <p className="text-sm text-slate-400 mt-3 max-w-4xl">
                          {drive.description}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">

                    <button
                      onClick={() => handleEdit(drive)}
                      disabled={deletingId === drive.id}
                      className="px-4 py-2 rounded-lg
                                 bg-slate-700 text-slate-200
                                 hover:bg-slate-600 transition
                                 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(drive)}
                      disabled={deletingId === drive.id}
                      className="px-4 py-2 rounded-lg
                                 bg-red-500/10 text-red-300
                                 border border-red-500/20
                                 hover:bg-red-500/20 transition
                                 disabled:opacity-50"
                    >
                      {deletingId === drive.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}

export default AdminPlacementDrivesPage;