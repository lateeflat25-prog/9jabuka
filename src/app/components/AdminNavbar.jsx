"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAdminAuth from '../hooks/Useadminauth';
const NAV_LINKS = [
  { href: '/admin/food',     label: 'Add Food',  icon: '🍽️' },
  { href: '/admin/foodlist', label: 'Food List',  icon: '📋' },
  { href: '/admin/order',   label: 'Orders',     icon: '🛒' },
];

export default function AdminNavbar() {
  const { pathname } = useRouter();
  const { logout } = useAdminAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍛</span>
          <span className="font-bold text-green-700 text-lg tracking-tight">NaijaBuka</span>
          <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full ml-1">Admin</span>
        </div>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-100 flex overflow-x-auto">
        {NAV_LINKS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                active ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}