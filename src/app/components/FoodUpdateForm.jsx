'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Upload, Image, DollarSign, Clock, Tag, FileText, ChefHat, 
  Check, AlertCircle, X, Trash2, AlertTriangle, Plus 
} from 'lucide-react';
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
  const [isSoldOut, setIsSoldOut] = useState(false);

  const { id } = useParams();
  const router = useRouter();

  const watchedImage = watch('image');

  const categories = [
    'Special Rice', 'Combination Platter', 'Beans', 'Soups & Swallow',
    'Sides', 'Chef Specialties', 'Pepper Soup', 'Pastries', 'Drinks',
    'Breakfast Menu', 'Special soup', 'Weekend bowl', 'pan', 'litres'
  ];

  const sizeOptions = ['plate ', 'Half Pan', 'Full Pan', '2 Litres'];

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setIsLoading(true);
        const food = await getFoodById(id);

        setValue('name', food.name);
        setValue('description', food.description);
        setValue('price', food.price);
        setValue('category', food.category);
        setValue('cookingTime', food.cookingTime);
        setImagePreview(food.imageUrl);
        setIsSoldOut(food.isSoldOut === true);

        if (food.hasSizes && food.sizes?.length > 0) {
          setHasSizes(true);
          setSizes(food.sizes.map(s => ({
            name: s.name,
            price: s.price.toString()
          })));
        }

        setIsLoading(false);
      } catch (err) {
        setError('Could not load dish');
        setIsLoading(false);
      }
    };
    fetchFood();
  }, [id, setValue]);

  useEffect(() => {
    if (watchedImage?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(watchedImage[0]);
    }
  }, [watchedImage]);

  const addSize = () => {
    if (sizes.length < 4) setSizes([...sizes, { name: '', price: '' }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const onSubmit = async (data) => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      if (data.name)        formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.price)       formData.append('price', data.price);
      if (data.category)    formData.append('category', data.category);
      if (data.cookingTime) formData.append('cookingTime', data.cookingTime);
      if (data.image?.[0])  formData.append('image', data.image[0]);

      if (hasSizes && sizes.length > 0) {
        const valid = sizes.filter(s => s.name.trim() && s.price);
        if (valid.length === 0) throw new Error('Add at least one valid size');
        formData.append('sizes', JSON.stringify(
          valid.map(s => ({ name: s.name, price: parseFloat(s.price) }))
        ));
        formData.append('hasSizes', 'true');
      } else {
        formData.append('sizes', '[]');
        formData.append('hasSizes', 'false');
      }

      formData.append('isSoldOut', isSoldOut ? 'true' : 'false');

      await updateFood(id, formData);

      setSuccess(isSoldOut ? 'Updated → marked as SOLD OUT' : 'Dish updated');
      setTimeout(() => router.push('/admin/foodlist'), 1600);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteFood(id);
      setSuccess('Dish deleted');
      setTimeout(() => router.push('/admin/foodlist'), 1600);
    } catch {
      setError('Delete failed');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-red-900 to-orange-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-800 via-red-900 to-orange-900 pb-12">
      {/* Wider header area */}
      <div className="px-4 sm:px-6 lg:px-10 pt-10 pb-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="text-6xl">🇳🇬</div>
            <div>
              <h1 className="text-5xl font-bold text-white">9jabuka</h1>
              <p className="text-xl text-white/80 mt-1">Admin Panel</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white">Update Dish</h2>
        </div>

        <div className="bg-white/94 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">

          {/* Form header bar */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-7 text-white">
            <div className="flex items-center gap-4">
              <ChefHat className="w-10 h-10" />
              <div>
                <h3 className="text-3xl font-bold">Edit Dish Details</h3>
                <p className="text-green-100 mt-1">Make changes and save</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">

            {isSoldOut && (
              <div className="mb-10 p-6 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center gap-5">
                <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-red-800">SOLD OUT – ACTIVE</h3>
                  <p className="text-red-700 mt-1 text-lg">
                    This dish is hidden from ordering until you turn this off.
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-8 p-5 bg-green-50 border border-green-300 rounded-2xl flex items-center gap-4 text-lg">
                <Check className="w-8 h-8 text-green-700" />
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-300 rounded-2xl flex items-center gap-4 text-lg">
                <AlertCircle className="w-8 h-8 text-red-700" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

              {/* SOLD OUT SWITCH – prominent */}
              <div className="bg-red-50/70 p-7 rounded-2xl border border-red-200">
                <label className="flex items-center justify-between gap-6 cursor-pointer flex-wrap">
                  <div className="flex items-center gap-5">
                    <AlertTriangle className="w-9 h-9 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">Mark as Sold Out</div>
                      <div className="text-base text-gray-700 mt-1">
                        Customers will see "Sold Out" badge — no ordering possible
                      </div>
                    </div>
                  </div>

                  <div className="relative inline-block w-20 h-10">
                    <input
                      type="checkbox"
                      checked={isSoldOut}
                      onChange={e => setIsSoldOut(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-full h-full rounded-full transition duration-300 ${
                      isSoldOut ? 'bg-red-600' : 'bg-gray-400'
                    } peer-focus:ring-4 peer-focus:ring-red-300/50`}></div>
                    <div className={`absolute top-1.5 left-1.5 w-7 h-7 bg-white rounded-full transition-all duration-300 shadow ${
                      isSoldOut ? 'translate-x-10' : 'translate-x-0'
                    }`}></div>
                  </div>
                </label>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Image className="w-8 h-8 text-green-700" />
                  Dish Image
                </label>

                {imagePreview && (
                  <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-80 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        reset({ ...watch(), image: null });
                      }}
                      className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 shadow"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}

                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-56 border-3 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:border-green-600 hover:bg-green-50/50 transition-colors bg-gray-50"
                >
                  <Upload className="w-14 h-14 text-gray-500 mb-3" />
                  <span className="text-xl font-semibold text-gray-700">Click or drag new image here</span>
                  <span className="text-base text-gray-500 mt-2">JPEG / PNG – recommended 1200×1200 or larger</span>
                </label>
                <input id="image" type="file" accept="image/*" {...register('image')} className="hidden" />
              </div>

              {/* Name + Price row */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Dish Name</label>
                  <input
                    {...register('name', { required: true, minLength: 3 })}
                    className="w-full p-5 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="e.g. Pounded Yam + Egusi + assorted meat"
                  />
                  {errors.name && <p className="text-red-600 mt-2 text-base">Name is required (min 3 characters)</p>}
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">
                    {hasSizes ? 'Base Price ($)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { required: true, min: 0.01 })}
                    className="w-full p-5 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="14.50"
                  />
                  {errors.price && <p className="text-red-600 mt-2 text-base">Enter valid price</p>}
                </div>
              </div>

              {/* Category + Cooking time */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Category</label>
                  <select
                    {...register('category')}
                    className="w-full p-5 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition"
                  >
                    <option value="">— Select category —</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xl font-bold text-gray-900 mb-3">Cooking Time (minutes)</label>
                  <input
                    type="number"
                    {...register('cookingTime', { min: 1 })}
                    className="w-full p-5 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Sizes panel */}
              <div className="border-2 border-gray-300 rounded-2xl p-7 bg-gray-50/70">
                <label className="flex items-center gap-4 mb-6 text-xl font-bold">
                  <input
                    type="checkbox"
                    checked={hasSizes}
                    onChange={e => {
                      setHasSizes(e.target.checked);
                      if (!e.target.checked) setSizes([]);
                    }}
                    className="w-6 h-6"
                  />
                  Different portion sizes available (Half pan, Full pan, etc.)
                </label>

                {hasSizes && (
                  <>
                    <button
                      type="button"
                      onClick={addSize}
                      className="mb-6 flex items-center gap-3 px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-xl hover:bg-green-700 disabled:opacity-60"
                      disabled={sizes.length >= 4}
                    >
                      <Plus size={24} /> Add Size Option
                    </button>

                    <div className="space-y-6">
                      {sizes.map((size, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-5 bg-white p-6 rounded-xl border shadow-sm">
                          <div className="flex-1">
                            <label className="block text-base font-semibold mb-2">Size</label>
                            <select
                              value={size.name}
                              onChange={e => updateSize(i, 'name', e.target.value)}
                              className="w-full p-4 border rounded-lg text-base"
                            >
                              <option value="">Choose size</option>
                              {sizeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt.trim()}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-base font-semibold mb-2">Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={size.price}
                              onChange={e => updateSize(i, 'price', e.target.value)}
                              className="w-full p-4 border rounded-lg text-base"
                              placeholder="0.00"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSize(i)}
                            className="self-end sm:self-center p-4 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 size={28} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-3">Description</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className="w-full p-5 text-lg border-2 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 transition resize-y"
                  placeholder="Ingredients, spice level, best paired with..."
                />
              </div>

              {/* Action buttons – full width on mobile */}
              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-5 px-8 rounded-2xl text-xl font-bold transition disabled:opacity-60 flex items-center justify-center gap-4 shadow-lg"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin h-7 w-7 border-4 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : 'Update Dish'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isUpdating || isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-5 px-8 rounded-2xl text-xl font-bold transition disabled:opacity-60 flex items-center justify-center gap-4 shadow-lg"
                >
                  Delete Dish
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-red-600 p-8 text-white">
              <h3 className="text-3xl font-bold">Delete Dish?</h3>
              <p className="mt-3 text-xl opacity-90">This action cannot be undone.</p>
            </div>
            <div className="p-8">
              <p className="text-center text-gray-700 text-lg mb-8">
                Are you sure you want to permanently remove this item?
              </p>
              <div className="flex gap-5">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-red-700 disabled:opacity-60 transition flex items-center justify-center gap-3"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}