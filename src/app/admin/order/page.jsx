import OrderManagement from '../../components/OrderManagement';
import AdminLayout from '@/app/components/Adminlayout';

export default function OrderManagementPage() {
  return (
    <AdminLayout>
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <OrderManagement />
    </div>
    </AdminLayout>
   
  );
}