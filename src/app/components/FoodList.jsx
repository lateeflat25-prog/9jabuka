'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { getFoods } from '@/app/lib/api';

export default function FoodListPage() {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
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
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-shadow"
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
                  <button
                    onClick={() => handleEdit(food._id)}
                    className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-2 px-4 rounded-xl font-medium transition-all hover:scale-105"
                  >
                    Edit Dish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}