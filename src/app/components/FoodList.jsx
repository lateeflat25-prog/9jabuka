'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChefHat, AlertCircle, Grid, List, Edit, DollarSign, 
  Clock, Tag, AlertTriangle, XCircle 
} from 'lucide-react';
import Image from 'next/image';
import { getFoods } from '@/app/lib/api';

export default function FoodListPage() {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

          {/* View Mode Toggle */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-white/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-white text-green-800 shadow-sm'
                  : 'text-white hover:bg-white/30'
              }`}
            >
              <Grid size={18} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-green-800 shadow-sm'
                  : 'text-white hover:bg-white/30'
              }`}
            >
              <List size={18} />
              List
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 bg-red-900/40 border border-red-500/50 rounded-xl flex items-center gap-4 max-w-4xl mx-auto backdrop-blur-sm">
            <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* No items */}
        {foods.length === 0 && !error ? (
          <div className="text-center py-16 text-white/80">
            <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-70" />
            <p className="text-xl">No food items in the menu yet.</p>
            <p className="mt-2">Add some delicious dishes!</p>
          </div>
        ) : (
          <>
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={food.imageUrl || '/placeholder-food.jpg'}
                        alt={food.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />

                      {/* Sold Out Badge */}
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

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {food.description || 'No description'}
                      </p>

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <DollarSign size={14} />
                            Price
                          </span>
                          <span className="font-medium text-green-700">
                            ${(food.price || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <Clock size={14} />
                            Time
                          </span>
                          <span>{food.cookingTime || '?'} mins</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <Tag size={14} />
                            Category
                          </span>
                          <span className="font-medium">{food.category || '—'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(food._id)}
                        className="mt-5 w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Edit size={16} />
                        Edit Dish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW (table-like) */}
            {viewMode === 'list' && (
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-green-700 to-emerald-800 text-white">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Image</th>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Price</th>
                        <th className="px-6 py-4 font-semibold">Category</th>
                        <th className="px-6 py-4 font-semibold">Time</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {foods.map((food) => (
                        <tr 
                          key={food._id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                              <Image
                                src={food.imageUrl || '/placeholder-food.jpg'}
                                alt={food.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {food.name}
                          </td>
                          <td className="px-6 py-4 text-green-700 font-medium">
                            ${(food.price || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {food.category || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {food.cookingTime || '?'} mins
                          </td>
                          <td className="px-6 py-4">
                            {food.isSoldOut ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                <XCircle size={14} />
                                Sold Out
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleEdit(food._id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <Edit size={16} />
                              Edit
                            </button>
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
    </div>
  );
}