import { Link } from "react-router-dom";

export default function Footer() {
  const footerLinkClass =
    "group flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";

  const dotClass =
    "inline-block w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500";

  return (
    <footer className="mt-10 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/90 dark:bg-zinc-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <Link to="/" className="inline-block text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity">TravelUp</Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Discover curated stays, memorable hosts, and seamless bookings tailored for modern travel.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Support</h4>
            <div className="space-y-3 text-sm">
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Help Center</span></p>
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Cancellation Options</span></p>
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Safety Information</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Hosting</h4>
            <div className="space-y-3 text-sm">
              <Link to="/listings/new" className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">List Your Property</span></Link>
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Host Resources</span></p>
              <Link to="/bookings/manage" className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Host Dashboard</span></Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Company</h4>
            <div className="space-y-3 text-sm">
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">About TravelUp</span></p>
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Careers</span></p>
              <p className={footerLinkClass}><span className={dotClass} /><span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">Privacy</span></p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p>@2026 TravelUp, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
