import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';

const Headers = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { profileData } = useUserProfile();

  const getUserInitial = () => {
    if (!profileData?.name) return 'U';
    return profileData.name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const platforms = [
    { id: 'leetcode', name: 'LeetCode', connected: !!profileData?.leetcode_username },
    { id: 'codeforces', name: 'Codeforces', connected: !!profileData?.codeforces_username },
    { id: 'codechef', name: 'CodeChef', connected: !!profileData?.codechef_username },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#1a1a1a]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ffa116]/25 bg-[#0f1720] p-1.5 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
              <img
                src="/images/devtrack-nobg.png"
                alt="DevTrack logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">DevTrack</h1>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Coding Hub</p>
            </div>
          </motion.div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/dashboard"
            className={`relative pb-1 text-sm font-medium transition ${isActive('/dashboard') ? 'text-[#ffa116]' : 'text-slate-300 hover:text-white'}`}
          >
            Dashboard
            <span className={`absolute bottom-0 left-0 h-0.5 bg-[#ffa116] transition-all duration-300 ${isActive('/dashboard') ? 'w-full' : 'w-0'}`}></span>
          </Link>

          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => {
              setIsDropdownOpen(true);
              setIsHoveringDropdown(true);
            }}
            onMouseLeave={() => {
              setIsHoveringDropdown(false);
              setTimeout(() => {
                if (!isHoveringDropdown) setIsDropdownOpen(false);
              }, 300);
            }}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative flex items-center gap-1 pb-1 text-sm font-medium transition ${
                isActive('/leetcode') || isActive('/codeforces') || isActive('/codechef')
                  ? 'text-[#ffa116]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Coding Profiles</span>
              <motion.span animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.span>
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#ffa116] transition-all duration-300 ${
                  isActive('/leetcode') || isActive('/codeforces') || isActive('/codechef') ? 'w-full' : 'w-0'
                }`}
              ></span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute left-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f1f] text-white shadow-2xl"
                  onMouseEnter={() => setIsHoveringDropdown(true)}
                  onMouseLeave={() => {
                    setIsHoveringDropdown(false);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="p-1">
                    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Connected Platforms
                    </div>

                    {platforms.map((platform) => (
                      <Link
                        key={platform.id}
                        to={`/${platform.id}`}
                        className="flex items-center px-4 py-3 text-sm transition hover:bg-white/5"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div
                          className={`mr-3 h-2 w-2 rounded-full ${platform.connected ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        ></div>
                        <span className="flex-1">{platform.name}</span>
                        <span className="text-xs text-slate-500">
                          {platform.connected ? 'Connected' : 'Not Connected'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/contest"
            className={`relative pb-1 text-sm font-medium transition ${isActive('/contest') ? 'text-[#ffa116]' : 'text-slate-300 hover:text-white'}`}
          >
            Contests
            <span className={`absolute bottom-0 left-0 h-0.5 bg-[#ffa116] transition-all duration-300 ${isActive('/contest') ? 'w-full' : 'w-0'}`}></span>
          </Link>
        </nav>

        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5" />
          </motion.button>

          <motion.div className="relative" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ffa116]/35 bg-[#2a2115] text-sm font-semibold text-[#ffd59a]"
            >
              {getUserInitial()}
            </Link>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#1a1a1a] bg-emerald-400"></span>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};

export default Headers;
