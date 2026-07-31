import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, MessageCircle, AtSign, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/60 bg-white/60 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
                <ShieldCheck className="size-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-bold text-ink dark:text-white">
                BetGuard
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              A responsible betting companion helping you understand your spending, set healthy
              limits, and build better money habits.
            </p>
            <div className="mt-5 flex gap-3">
              {[Globe, MessageCircle, AtSign].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:-translate-y-0.5 hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-300"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold text-ink dark:text-white">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/register" className="transition hover:text-primary dark:hover:text-primary-light">Get Started</Link></li>
              <li><Link to="/login" className="transition hover:text-primary dark:hover:text-primary-light">Sign In</Link></li>
              <li><Link to="/education" className="transition hover:text-primary dark:hover:text-primary-light">Education Center</Link></li>
              <li><Link to="/community" className="transition hover:text-primary dark:hover:text-primary-light">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold text-ink dark:text-white">Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/risk-assessment" className="transition hover:text-primary dark:hover:text-primary-light">Risk Assessment</Link></li>
              <li><Link to="/settings" className="transition hover:text-primary dark:hover:text-primary-light">Settings</Link></li>
              <li><a href="#" className="transition hover:text-primary dark:hover:text-primary-light">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-primary dark:hover:text-primary-light">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-6 text-xs text-slate-400 md:flex-row dark:border-slate-800">
          <p>© {new Date().getFullYear()} BetGuard. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="size-3.5 fill-danger text-danger" aria-hidden="true" /> in Ghana — BetGuard promotes responsible betting. Not a betting platform. 18+
          </p>
        </div>
      </div>
    </footer>
  );
}
