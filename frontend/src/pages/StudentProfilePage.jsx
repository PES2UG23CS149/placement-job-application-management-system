import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    cgpa: '',
    branch: '',
    resumeUrl: '',
  });

  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/student/profile');

      setProfile(response.data);

      setForm({
        name: response.data.name || '',
        cgpa: response.data.cgpa ?? '',
        branch: response.data.branch || '',
        resumeUrl: response.data.resumeUrl || '',
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to load profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage('');
    setError('');
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    setMessage('');
    setError('');

    if (!file) {
      setResumeFile(null);
      return;
    }

    // Check PDF
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      event.target.value = '';
      setResumeFile(null);
      return;
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Resume size must not exceed 10 MB.');
      event.target.value = '';
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a PDF resume first.');
      return;
    }

    try {
      setUploadingResume(true);
      setMessage('');
      setError('');

      const formData = new FormData();

      formData.append('file', resumeFile);

      const response = await api.post(
        '/api/student/profile/resume',
        formData
      );

      setProfile(response.data);

      setForm((previous) => ({
        ...previous,
        resumeUrl: response.data.resumeUrl || '',
      }));

      setResumeFile(null);

      // Clear file input
      const fileInput = document.getElementById('resume');
      if (fileInput) {
        fileInput.value = '';
      }

      setMessage('Resume uploaded successfully.');
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to upload resume.'
      );
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    // Name validation
    if (!form.name.trim()) {
      setError('Full name is required.');
      return;
    }

    // CGPA validation
    const cgpa = Number(form.cgpa);

    if (form.cgpa === '' || Number.isNaN(cgpa)) {
      setError('Please enter your CGPA.');
      return;
    }

    if (cgpa < 0 || cgpa > 10) {
      setError('CGPA must be between 0 and 10.');
      return;
    }

    // Branch validation
    if (!form.branch.trim()) {
      setError('Please select your branch.');
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        '/api/student/profile',
        {
          name: form.name.trim(),
          cgpa: cgpa,
          branch: form.branch.trim(),
          resumeUrl: form.resumeUrl.trim() || null,
        }
      );

      setProfile(response.data);

      setForm({
        name: response.data.name || '',
        cgpa: response.data.cgpa ?? '',
        branch: response.data.branch || '',
        resumeUrl: response.data.resumeUrl || '',
      });

      setMessage('Profile updated successfully.');
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Unable to update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <p className="text-slate-500">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          My Profile
        </h1>

        <p className="text-slate-500 mt-2">
          Manage your academic and placement information.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">

        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">
            <span className="font-semibold">✓</span>
            <span>{message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            <span className="font-semibold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Card Header */}
          <div className="px-6 sm:px-8 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Personal & Academic Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Keep your information updated for placement applications.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 space-y-6"
          >

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           focus:border-indigo-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full border border-slate-200 bg-slate-50
                           rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
              />

              <p className="text-xs text-slate-400 mt-2">
                Your email is linked to your account and cannot be changed here.
              </p>
            </div>

            {/* CGPA + Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* CGPA */}
              <div>
                <label
                  htmlFor="cgpa"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  CGPA
                </label>

                <input
                  id="cgpa"
                  type="number"
                  name="cgpa"
                  value={form.cgpa}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="e.g. 8.50"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500 transition"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Enter a value between 0 and 10.
                </p>
              </div>

              {/* Branch */}
              <div>
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Branch
                </label>

                <select
                  id="branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3
                             bg-white focus:outline-none focus:ring-2
                             focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="">Select your branch</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ISE">Information Science & Engineering</option>
                  <option value="ECE">Electronics & Communication Engineering</option>
                  <option value="EEE">Electrical & Electronics Engineering</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="AIML">Artificial Intelligence & Machine Learning</option>
                  <option value="DS">Data Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>

            {/* Resume Upload */}
            <div>
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Resume
              </label>

              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                  className="block w-full text-sm text-slate-600
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-indigo-50 file:text-indigo-700
                             hover:file:bg-indigo-100"
                />

                <p className="text-xs text-slate-400 mt-2">
                  PDF only. Maximum file size: 10 MB.
                </p>

                {resumeFile && (
                  <p className="text-sm text-slate-600 mt-3">
                    Selected: <span className="font-medium">{resumeFile.name}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleResumeUpload}
                  disabled={!resumeFile || uploadingResume}
                  className="mt-4 w-full sm:w-auto
                             bg-indigo-600 hover:bg-indigo-700
                             disabled:bg-indigo-300 disabled:cursor-not-allowed
                             text-white font-semibold px-5 py-2.5 rounded-lg
                             transition-colors"
                >
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                </button>

                {form.resumeUrl && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">

                    <span className="text-sm text-green-600 font-medium">
                      ✓ Resume uploaded
                    </span>

                    <a
                      href={form.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800
                                 font-semibold underline"
                    >
                      View Resume
                    </a>

                  </div>
                )}

              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto min-w-[160px]
                           bg-indigo-600 hover:bg-indigo-700
                           disabled:bg-indigo-300 disabled:cursor-not-allowed
                           text-white font-semibold px-6 py-3 rounded-lg
                           transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}