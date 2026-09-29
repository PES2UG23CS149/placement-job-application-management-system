import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');

  // Controls whether we show login/register or OTP screen
  const [otpStep, setOtpStep] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    setError('');
  };

  // ==========================================
  // HANDLE OTP INPUT
  // ==========================================
  const handleOtpChange = (e) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Maximum 6 digits
    if (value.length > 6) {
      return;
    }

    setOtp(value);
    setError('');
  };

  // ==========================================
  // LOGIN / REGISTER
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const url = `http://localhost:8080/api/auth/${mode}`;

      const body =
        mode === 'login'
          ? {
              email: form.email,
              password: form.password
            }
          : {
              name: form.name,
              email: form.email,
              phone: form.phone,
              password: form.password
            };

      const { data } = await axios.post(url, body);

      // ========================================
      // LOGIN
      // ========================================
      if (mode === 'login') {

        /*
         * Backend now returns:
         *
         * {
         *   status: "OTP_REQUIRED",
         *   challengeId: "...",
         *   message: "OTP has been sent..."
         * }
         */

        if (data.status === 'OTP_REQUIRED') {

          setChallengeId(data.challengeId);

          setOtp('');

          setOtpStep(true);

          return;
        }

        // Fallback in case backend directly returns JWT
        login(data);

        navigate('/student');

        return;
      }

      // ========================================
      // REGISTRATION
      // ========================================

      // Registration currently returns JWT directly
      login(data);

      navigate('/student');

    } catch (err) {

      const responseData = err.response?.data;

      if (typeof responseData === 'string') {
        setError(responseData);
      } else if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError('Something went wrong. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      setLoading(false);
      return;
    }

    try {

      const { data } = await axios.post(
        'http://localhost:8080/api/auth/verify-otp',
        {
          challengeId: challengeId,
          otp: otp
        }
      );

      /*
       * Backend returns JWT after successful OTP verification.
       */

      login(data);

      navigate('/student');

    } catch (err) {

      const responseData = err.response?.data;

      if (typeof responseData === 'string') {
        setError(responseData);
      } else if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError('Invalid or expired OTP.');
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK TO LOGIN
  // ==========================================
  const handleBackToLogin = () => {

    setOtpStep(false);

    setOtp('');

    setChallengeId('');

    setError('');
  };

  // ==========================================
  // SWITCH LOGIN / REGISTER
  // ==========================================
  const switchMode = (newMode) => {

    setMode(newMode);

    setOtpStep(false);

    setOtp('');

    setChallengeId('');

    setError('');

    setForm({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-4">

            <svg
              className="w-7 h-7 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>

          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Placement Portal
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Manage your placements and job applications
          </p>

        </div>


        {/* =====================================
            OTP SCREEN
        ====================================== */}

        {otpStep ? (

          <div>

            <div className="text-center mb-6">

              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">

                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>

              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Verify Your Phone
              </h3>

              <p className="text-slate-500 text-sm mt-2">
                Enter the 6-digit OTP sent to your registered phone number.
              </p>

            </div>


            <form
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >

              {/* OTP INPUT */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  One-Time Password
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center text-lg tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

              </div>


              {/* ERROR */}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}


              {/* VERIFY BUTTON */}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>


              {/* BACK BUTTON */}

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Back to Login
              </button>

            </form>

          </div>

        ) : (

          <>

            {/* =====================================
                MODE TOGGLE
            ====================================== */}

            <div className="flex bg-slate-100 rounded-lg p-1 mb-6">

              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'register'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register
              </button>

            </div>


            {/* =====================================
                LOGIN / REGISTER FORM
            ====================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* FULL NAME */}

              {mode === 'register' && (

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />

                </div>

              )}


              {/* PHONE */}

              {mode === 'register' && (

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="+919876543210"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />

                  <p className="text-xs text-slate-500 mt-1">
                    Use international format, e.g. +919876543210
                  </p>

                </div>

              )}


              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

              </div>


              {/* ERROR */}

              {error && (

                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {typeof error === 'object'
                    ? JSON.stringify(error)
                    : error}
                </div>

              )}


              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>

            </form>

          </>

        )}

      </div>

    </div>
  );
}