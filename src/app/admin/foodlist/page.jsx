'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChefHat, AlertCircle, Trash2, AlertTriangle, Check, X, 
  Grid, List, Edit, DollarSign, Clock, Tag, XCircle, Power 
} from 'lucide-react';
import Image from 'next/image';
import { getFoods, deleteFood, updateFood } from '@/app/lib/api'; // ← make sure updateFood is imported
import AdminLayout from '@/app/components/Adminlayout';
export default function FoodListPage() {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isTogglingSoldOut, setIsTogglingSoldOut] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleEdit = (id) => {
    router.push(`/admin/update/${id}`);
  };

  const toggleSoldOut = async (foodId, currentSoldOut) => {
    const newStatus = !currentSoldOut;
    
    try {
      setIsTogglingSoldOut(prev => ({ ...prev, [foodId]: true }));
      setError(null);

      const formData = new FormData();
      formData.append('isSoldOut', newStatus ? 'true' : 'false');

      await updateFood(foodId, formData);

      // Update local state
      setFoods(prevFoods =>
        prevFoods.map(food =>
          food._id === foodId ? { ...food, isSoldOut: newStatus } : food
        )
      );

      setSuccess(`Dish marked as ${newStatus ? 'Sold Out' : 'Available'}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error toggling sold out:', err);
      setError('Failed to update sold out status. Please try again.');
    } finally {
      setIsTogglingSoldOut(prev => ({ ...prev, [foodId]: false }));
    }
  };

  const handleDelete = async (foodId) => {
    try {
      setIsDeleting(prev => ({ ...prev, [foodId]: true }));
      setError(null);
      await deleteFood(foodId);
      setSuccess('Food item deleted successfully!');
      
      const updatedFoods = foods.filter(food => food._id !== foodId);
      setFoods(updatedFoods);
      
      setShowDeleteModal(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError(err.response?.data?.message || 'Failed to delete food item.');
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

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-800 via-red-900 to-orange-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
  <div className="min-h-screen w-full bg-gradient-to-br from-green-800 via-red-900 to-orange-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header + View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-3 mb-3">
              <div className="text-5xl">🇳🇬</div>
              <div>
                <h1 className="text-4xl font-bold text-white">9jabuka</h1>
                <p className="text-white/80">Admin Panel</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Manage Menu</h2>
          </div>

          <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-white/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-5 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                viewMode === 'grid' ? 'bg-white text-green-800 shadow-sm' : 'text-white hover:bg-white/30'
              }`}
            >
              <Grid size={18} /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-5 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                viewMode === 'list' ? 'bg-white text-green-800 shadow-sm' : 'text-white hover:bg-white/30'
              }`}
            >
              <List size={18} /> List
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3 max-w-4xl mx-auto">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800">Success!</h4>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {foods.length === 0 && !error ? (
          <div className="text-center py-16 text-white/80">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-70" />
            <p className="text-xl">No food items found in the menu.</p>
          </div>
        ) : (
          <>
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={food.imageUrl || '/placeholder-food.jpg'}
                        alt={food.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {food.isSoldOut && (
                        <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1.5 z-10">
                          <XCircle size={14} />
                          Sold Out
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-green-700 flex-shrink-0" />
                        <span className="line-clamp-1">{food.name}</span>
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {food.description || 'No description'}
                      </p>

                      <div className="space-y-1.5 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <DollarSign size={14} /> Price
                          </span>
                          <span className="font-medium text-green-700">
                            ${(food.price || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <Clock size={14} /> Time
                          </span>
                          <span>{food.cookingTime || '?'} mins</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <Tag size={14} /> Category
                          </span>
                          <span className="font-medium">{food.category || '—'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Sold Out Toggle Button */}
                        <button
                          onClick={() => toggleSoldOut(food._id, food.isSoldOut)}
                          disabled={isTogglingSoldOut[food._id]}
                          className={`w-full py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
                            food.isSoldOut
                              ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                              : 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300'
                          } disabled:opacity-60`}
                        >
                          {isTogglingSoldOut[food._id] ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <Power size={14} />
                              {food.isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                            </>
                          )}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(food._id)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-2.5 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-1.5"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(food._id)}
                            disabled={isDeleting[food._id]}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white py-2.5 px-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center"
                          >
                            {isDeleting[food._id] ? (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
              <div className="bg-white/92 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/70">
                    <thead className="bg-gradient-to-r from-green-700 to-emerald-800 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Image</th>
                        <th className="px-6 py-4 text-left font-semibold">Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Price</th>
                        <th className="px-6 py-4 text-left font-semibold">Category</th>
                        <th className="px-6 py-4 text-left font-semibold">Time</th>
                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50 bg-white/60">
                      {foods.map((food) => (
                        <tr key={food._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                              <Image src={food.imageUrl || '/placeholder-food.jpg'} alt={food.name} fill className="object-cover" />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{food.name}</td>
                          <td className="px-6 py-4 text-green-700 font-medium">${(food.price || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-700">{food.category || '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{food.cookingTime || '?'} mins</td>
                          <td className="px-6 py-4">
                            {food.isSoldOut ? (
                              <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium gap-1.5">
                                <XCircle size={14} />
                                Sold Out
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => toggleSoldOut(food._id, food.isSoldOut)}
                                disabled={isTogglingSoldOut[food._id]}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                                  food.isSoldOut
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                } disabled:opacity-60`}
                              >
                                {isTogglingSoldOut[food._id] ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                ) : (
                                  <>
                                    <Power size={14} />
                                    {food.isSoldOut ? 'Available' : 'Sold Out'}
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleEdit(food._id)}
                                className="text-green-700 hover:text-green-900 font-medium flex items-center gap-1.5"
                              >
                                <Edit size={16} />
                                Edit
                              </button>

                              <button
                                onClick={() => confirmDelete(food._id)}
                                disabled={isDeleting[food._id]}
                                className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isDeleting[food._id] ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Delete Dish</h3>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  Are you sure?
                </h4>
                <p className="text-gray-600">
                  This will permanently remove the dish and its image.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting[showDeleteModal]}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={isDeleting[showDeleteModal]}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting[showDeleteModal] ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
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
    </AdminLayout>
  
  );
}