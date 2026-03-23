import AdminPasswordGate from './AdminPasswordGate';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout({ children }) {
  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <main>{children}</main>
      </div>
    </AdminPasswordGate>
  );
}