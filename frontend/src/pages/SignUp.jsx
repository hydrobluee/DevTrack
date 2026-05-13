import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle, X } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState([]);
  const { signUpNewUser, signInWithGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    const feedback = [];

    if (password.length >= 8) {
      strength += 1;
      feedback.push({ passed: true, text: 'At least 8 characters' });
    } else {
      feedback.push({ passed: false, text: 'At least 8 characters' });
    }

    if (/[A-Z]/.test(password)) {
      strength += 1;
      feedback.push({ passed: true, text: 'At least one uppercase letter' });
    } else {
      feedback.push({ passed: false, text: 'At least one uppercase letter' });
    }

    if (/[a-z]/.test(password)) {
      strength += 1;
      feedback.push({ passed: true, text: 'At least one lowercase letter' });
    } else {
      feedback.push({ passed: false, text: 'At least one lowercase letter' });
    }

    if (/[0-9]/.test(password)) {
      strength += 1;
      feedback.push({ passed: true, text: 'At least one number' });
    } else {
      feedback.push({ passed: false, text: 'At least one number' });
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
      feedback.push({ passed: true, text: 'At least one special character' });
    } else {
      feedback.push({ passed: false, text: 'At least one special character' });
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-white/10';
    if (passwordStrength <= 2) return 'bg-rose-500';
    if (passwordStrength <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      await signUpNewUser(formData.email, formData.password);
      setSuccess('Confirm your email-id.....');
      setTimeout(() => {
        navigate('/profileform');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
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
          <motion.h2
            className="mt-6 text-3xl font-semibold text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create your account
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-slate-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Already have an account?{' '}
            <a href="/login" className="font-medium text-[#ffa116] transition hover:text-[#ffb84d]">
              Sign in instead
            </a>
          </motion.p>
        </div>

        <motion.div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <div className="devtrack-card px-4 py-8 sm:px-10">
            {error && (
              <motion.div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-100" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                {success}
              </motion.div>
            )}

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

            <motion.form className="space-y-6" onSubmit={handleSubmit} variants={containerVariants}>
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
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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

                {formData.password && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-500">Password strength:</div>
                      <div className="text-xs font-medium text-slate-300">{getStrengthText()}</div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {passwordFeedback.map((item, index) => (
                        <div key={index} className="flex items-center text-xs">
                          {item.passed ? (
                            <CheckCircle className="mr-1 h-4 w-4 text-emerald-400" />
                          ) : (
                            <X className="mr-1 h-4 w-4 text-slate-500" />
                          )}
                          <span className={item.passed ? 'text-emerald-300' : 'text-slate-500'}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
                  Confirm Password
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="devtrack-input pr-10"
                    placeholder="Re-enter password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-500 transition hover:text-slate-300 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button type="submit" disabled={isLoading} className="devtrack-button-primary w-full text-sm">
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
