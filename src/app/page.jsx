'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Minus, X, Clock, MapPin, Phone, Star,
  Search, CheckCircle, XCircle, Menu
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getFoods } from '../../src/app/lib/api';
import Link from 'next/link';

// --------------------------------------------------
// Stripe
// --------------------------------------------------
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const createCheckoutSession = async (orderData) => {
  const response = await fetch('https://9jabukabackend-inky.vercel.app/api/orders/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to create checkout session');
  return result;
};

// --------------------------------------------------
// ZIP / Delivery
// --------------------------------------------------
const VALID_ZIP_CODES = [
  '07102',' 07103','07104','07105','07106','07107','07108','07112','07114',
  '07111','07017','07018','07029'
];

const calculateDistance = async (userAddress) => {
  const zipToDistance = {
    '07103':0,'07111':2,'07102':1,'07104':2,'07105':3,'07106':2.5,
    '07107':2,'07108':1.5,'07112':2,'07114':3,'07017':3.5,'07018':3.5,'07029':4
  };
  const userZip = userAddress.match(/\b\d{5}\b/)?.[0];
  const distance = zipToDistance[userZip] ?? 5;
  let deliveryFee;
  if (distance === 1) deliveryFee = 8.00;
  else if (distance === 2) deliveryFee = 10.00;
  else deliveryFee = Number((2 + distance).toFixed(2));
  return { distance, deliveryFee };
};

