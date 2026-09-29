import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  name: '',
  website: '',
  description: '',
};

function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCompanies = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError('');

      const response = await api.get('/api/admin/companies');
      setCompanies(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to load companies.'
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return companies;
    }

    return companies.filter((company) =>
      [
        company.name,
        company.website,
        company.description,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [companies, search]);

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

    const name = form.name.trim();
    const website = form.website.trim();
    const description = form.description.trim();

    if (!name) {
      setError('Company name is required.');
      return;
    }

    if (name.length < 2) {
      setError('Company name must contain at least 2 characters.');
      return;
    }

    if (website && !/^https?:\/\/.+/i.test(website)) {
      setError('Website must start with http:// or https://');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        website,
        description,
      };

      if (editingId) {
        await api.put(
          `/api/admin/companies/${editingId}`,
          payload
        );

        setSuccess('Company updated successfully.');
      } else {
        await api.post(
          '/api/admin/companies',
          payload
        );

        setSuccess('Company added successfully.');
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadCompanies(false);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to save company.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setEditingId(company.id);

    setForm({
      name: company.name || '',
      website: company.website || '',
      description: company.description || '',
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (company) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(company.id);
      setError('');
      setSuccess('');

      await api.delete(
        `/api/admin/companies/${company.id}`
      );

      if (editingId === company.id) {
        setForm(emptyForm);
        setEditingId(null);
      }

      setSuccess('Company deleted successfully.');

      await loadCompanies(false);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to delete company.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Companies
          </h1>

          <p className="text-slate-400 mt-2">
            Manage companies participating in campus placements.
          </p>
        </div>

        <button
          onClick={() => loadCompanies()}
          disabled={loading}
          className="w-full lg:w-auto px-4 py-2.5 rounded-lg border border-slate-600
                     bg-slate-800 text-slate-200
                     hover:bg-slate-700 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↻ {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30
                        bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/30
                        bg-emerald-500/10 px-4 py-3 text-emerald-300">
          {success}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 mb-8 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              {editingId ? 'Edit Company' : 'Add Company'}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {editingId
                ? 'Update the company information.'
                : 'Register a new company for campus placements.'}
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

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Infosys"
                maxLength={100}
                required
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500
                           transition"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Website
              </label>

              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500
                           transition"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                maxLength={1000}
                placeholder="Brief description about the company..."
                className="w-full px-4 py-3 rounded-lg
                           bg-slate-900 border border-slate-600
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-indigo-500
                           transition resize-none"
              />

              <div className="text-right text-xs text-slate-500 mt-1">
                {form.description.length}/1000
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg
                         bg-indigo-600 text-white font-medium
                         hover:bg-indigo-500 transition
                         disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Company'
                  : 'Add Company'}
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

      {/* Companies List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-sm overflow-hidden">

        {/* List Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-slate-700">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                Registered Companies
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Showing {filteredCompanies.length} of {companies.length} companies
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="px-3 py-1.5 rounded-full
                              bg-indigo-500/10 text-indigo-300
                              text-sm font-medium">
                {companies.length}
              </div>

            </div>
          </div>

          {/* Search */}
          <div className="mt-5">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, website or description..."
              className="w-full px-4 py-3 rounded-lg
                         bg-slate-900 border border-slate-600
                         text-slate-100 placeholder-slate-500
                         focus:outline-none focus:border-indigo-500
                         transition"
            />

          </div>

        </div>

        {/* Content */}
        {loading ? (

          <div className="p-10 text-center text-slate-400">
            Loading companies...
          </div>

        ) : filteredCompanies.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl mb-3">
              🏢
            </div>

            <h3 className="text-lg font-semibold text-slate-200">
              {companies.length === 0
                ? 'No companies registered'
                : 'No matching companies'}
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              {companies.length === 0
                ? 'Add your first company using the form above.'
                : 'Try a different search term.'}
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-700">

            {filteredCompanies.map((company) => (

              <div
                key={company.id}
                className="p-5 sm:p-6 hover:bg-slate-700/30 transition"
              >

                <div className="flex flex-col lg:flex-row
                                lg:items-center lg:justify-between gap-5">

                  <div className="flex items-start gap-4 min-w-0">

                    <div className="w-12 h-12 rounded-xl
                                    bg-indigo-500/10
                                    border border-indigo-500/20
                                    flex items-center justify-center
                                    text-2xl flex-shrink-0">
                      🏢
                    </div>

                    <div className="min-w-0">

                      <h3 className="text-lg font-semibold text-slate-100">
                        {company.name}
                      </h3>

                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1 text-sm
                                     text-indigo-400
                                     hover:text-indigo-300
                                     break-all"
                        >
                          {company.website}
                        </a>
                      )}

                      {company.description && (
                        <p className="text-sm text-slate-400 mt-2 max-w-3xl">
                          {company.description}
                        </p>
                      )}

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">

                    <button
                      onClick={() => handleEdit(company)}
                      disabled={deletingId === company.id}
                      className="px-4 py-2 rounded-lg
                                 bg-slate-700 text-slate-200
                                 hover:bg-slate-600 transition
                                 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(company)}
                      disabled={deletingId === company.id}
                      className="px-4 py-2 rounded-lg
                                 bg-red-500/10 text-red-300
                                 border border-red-500/20
                                 hover:bg-red-500/20 transition
                                 disabled:opacity-50"
                    >
                      {deletingId === company.id
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

export default AdminCompaniesPage;