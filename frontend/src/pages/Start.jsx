import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  Calendar,
  TrendingUp,
  Code,
  Github,
  Trophy,
  Flame,
  Activity,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const featureVariants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 14,
    },
  },
};

export default function Start() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <BarChart2 className="h-5 w-5 text-[#ffa116]" />,
      title: 'Unified profile stats',
      description:
        'Track LeetCode, CodeChef, and Codeforces in one dense dashboard instead of hopping across tabs.',
    },
    {
      icon: <Calendar className="h-5 w-5 text-emerald-400" />,
      title: 'Contest calendar',
      description:
        'See your upcoming contests in a single schedule with reminders that stay visible.',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-sky-400" />,
      title: 'Performance trends',
      description:
        'Review rating movement, solved counts, and steady practice streaks with a cleaner signal-first layout.',
    },
    {
      icon: <Code className="h-5 w-5 text-rose-400" />,
      title: 'Multi-platform sync',
      description:
        'Connect all coding profiles once and keep your progress organized in one place.',
    },
  ];

  return (
    <div className="devtrack-shell flex flex-col">
      <nav
        className={`fixed z-20 w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'border-white/8 bg-[#1a1a1a]/95 shadow-lg shadow-black/20 backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ffa116]/25 bg-[#0f1720] p-1.5 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
                <img
                  src="/images/devtrack-nobg.png"
                  alt="DevTrack logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">DevTrack</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Practice Better</div>
              </div>
            </a>
            <div className="hidden items-center gap-7 md:flex">
              <a href="#features" className="text-sm font-medium text-slate-300 transition hover:text-white">
                Features
              </a>
              <a href="#preview" className="text-sm font-medium text-slate-300 transition hover:text-white">
                Preview
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Login
            </a>
            <a
              href="/signup"
              className="rounded-2xl bg-[#ffa116] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#ffb84d]"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <motion.section
        className="px-4 pb-16 pt-28 sm:px-6 md:pt-36 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <motion.div
              variants={itemVariants}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200"
            >
              <Flame className="h-4 w-4" />
              Inspired by LeetCode, tuned for DevTrack
            </motion.div>
            <motion.h1
              className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
              variants={itemVariants}
            >
              Your coding dashboard, rebuilt with a sharper LeetCode-style UI.
            </motion.h1>
            <motion.p
              className="mt-5 max-w-2xl text-lg leading-8 text-slate-300"
              variants={itemVariants}
            >
              DevTrack brings your contest profiles, solved counts, streak activity, and upcoming
              events into one dark workspace with the same dense, focused feel competitive coders
              already love.
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap gap-4" variants={itemVariants}>
              <a href="/signup" className="devtrack-button-primary gap-2">
                Start Tracking
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#features" className="devtrack-button-secondary">
                See Features
              </a>
            </motion.div>
            <motion.div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4" variants={itemVariants}>
              {[
                { label: 'Platforms', value: '3+' },
                { label: 'Contest feed', value: 'Live' },
                { label: 'Heatmaps', value: 'Unified' },
                { label: 'Insights', value: 'Actionable' },
              ].map((stat) => (
                <div key={stat.label} className="devtrack-card-soft px-4 py-4">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div id="preview" variants={itemVariants} className="devtrack-card p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-400">
                devtrack.com/u/you
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="devtrack-card-soft p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/20 bg-[#0f1720] p-3 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
                      <img
                        src="/images/devtrack-nobg.png"
                        alt="DevTrack logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-white">devtrack_user</div>
                      <div className="mt-1 text-sm text-slate-400">Unified coding profile</div>
                      <div className="mt-4 text-3xl font-semibold text-[#ffa116]">2,184</div>
                      <div className="text-sm text-slate-500">Rank snapshot</div>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-emerald-500/15 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
                    Edit Profile
                  </div>
                </div>

                <div className="devtrack-card-soft p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Problems solved</div>
                      <div className="mt-2 text-5xl font-semibold text-white">416</div>
                      <div className="mt-1 text-sm text-emerald-300">Across all platforms</div>
                    </div>
                    <Activity className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="mt-6 grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 px-4 py-3">
                      <span className="text-sm text-slate-300">Easy</span>
                      <span className="font-semibold text-emerald-300">118</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 px-4 py-3">
                      <span className="text-sm text-slate-300">Medium</span>
                      <span className="font-semibold text-amber-300">214</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-rose-500/10 px-4 py-3">
                      <span className="text-sm text-slate-300">Hard</span>
                      <span className="font-semibold text-rose-300">84</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="devtrack-card-soft p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-semibold text-white">Recent activity</div>
                    <div className="mt-1 text-sm text-slate-400">71 submissions in the last year</div>
                  </div>
                  <Trophy className="h-6 w-6 text-[#ffa116]" />
                </div>
                <div className="mt-5 grid grid-cols-12 gap-2">
                  {Array.from({ length: 72 }).map((_, index) => {
                    const tone =
                      index % 11 === 0
                        ? 'bg-emerald-500/90'
                        : index % 7 === 0
                          ? 'bg-emerald-700/80'
                          : index % 5 === 0
                            ? 'bg-emerald-900/70'
                            : 'bg-white/6';

                    return <div key={index} className={`h-4 rounded-[4px] ${tone}`}></div>;
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section id="features" className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Built for the same fast scan experience as LeetCode.
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-400">
              Dense cards, dark surfaces, high-contrast stats, and a cleaner structure that feels
              native to competitive programming dashboards.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={featureVariants}
              >
                <div className="devtrack-card h-full p-6 transition duration-300 hover:-translate-y-1">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-black/15 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ffa116]/20 bg-[#0f1720] p-1.5">
              <img
                src="/images/devtrack-nobg.png"
                alt="DevTrack logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">DevTrack</div>
              <p className="mt-1 text-sm text-slate-500">
                All your coding progress in one focused workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-sm text-slate-400 transition hover:text-white">
              Support & Privacy
            </a>
            <a
              href="https://github.com/hydrobluee/DevTrack"
              className="text-slate-400 transition hover:text-white"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm text-slate-500">© 2026 DevTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
