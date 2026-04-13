import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Brain,
  TrendingUp,
  Lock,
  ArrowRight,
  Radar,
  Fingerprint,
  Activity,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'Enterprise-Grade AI/ML Detection',
      description: 'Advanced XGBoost and Isolation Forest algorithms detect insider threats with 95%+ accuracy',
    },
    {
      icon: TrendingUp,
      title: 'Explainable AI with SHAP',
      description: 'Transparent risk scoring with SHAP waterfall plots showing exactly why each user is flagged',
    },
    {
      icon: Shield,
      title: 'Dynamic Risk Updating',
      description: 'Real-time risk scores that adapt to user behavior and incident resolutions',
    },
    {
      icon: Lock,
      title: 'Active Prevention Control',
      description: 'Sensitive file access controls and incident management to prevent data breaches',
    },
  ];

  const steps = [
    {
      icon: Fingerprint,
      title: 'Observe behavior',
      description: 'Collect activity signals from logons, file access, web activity, and email usage.',
    },
    {
      icon: Radar,
      title: 'Score risk in real time',
      description: 'Model behavior patterns continuously and surface users with unusual activity.',
    },
    {
      icon: Activity,
      title: 'Explain and act',
      description: 'Show SHAP-based reasoning so teams understand why the alert was raised.',
    },
  ];

  const trustPoints = [
    'Role-based dashboards for users and admins',
    'Explainable risk scoring with SHAP insights',
    'Incident visibility, access control, and threat simulation',
  ];

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_30%)]" />

      <div className="relative container mx-auto px-4 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-16 lg:mb-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-700/40 bg-dark-800/80 text-sm text-gray-200 backdrop-blur">
                <Sparkles size={16} className="text-primary-400" />
                Insider threat detection made clear
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-pink-purple flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Shield className="text-white" size={34} />
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tight bg-gradient-pink-purple bg-clip-text text-transparent">
                    ALTRIX
                  </h1>
                </div>

                <p className="text-2xl lg:text-3xl text-white font-semibold max-w-xl">
                  Detect insider threats early. Understand risk instantly.
                </p>

                <p className="text-lg text-gray-300 max-w-2xl leading-8">
                  ALTRIX helps security teams identify unusual behavior, explain why it matters,
                  and respond with confidence using a clean, role-based security dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {trustPoints.map((point) => (
                  <div key={point} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/80 border border-primary-800/30 text-sm text-gray-200">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    {point}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-pink-purple text-white text-lg font-semibold rounded-2xl hover:shadow-lg hover:shadow-primary-500/40 transition-all transform hover:-translate-y-0.5"
                >
                  Open Platform
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
                </button>
                <div className="px-5 py-4 rounded-2xl border border-primary-800/30 bg-dark-800/70 text-gray-300 text-sm leading-6">
                  Built for SOC teams, managers, and analysts who want clarity without clutter.
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-pink-purple blur-3xl opacity-20 rounded-full" />
              <div className="relative rounded-[2rem] border border-primary-800/30 bg-dark-800/90 backdrop-blur p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Live Overview</p>
                    <h2 className="text-2xl font-bold text-white mt-2">Security at a glance</h2>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center border border-primary-500/20">
                    <Radar className="text-primary-400" size={22} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-dark-700/80 border border-primary-800/20 p-4">
                    <p className="text-xs text-gray-500 mb-2">Detection Accuracy</p>
                    <p className="text-3xl font-bold text-white">95%+</p>
                    <p className="text-xs text-emerald-400 mt-2">High confidence alerts</p>
                  </div>
                  <div className="rounded-2xl bg-dark-700/80 border border-primary-800/20 p-4">
                    <p className="text-xs text-gray-500 mb-2">Threat Coverage</p>
                    <p className="text-3xl font-bold text-white">24/7</p>
                    <p className="text-xs text-cyan-400 mt-2">Continuous monitoring</p>
                  </div>
                  <div className="rounded-2xl bg-dark-700/80 border border-primary-800/20 p-4">
                    <p className="text-xs text-gray-500 mb-2">Explainability</p>
                    <p className="text-3xl font-bold text-white">SHAP</p>
                    <p className="text-xs text-pink-400 mt-2">Why alerts happen</p>
                  </div>
                  <div className="rounded-2xl bg-dark-700/80 border border-primary-800/20 p-4">
                    <p className="text-xs text-gray-500 mb-2">Response Time</p>
                    <p className="text-3xl font-bold text-white">Fast</p>
                    <p className="text-xs text-orange-400 mt-2">Faster triage</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary-800/20 bg-gradient-to-br from-dark-900 to-dark-700 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-400">What ALTRIX shows</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">Simple and actionable</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-200"><span className="w-2 h-2 rounded-full bg-red-400" />Risky behavior patterns</div>
                    <div className="flex items-center gap-3 text-sm text-gray-200"><span className="w-2 h-2 rounded-full bg-cyan-400" />User activity timeline</div>
                    <div className="flex items-center gap-3 text-sm text-gray-200"><span className="w-2 h-2 rounded-full bg-emerald-400" />Explainable SHAP reasons</div>
                    <div className="flex items-center gap-3 text-sm text-gray-200"><span className="w-2 h-2 rounded-full bg-amber-400" />Incidents and access control</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16 lg:mb-20">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-2">How it works</p>
                <h2 className="text-3xl font-bold text-white">Easy to understand from the start</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="relative rounded-2xl border border-primary-800/30 bg-dark-800/80 p-6 hover:border-primary-500/50 transition-colors">
                  <div className="absolute top-4 right-4 text-5xl font-black text-white/5">0{index + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 mb-4">
                    <step.icon className="text-primary-400" size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-7">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16 lg:mb-20">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-primary-800/30 bg-dark-800/80 p-7 hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 mb-5 group-hover:bg-primary-500/15 transition-colors">
                  <feature.icon className="text-primary-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-7">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-2xl border border-primary-800/30 bg-dark-800/80 p-7">
              <h3 className="text-2xl font-bold text-white mb-5">Why teams choose ALTRIX</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary-400" />
                  <div>
                    <p className="text-white font-medium">Clear risk understanding</p>
                    <p className="text-gray-400 text-sm mt-1">Shows what happened, why it matters, and what to do next.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <div>
                    <p className="text-white font-medium">Designed for fast decisions</p>
                    <p className="text-gray-400 text-sm mt-1">Useful for both admins and end users without too much complexity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-white font-medium">Built for explainability</p>
                    <p className="text-gray-400 text-sm mt-1">SHAP insights and incident context help users trust the score.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary-800/30 bg-gradient-to-br from-dark-800 to-dark-900 p-7 flex flex-col justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-3">Get started</p>
                <h3 className="text-3xl font-bold text-white mb-3">A cleaner entry point for the platform</h3>
                <p className="text-gray-400 leading-7 max-w-lg">
                  Open the login page to access role-specific dashboards, security analytics, and explainable threat insights.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="group inline-flex items-center gap-3 px-7 py-4 bg-gradient-pink-purple text-white text-lg font-semibold rounded-2xl hover:shadow-lg hover:shadow-primary-500/40 transition-all transform hover:-translate-y-0.5"
                >
                  Login to Platform
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
