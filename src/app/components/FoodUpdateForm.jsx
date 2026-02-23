'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, Image, DollarSign, Clock, Tag, FileText, ChefHat, Check, AlertCircle, X, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { updateFood, getFoodById, deleteFood } from '../lib/api';

export default function FoodUpdateForm() {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  const [sizes, setSizes] = useState([]);
  const { id } = useParams();
  const router = useRouter();

  const watchedImage = watch('image');

  // Categories (consistent with FoodUploadForm)
  const categories = [
    'Special Rice',
    'Combination Platter',
    'Beans',
    'Soups & Swallow',
    'Sides',
    'Chef Specialties',
    'Pepper Soup',
    'Pastries',
    'Drinks',
    'Breakfast Menu',
    'Special soup', 'Weekend bowl', 'pan', 'litres'
  ];

  // Size options
  const sizeOptions = ['plate ','Half Pan', 'Full Pan', '2 Litres'];

  // Fetch food item data on mount
  useEffect(() => {
    const fetchFood = async () => {
      try {
        setIsLoading(true);
        const food = await getFoodById(id);
        // Populate form with existing data
        setValue('name', food.name);
        setValue('description', food.description);
        setValue('price', food.price);
        setValue('category', food.category);
        setValue('cookingTime', food.cookingTime);
        setImagePreview(food.imageUrl);
        
        // Load sizes if they exist
        if (food.hasSizes && food.sizes && food.sizes.length > 0) {
          setHasSizes(true);
          setSizes(food.sizes.map(size => ({
            name: size.name,
            price: size.price.toString()
          })));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching food item:', err);
        setError('Failed to load food item. Please try again.');
        setIsLoading(false);
      }
    };
    fetchFood();
  }, [id, setValue]);

  // Handle image preview
  useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (!watchedImage) {
      // Reset to original image if no new image is selected
      getFoodById(id).then(food => setImagePreview(food.imageUrl)).catch(() => {});
    }
  }, [watchedImage, id]);

  // Add a size
  const addSize = () => {
    if (sizes.length < 4) {
      setSizes([...sizes, { name: '', price: '' }]);
    }
  };

  // Remove a size
  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Update size data
  const updateSize = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = value;
    setSizes(updatedSizes);
  };

  const onSubmit = async (data) => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.price) formData.append('price', data.price);
      if (data.category) formData.append('category', data.category);
      if (data.cookingTime) formData.append('cookingTime', data.cookingTime);
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      // Add sizes if enabled
      if (hasSizes && sizes.length > 0) {
        // Filter out empty sizes and validate
        const validSizes = sizes.filter(size => size.name && size.price);
        
        if (validSizes.length === 0) {
          throw new Error('Please add at least one size with a price or disable sizes');
        }

        // Convert to proper format
        const sizesData = validSizes.map(size => ({
          name: size.name,
          price: parseFloat(size.price)
        }));

        formData.append('sizes', JSON.stringify(sizesData));
        formData.append('hasSizes', 'true');
      } else {
        // Clear sizes if disabled
        formData.append('sizes', JSON.stringify([]));
        formData.append('hasSizes', 'false');
      }

      console.log('Sending form data:', Object.fromEntries(formData));
      const response = await updateFood(id, formData);
      setSuccess('Food item updated successfully! The dish has been updated on 9jabuka.');
      setError(null);
      setTimeout(() => router.push('/admin/foodlist'), 2000);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update food item. Please try again.');
      setSuccess(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteFood(id);
      setSuccess('Food item deleted successfully! The dish has been removed from 9jabuka.');
      setTimeout(() => router.push('/admin/foodlist'), 2000);
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError(err.response?.data?.message || 'Failed to delete food item. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-[100vw] bg-gradient-to-br from-green-800 via-red-900 to-orange-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-green-800 via-red-900 to-orange-900 py-12 px-4">
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
          <h2 className="text-2xl font-bold text-white mb-2">Update Dish</h2>
          <p className="text-white/80">Edit the details of this dish to keep the menu fresh</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Update Food Item</h3>
                <p className="text-green-100">Modify the details below to update this dish</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800">Success!</h4>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Image className="w-4 h-4 mr-2 text-green-600" />
                  Dish Image
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          reset({ ...watch(), image: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      {...register('image')}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-50 hover:bg-green-50"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-600">Click to upload new image</span>
                      <span className="text-xs text-gray-500 mt-1">JPEG, JPG or PNG (max 5MB)</span>
                    </label>
                  </div>
                  {errors.image && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.image.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dish Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <ChefHat className="w-4 h-4 mr-2 text-green-600" />
                    Dish Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Jollof Rice with Chicken"
                    {...register('name', { 
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    {hasSizes ? 'Base Price (USD)' : 'Price (USD)'}
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15.99"
                    {...register('price', { 
                      min: { value: 0.01, message: 'Price must be greater than $0' },
                      max: { value: 999.99, message: 'Price must be less than $1000' }
                    })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.price.message}
                    </p>
                  )}
                  {hasSizes && (
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used if no size is selected
                    </p>
                  )}
                </div>
              </div>

              {/* Category and Cooking Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-green-600" />
                    Category
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                  >
                    <option value="">Select a category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Cooking Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    Cooking Time (minutes)
                  </label>
                  <input
                    id="cookingTime"
                    type="number"
                    min="1"
                    max="300"
                    placeholder="25"
                    {...register('cookingTime', { 
                      min: { value: 1, message: 'Cooking time must be at least 1 minute' },
                      max: { value: 300, message: 'Cooking time must be less than 5 hours' }
                    })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  />
                  {errors.cookingTime && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cookingTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Pan Sizes Section */}
              <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSizes}
                        onChange={(e) => {
                          setHasSizes(e.target.checked);
                          if (!e.target.checked) {
                            setSizes([]);
                          }
                        }}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="ml-3 text-sm font-semibold text-gray-700">
                        This dish has different pan sizes
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 ml-8 mt-1">
                      Enable this for dishes available in Half Pan, Full Pan, or 2 Litres
                    </p>
                  </div>
                </div>

                {hasSizes && (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-700">Pan Sizes & Prices</h4>
                      {sizes.length < 4 && (
                        <button
                          type="button"
                          onClick={addSize}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Size</span>
                        </button>
                      )}
                    </div>

                    {sizes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No sizes added yet. Click "Add Size" to start.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sizes.map((size, index) => (
                          <div key={index} className="flex gap-3 items-start bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Size Type
                              </label>
                              <select
                                value={size.name}
                                onChange={(e) => updateSize(index, 'name', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                              >
                                <option value="">Select size...</option>
                                {sizeOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Price (USD)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={size.price}
                                onChange={(e) => updateSize(index, 'price', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSize(index)}
                              className="mt-6 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Describe your delicious Nigerian dish... Include ingredients, preparation style, and what makes it special."
                  {...register('description', { 
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description.message}
                    </p>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {watch('description')?.length || 0}/500 characters
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {/* Update Button */}
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center space-x-3 text-lg"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Update Dish</span>
                    </>
                  )}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isUpdating || isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center space-x-3 text-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Dish</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            Update images with high-quality visuals to keep the menu appealing. 
            <br />
            This helps customers make better choices and boosts orders!
          </p>
        </div>
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
                  disabled={isDeleting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
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