'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, AlertCircle, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import Image from 'next/image';
import { getFoods, deleteFood } from '@/app/lib/api';

export default function FoodListPage() {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(null); // Will store the food ID being deleted
  const router = useRouter();

  // Ensure component is mounted before hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all food items on mount
  useEffect(() => {
    if (!isMounted) return;

    const fetchFoods = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        const foodData = await getFoods();
        setFoods(foodData || []);
      } catch (err) {
        console.error('Error fetching foods:', err);
        setError('Failed to load food items. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoods();
  }, [isMounted]);

  // Handle navigation to update form
  const handleEdit = (id) => {
    router.push(`/admin/update/${id}`);
  };

  // Handle delete confirmation
  const handleDelete = async (foodId) => {
    try {
      setIsDeleting(prev => ({ ...prev, [foodId]: true }));
      setError(null);
      await deleteFood(foodId);
      setSuccess('Food item deleted successfully!');
      
      // Refresh the foods list
      const updatedFoods = foods.filter(food => food._id !== foodId);
      setFoods(updatedFoods);
      
      // Clear modal and reset states
      setShowDeleteModal(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError(err.response?.data?.message || 'Failed to delete food item. Please try again.');
    } finally {
      setIsDeleting(prev => ({ ...prev, [foodId]: false }));
    }
  };

  const confirmDelete = (foodId) => {
    setShowDeleteModal(foodId);
  };

  const cancelDelete = () => {
    setShowDeleteModal(null);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-800 via-red-900 to-orange-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-800 via-red-900 to-orange-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-4xl">🇳🇬</div>
            <div>
              <h1 className="text-3xl font-bold text-white">9jabuka</h1>
              <p className="text-sm text-white/80">Admin Panel</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Manage Menu</h2>
          <p className="text-white/80">Select a dish to update its details</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3 max-w-3xl mx-auto">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800">Success!</h4>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 max-w-3xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Food Items Grid */}
        {foods.length === 0 && !error ? (
          <div className="text-center">
            <p className="text-white/80">No food items available. Add some dishes to the menu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.map((food) => (
              <div
                key={food._id}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-shadow relative"
              >
                <div className="relative h-48">
                  <Image
                    src={food.imageUrl || '/placeholder-food.jpg'}
                    alt={food.name || 'Food item'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={false}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ChefHat className="w-4 h-4 mr-2 text-green-600" />
                    {food.name || 'Unnamed Dish'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {food.description || 'No description available'}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    ${(food.price || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{food.category || 'Uncategorized'}</p>
                  <p className="text-sm text-gray-500">{food.cookingTime || 0} mins</p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(food._id)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-2 px-2 rounded-xl font-medium transition-all hover:scale-105 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(food._id)}
                      disabled={isDeleting[food._id]}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 px-2 rounded-xl font-medium transition-all hover:scale-105 text-sm flex items-center justify-center"
                    >
                      {isDeleting[food._id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl text-white">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Delete Dish</h3>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  Are you sure you want to delete this dish?
                </h4>
                <p className="text-gray-600 mb-4">
                  This will permanently remove the dish from your menu and cannot be recovered. 
                  This action will also remove the associated image from storage.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting[showDeleteModal]}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={isDeleting[showDeleteModal]}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {isDeleting[showDeleteModal] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}