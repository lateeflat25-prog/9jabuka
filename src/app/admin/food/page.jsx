import FoodUploadForm from '../../components/FoodUploadForm';
import AdminLayout from '@/app/components/Adminlayout';
export default function FoodUploadPage() {
  return (
    <AdminLayout>
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <FoodUploadForm />
    </div>
    </AdminLayout>
   
  );
}