// --------------------------------------------------
// Component
// --------------------------------------------------
const FoodOrderingSystem = () => {
  // ---------- STATE ----------
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [allFoods, setAllFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(3.99);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedPanSize, setSelectedPanSize] = useState('');
  const [note, setNote] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const zipCode = watch('zipCode');

  // ---------- FETCH FOODS ----------
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const foods = await getFoods();
        const transformed = foods.map(f => ({
          id: f._id,
          name: f.name,
          description: f.description,
          price: f.price,
          category: f.category.toLowerCase(),
          image: f.imageUrl,
          time: `${f.cookingTime} min`,
          hasSizes: f.hasSizes || false,
          panSizes: f.hasSizes ? f.sizes.map(s => ({ size: s.name, price: s.price })) : []
        }));
        setAllFoods(transformed);
        setFilteredFoods(transformed);
        const cats = ['all', ...new Set(transformed.map(f => f.category))];
        setCategories(cats);
      } catch (e) {
        setError('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // ---------- DELIVERY FEE ----------
  useEffect(() => {
    if (zipCode && VALID_ZIP_CODES.includes(zipCode)) {
      calculateDistance(`Newark, NJ ${zipCode}`)
        .then(({ deliveryFee }) => {
          setDeliveryFee(parseFloat(deliveryFee.toFixed(2)));
          setError(null);
        })
        .catch(() => setError('Delivery fee error'));
    }
  }, [zipCode]);

  // ---------- FILTER ----------
  useEffect(() => {
    let list = allFoods;
    if (activeCategory !== 'all') list = list.filter(f => f.category === activeCategory);
    if (searchTerm) {
      list = list.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredFoods(list);
  }, [activeCategory, searchTerm, allFoods]);

  // ---------- MODAL ----------
  const openModal = (food) => {
    setSelectedFood(food);
    setModalQuantity(1);
    setSelectedPanSize(food.panSizes.length > 0 ? food.panSizes[0].size : '');
    setNote('');
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedFood(null);
  };
  const addToCartFromModal = () => {
    if (!selectedFood) return;
    const priceAtOrder = selectedPanSize
      ? selectedFood.panSizes.find(p => p.size === selectedPanSize).price
      : selectedFood.price;

    const cartItem = {
      id: selectedFood.id,
      name: selectedFood.name,
      priceAtOrder,
      quantity: modalQuantity,
      panSize: selectedPanSize || null,
      note: note.trim() || null,
      image: selectedFood.image,
    };

    const existing = cart.find(i => i.id === cartItem.id && i.panSize === cartItem.panSize);
    if (existing) {
      setCart(cart.map(i =>
        i.id === existing.id && i.panSize === existing.panSize
          ? { ...i, quantity: i.quantity + modalQuantity }
          : i
      ));
    } else {
      setCart([...cart, cartItem]);
    }
    closeModal();
  };

  // ---------- CART ----------
  const addToCart = (food) => {
    if (food.hasSizes && food.panSizes.length > 0) {
      openModal(food);
    } else {
      const cartItem = {
        id: food.id,
        name: food.name,
        priceAtOrder: food.price,
        quantity: 1,
        panSize: null,
        note: null,
        image: food.image,
      };
      const existing = cart.find(i => i.id === cartItem.id && !i.panSize);
      if (existing) {
        setCart(cart.map(i => i.id === cartItem.id && !i.panSize ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setCart([...cart, cartItem]);
      }
    }
  };

  const updateQuantity = (id, panSize, change) => {
    setCart(cart.map(item => {
      if (item.id === id && item.panSize === panSize) {
        const newQty = item.quantity + change;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const getTotalItems = () => cart.reduce((s, i) => s + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0).toFixed(2);

  // ---------- CHECKOUT ----------
 const onCheckoutSubmit = async (data) => {
    try {
      const orderData = {
        items: cart.map(i => ({
          food: i.id,  // Changed from foodId to food
          quantity: i.quantity,
        })),
        mobileNumber: data.mobileNumber,
        deliveryLocation: `${data.streetAddress}, ${data.city}, ${data.zipCode}`,
      };
      const { id } = await createCheckoutSession(orderData);
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      setError(err.message || 'Checkout failed');
    }
  };

  const formatCategoryName = (cat) => cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('/bg2.jpg')] lg:bg-[url('/bg.jpg')] fixed bg-cover bg-center bg-no-repeat bg-black/40 bg-blend-overlay"></div>

        <div className="relative z-10">

          {/* Header */}
          <header className="bg-white shadow-sm border-b fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                  <Link href="https://9jabukarestaurant.com">
                    <img src="/9ja.png" alt="9jabuka Logo" className="h-8 w-auto" />
                  </Link>
                </div>
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="https://9jabukarestaurant.com" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Home</a>
                  <a href="#menu" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Menu</a>
                  <a href="/pages/catering" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Reservation and catering</a>
                  <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
                </nav>
                <div className="hidden lg:flex flex-1 max-w-md mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowCart(true)}
                    className="relative bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-medium">${getTotalPrice()}</span>
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-t">
                <div className="px-4 py-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                  <nav className="flex flex-col space-y-2">
                    <a href="#menu" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Menu</a>
                    <a href="/pages/catering" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Reservation and catering</a>
                    <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
                  </nav>
                </div>
              </div>
            )}
          </header>

          {/* Success / Error */}
          {(orderSuccess || error) && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-4">
              <div className={`p-4 rounded-lg shadow-lg ${orderSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-3">
                  {orderSuccess ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className={`font-medium ${orderSuccess ? 'text-green-800' : 'text-red-800'}`}>
                      {orderSuccess ? orderSuccess.message : 'Error'}
                    </p>
                    <p className={`text-sm ${orderSuccess ? 'text-green-600' : 'text-red-600'}`}>
                      {orderSuccess ? "You'll receive a confirmation soon." : error}
                    </p>
                  </div>
                  <button onClick={() => { setOrderSuccess(null); setError(null); }} className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Logo (centered) */}
          <div className="flex justify-center pt-20">
            <img src="/9ja.png" alt="9jabuka" className="w-1/2 max-w-xs" />
          </div>

          {/* ====================== MENU SECTION ====================== */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="menu">

            {/* ---------- DESKTOP LAYOUT (lg+) ---------- */}
            <div className="hidden lg:flex gap-8">
              {/* Fixed Sidebar – Categories */}
              <aside className="w-64 flex-shrink-0 sticky top-24 self-start bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="xl:space-y-2 space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-md text-left px-4 py-2 rounded-lg font-medium transition-all ${
                        activeCategory === cat
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {formatCategoryName(cat)}
                      {cat !== 'all' && (
                        <span className="ml-2 text-xs opacity-70">
                          ({allFoods.filter(f => f.category === cat).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Scrollable Food Grid */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading menu...</p>
                  </div>
                ) : filteredFoods.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredFoods.map(food => (
                      <div
                        key={food.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group"
                      >
                        <div className="relative overflow-hidden h-48">
                          <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                            {formatCategoryName(food.category)}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{food.name}</h3>
                            <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-xs font-medium text-gray-600">4.8</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{food.description}</p>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{food.time}</span>
                            </div>

                           <div className="flex flex-col items-end text-right">
  <p className="text-xl font-bold text-green-600">
    ${food.price.toFixed(2)}
  </p>
  {food.hasSizes && food.panSizes?.length > 0 && (
    <p className="text-xs text-gray-500 mt-0.5">
      More sizes from ${Math.min(...food.panSizes.map(size => size.price)).toFixed(2)}
    </p>
  )}
</div>
                          </div>
                          <button
                            onClick={() => addToCart(food)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">Plate</div>
                    <h3 className="text-2xl font-semibold text-white mb-2">No dishes found</h3>
                    <p className="text-white/80 mb-6">
                      {searchTerm ? `No results for "${searchTerm}"` : 'No dishes available in this category'}
                    </p>
                    {(searchTerm || activeCategory !== 'all') && (
                      <button
                        onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Show All Dishes
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ---------- MOBILE LAYOUT (below lg) ---------- */}
            <div className="lg:hidden">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Browse Menu</h3>
                  <div className="text-sm text-white/90">
                    {!loading && `${filteredFoods.length} dishes available`}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                        activeCategory === cat
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300 hover:text-green-600'
                      }`}
                    >
                      {formatCategoryName(cat)}
                      {cat !== 'all' && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          activeCategory === cat ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          {allFoods.filter(f => f.category === cat).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading menu...</p>
                </div>
              ) : filteredFoods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredFoods.map(food => (
                    <div key={food.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group">
                      <div className="relative overflow-hidden h-48">
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                          {formatCategoryName(food.category)}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{food.name}</h3>
                          <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-xs font-medium text-gray-600">4.8</span>
                        </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{food.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{food.time}</span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {food.hasSizes ? `From $${food.panSizes[0].price.toFixed(2)}` : `$${food.price.toFixed(2)}`}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(food)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">Plate</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">No dishes found</h3>
                  <p className="text-white/80 mb-6">
                    {searchTerm ? `No results for "${searchTerm}"` : 'No dishes available in this category'}
                  </p>
                  {(searchTerm || activeCategory !== 'all') && (
                    <button
                      onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Show All Dishes
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* ==================== PAN SIZE MODAL ==================== */}
          {modalOpen && selectedFood && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                <button onClick={closeModal} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold mb-4">{selectedFood.name}</h2>

                {selectedFood.panSizes && selectedFood.panSizes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Size</label>
                    <select
                      value={selectedPanSize}
                      onChange={e => setSelectedPanSize(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      {selectedFood.panSizes.map(ps => (
                        <option key={ps.size} value={ps.size}>
                          {ps.size} - ${ps.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))} className="p-2 border rounded hover:bg-gray-50">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold w-12 text-center">{modalQuantity}</span>
                    <button onClick={() => setModalQuantity(modalQuantity + 1)} className="p-2 border rounded hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="E.g., Extra spicy"
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  onClick={addToCartFromModal}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          {/* ==================== CART SIDEBAR ==================== */}
          {showCart && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
              <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
                    <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {cart.length === 0 ? (
                    <div className="text-center py-16 flex-1 flex flex-col justify-center">
                      <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                      <p className="text-gray-400 text-sm mt-2">Browse our menu to add items</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
                        {cart.map((item, idx) => (
                          <div key={`${item.id}-${item.panSize}-${idx}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                              {item.panSize && <p className="text-xs text-gray-600">{item.panSize}</p>}
                              {item.note && <p className="text-xs italic text-gray-500">"{item.note}"</p>}
                              <p className="text-green-600 font-medium text-sm">${item.priceAtOrder.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button onClick={() => updateQuantity(item.id, item.panSize, -1)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.panSize, 1)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                          <span className="font-medium">${getTotalPrice()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                          <span>Total</span>
                          <span>${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => setShowCheckout(true)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors mt-4"
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== CHECKOUT MODAL ==================== */}
          {showCheckout && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowCheckout(false)} />
                <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
                      <p className="text-gray-600">Complete your order details</p>
                    </div>
                    <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onCheckoutSubmit)} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center text-gray-900">
                        <MapPin className="w-5 h-5 mr-2 text-green-600" />
                        Delivery Information
                      </h3>
                      <div className="space-y-4">
                        <input type="text" placeholder="Street Address" {...register('streetAddress', { required: 'Required' })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                        {errors.streetAddress && <p className="text-red-500 text-xs">{errors.streetAddress.message}</p>}
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="City" {...register('city', { required: 'Required' })} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                          <input type="text" placeholder="ZIP Code" {...register('zipCode', { required: 'Required', validate: v => VALID_ZIP_CODES.includes(v) || 'Not deliverable' })} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                        </div>
                        {(errors.city || errors.zipCode) && <p className="text-red-500 text-xs">{errors.city?.message || errors.zipCode?.message}</p>}
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input type="tel" placeholder="Phone" {...register('mobileNumber', { required: 'Required' })} className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                        </div>
                        {errors.mobileNumber && <p className="text-red-500 text-xs">{errors.mobileNumber.message}</p>}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-medium mb-4 text-gray-900">Order Summary</h3>
                      {cart.map((i, idx) => (
                        <div key={`${i.id}-${i.panSize}-${idx}`} className="flex justify-between text-sm mb-1">
                          <span>{i.name} × {i.quantity}{i.panSize && ` (${i.panSize})`}</span>
                          <span>${(i.priceAtOrder * i.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-3 space-y-1">
                        <div className="flex justify-between text-sm"><span>Subtotal</span><span>${getTotalPrice()}</span></div>
                        <div className="flex justify-between text-sm"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold text-lg pt-1 border-t"><span>Total</span><span>${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span></div>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg shadow-sm">
                      Pay ${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ==================== FOOTER ==================== */}
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <img src="/9ja.png" alt="9jabuka Logo" className="h-8 w-auto" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Bringing you the authentic taste of Nigeria with fresh ingredients and traditional recipes passed down through generations.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Daily 9AM - 7:30PM</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>973-753 4447</span>
                      <span>862-291-6464</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#menu" className="hover:text-green-600 transition-colors">Menu</a></li>
                    <li><a href="#about" className="hover:text-green-600 transition-colors">About Us</a></li>
                    <li><a href="#contact" className="hover:text-green-600 transition-colors">Contact</a></li>
                    <li><a href="#faq" className="hover:text-green-600 transition-colors">FAQ</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Customer Care</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#support" className="hover:text-green-600 transition-colors">Support</a></li>
                    <li><a href="#delivery" className="hover:text-green-600 transition-colors">Delivery Info</a></li>
                    <li><a href="#returns" className="hover:text-green-600 transition-colors">Returns</a></li>
                    <li><a href="#privacy" className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                <p className="text-sm text-gray-500">
                  © 2025 9jabuka. All rights reserved. | Bringing authentic Nigerian flavors to your table.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Elements>
  );
};

export default FoodOrderingSystem;