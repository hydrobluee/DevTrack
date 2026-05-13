import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.3, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { session, signInUser, signInWithGoogle, resetPassword } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      navigate('/profile');
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const { data, error } = await signInUser(trimmedEmail, trimmedPassword);
      if (error) {
        setError('Bad credentials');
      } else if (data?.user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
        setMessage('Password reset link sent to your email!');
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="devtrack-shell flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <a href="/" className="inline-flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ffa116]/25 bg-[#0f1720] p-2 shadow-[0_0_24px_rgba(16,185,129,0.12)]">
                <img
                  src="/images/devtrack-nobg.png"
                  alt="DevTrack logo"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-3xl font-semibold text-white">DevTrack</span>
            </a>
          </motion.div>
          <motion.h2 className="mt-6 text-3xl font-semibold text-white" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            {isForgotPassword ? 'Reset Password' : 'Sign in to your account'}
          </motion.h2>
          <motion.p className="mt-2 text-sm text-slate-400" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            {isForgotPassword ? (
              'Enter your email to receive a reset link'
            ) : (
              <>
                Or{' '}
                <a href="/signup" className="font-medium text-[#ffa116] transition hover:text-[#ffb84d]">
                  create a new account
                </a>
              </>
            )}
          </motion.p>
        </div>

        <motion.div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <div className="devtrack-card px-4 py-8 sm:px-10">
            {error && (
              <motion.div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-100" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.div>
            )}
            {(message || success) && (
              <motion.div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                {success || message}
              </motion.div>
            )}

            {isForgotPassword ? (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {resetSent ? (
                  <motion.div variants={itemVariants} className="text-center">
                    <p className="mb-4 text-sm text-slate-300">
                      Check your email at <span className="font-medium text-white">{resetEmail}</span> for the password reset link.
                    </p>
                    <button
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetSent(false);
                        setResetEmail('');
                      }}
                      className="devtrack-button-primary w-full"
                    >
                      Return to login
                    </button>
                  </motion.div>
                ) : (
                  <motion.form onSubmit={handleForgotPassword} variants={containerVariants}>
                    <motion.div variants={itemVariants} className="mb-4">
                      <label htmlFor="reset-email" className="block text-sm font-medium text-slate-200">
                        Email address
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                          id="reset-email"
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="devtrack-input pl-10"
                          placeholder="you@example.com"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setResetEmail('');
                          setError('');
                          setMessage('');
                        }}
                        className="text-sm font-medium text-slate-300 transition hover:text-white"
                      >
                        Back to login
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="devtrack-button-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </motion.div>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="devtrack-button-secondary w-full gap-2 text-sm"
                  >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                  </button>
                </motion.div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-[#1a1a1a] px-2 text-slate-500">Or continue with email</span>
                  </div>
                </div>

                <motion.form className="space-y-6" onSubmit={handleLogin} variants={containerVariants}>
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                      Email address
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="devtrack-input pl-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="devtrack-input pl-10 pr-10"
                        placeholder="........"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-500 transition hover:text-slate-300 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center justify-between" variants={itemVariants}>
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/10 bg-black/20 text-[#ffa116] focus:ring-[#ffa116]"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsForgotPassword(true);
                          setError('');
                          setMessage('');
                        }}
                        className="font-medium text-[#ffa116] transition hover:text-[#ffb84d]"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="devtrack-button-primary w-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? (
                        <svg
                          className="-ml-1 mr-2 h-4 w-4 animate-spin text-[#1a1a1a]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </motion.div>
                </motion.form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
