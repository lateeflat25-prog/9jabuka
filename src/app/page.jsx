'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Plus, Minus, X, Clock, MapPin, Phone, Star,
  Search, CheckCircle, XCircle, Menu, ChevronRight, Flame,
  Sparkles, ArrowRight, Leaf, Navigation, Loader
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getFoods } from '../../src/app/lib/api';
import Link from 'next/link';
import GLOBAL_STYLES from '../app/components/Styles';
// ─── Stripe ───────────────────────────────────────────────────────────────────
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

// ─── Business location (origin for all distance calculations) ─────────────────
const BUSINESS_LOCATION = {
  lat: 40.7242,
  lng: -74.2318,
  address: '891 Clinton Ave / 666 Springfield Ave, Irvington, NJ 07111',
};

// ─── Delivery zones: ZIP → distance in miles from business ───────────────────
const DELIVERY_ZONES = {
  // Newark ZIPs
  '07102': 4.8,
  '07103': 4.2,
  '07104': 5.1,
  '07105': 5.8,
  '07106': 3.5,
  '07107': 5.5,
  '07108': 3.9,
  '07112': 4.0,
  '07114': 5.6,
  // Irvington (home base)
  '07111': 0.5,
  // East Orange
  '07017': 2.1,
  '07018': 2.6,
  // Orange
  '07050': 3.0,
  // Maplewood
  '07040': 3.8,
  // Bloomfield
  '07003': 4.3,
  // Harrison
  '07029': 5.4,
  // Kearny
  '07032': 6.1,
  '07099': 6.4,
  // Union
  '07083': 6.5,
  // Vauxhall
  '07088': 7.2,
  // Elizabeth
  '07201': 8.4,
  // Elizabethport
  '07206': 9.1,
  // Linden
  '07036': 9.3,
  // Rutherford
  '07070': 11.3,
  // Cedar Grove
  '07009': 10.2,
  // Millburn
  '07041': 6.2,
  // Livingston
  '07039': 10.5,
  // Westfield
  '07090': 12.6,
  // Secaucus
  '07094': 12.8,
  // Passaic
  '07055': 12.9,
  // Jersey City
  '07097': 13.5,
  '07302': 14.2,
  // Union City
  '07087': 13.9,
  // North Bergen
  '07047': 14.6,
  // Plainfield
  '07060': 15.8,
  '07062': 16.4,
  // Edgewater
  '07020': 16.8,
  // Hackensack
  '07601': 19.2,  // near max
  // Paterson
  '07501': 18.9,
  // Parsippany
  '07054': 18.7,
};

const VALID_ZIP_CODES = Object.keys(DELIVERY_ZONES);

// ─── Delivery fee calculation (fair US average pricing) ──────────────────────
// Base fee: $3.99 for first 3 miles, then $0.85/mile after, capped at $14.99
const calculateDeliveryFee = (miles) => {
  if (miles <= 0) return 3.99;
  const BASE_FEE = 3.99;
  const BASE_MILES = 3;
  const PER_MILE_RATE = 0.85;
  const MAX_FEE = 14.99;

  let fee = BASE_FEE;
  if (miles > BASE_MILES) {
    fee += (miles - BASE_MILES) * PER_MILE_RATE;
  }
  return Math.min(parseFloat(fee.toFixed(2)), MAX_FEE);
};

// ─── Geocoding via OpenStreetMap Nominatim (free, no API key) ────────────────
const geocodeAddress = async (address) => {
  const encoded = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': '9jabuka-restaurant-app' },
  });
  const data = await res.json();
  if (!data || data.length === 0) throw new Error('Address not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
};

// ─── Haversine distance (miles) ──────────────────────────────────────────────
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Reverse geocode to get ZIP ──────────────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': '9jabuka-restaurant-app' },
  });
  const data = await res.json();
  return {
    zip: data?.address?.postcode || '',
    road: data?.address?.road || '',
    city: data?.address?.city || data?.address?.town || data?.address?.village || '',
    state: data?.address?.state || '',
    displayName: data?.display_name || '',
  };
};

// ─── Full address → distance + fee ───────────────────────────────────────────
const calculateDeliveryFromAddress = async (fullAddress) => {
  const coords = await geocodeAddress(fullAddress);
  const miles = haversineDistance(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng, coords.lat, coords.lng);
  const fee = calculateDeliveryFee(miles);

  // Check ZIP from address string
  const zipMatch = fullAddress.match(/\b(\d{5})\b/);
  const zip = zipMatch ? zipMatch[1] : '';

  // Validate: must be in delivery zone OR within ~20 miles
  if (zip && !DELIVERY_ZONES[zip] && miles > 20) {
    throw new Error(`Sorry, we don't deliver to ${zip}. Max delivery radius is ~20 miles from Irvington, NJ.`);
  }
  if (!zip && miles > 20) {
    throw new Error(`Sorry, this address is ${miles.toFixed(1)} miles away — outside our ~20-mile delivery zone.`);
  }

  return { miles: parseFloat(miles.toFixed(1)), fee, coords };
};

// ─── Category emoji map ───────────────────────────────────────────────────────
const CAT_EMOJI = {
  all: '✦', rice: '🍚', soup: '🍲', swallow: '🫕', snacks: '🥘',
  drinks: '🥤', protein: '🍗', dessert: '🍮', sides: '🥗',
};

const formatCategoryName = (cat) =>
  cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1);

// ─── Inline Styles ────────────────────────────────────────────────────────────


// ─── Component ────────────────────────────────────────────────────────────────
const FoodOrderingSystem = () => {
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
  const [deliveryMiles, setDeliveryMiles] = useState(null);
  const [deliveryError, setDeliveryError] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedPanSize, setSelectedPanSize] = useState('');
  const [note, setNote] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm();
  const watchedStreet = watch('streetAddress');
  const watchedCity = watch('city');
  const watchedZip = watch('zipCode');

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById('fos-styles')) {
      const style = document.createElement('style');
      style.id = 'fos-styles';
      style.textContent = GLOBAL_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch foods
  useEffect(() => {
    (async () => {
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
          panSizes: f.hasSizes ? f.sizes.map(s => ({ size: s.name, price: s.price })) : [],
          isSoldOut: f.isSoldOut === true,
        }));
        setAllFoods(transformed);
        setFilteredFoods(transformed);
        setCategories(['all', ...new Set(transformed.map(f => f.category))]);
      } catch {
        setError('Failed to load menu. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Recalculate delivery fee when address fields change (debounced)
  useEffect(() => {
    const street = watchedStreet;
    const city = watchedCity;
    const zip = watchedZip;

    if (!street || !city || !zip) return;
    if (zip.length < 5) return;

    const fullAddress = `${street}, ${city}, NJ ${zip}`;
    const timer = setTimeout(async () => {
      setDeliveryLoading(true);
      setDeliveryError(null);
      try {
        const { miles, fee } = await calculateDeliveryFromAddress(fullAddress);
        setDeliveryMiles(miles);
        setDeliveryFee(fee);
      } catch (err) {
        setDeliveryError(err.message);
        setDeliveryMiles(null);
        setDeliveryFee(3.99);
      } finally {
        setDeliveryLoading(false);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [watchedStreet, watchedCity, watchedZip]);

  // ── Geolocation: detect user's location ──
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setDeliveryError('Location detection is not supported on this device. Please type your address below.');
      return;
    }
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setDeliveryError('Location detection requires a secure connection (HTTPS). Please type your address below.');
      return;
    }

    setLocating(true);
    setDeliveryError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const info = await reverseGeocode(lat, lng);
          if (info.road) setValue('streetAddress', info.road);
          if (info.city) setValue('city', info.city);
          if (info.zip) setValue('zipCode', info.zip);

          const miles = haversineDistance(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng, lat, lng);
          const fee = calculateDeliveryFee(miles);
          setDeliveryMiles(parseFloat(miles.toFixed(1)));
          setDeliveryFee(fee);
          setDeliveryError(null);

          if (miles > 20) {
            setDeliveryError(`Your location is ${miles.toFixed(1)} miles away — outside our ~20-mile delivery zone.`);
          }
        } catch {
          setDeliveryError('Could not look up your address. Please type it manually below.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        // Map every GeolocationPositionError code to a plain-English message
        const MESSAGES = {
          1: 'Location access was denied. To enable it: go to your device Settings → Privacy → Location Services → enable for your browser. Or just type your address below.',
          2: 'Your device couldn\'t determine its location right now (try moving near a window or enabling Wi-Fi). Please type your address below.',
          3: 'Location detection timed out. Please type your address below.',
        };
        setDeliveryError(MESSAGES[err.code] || 'Location unavailable. Please type your address below.');
      },
      {
        timeout: 12000,
        maximumAge: 60000,       // accept a cached position up to 1 min old
        enableHighAccuracy: false // low-accuracy is faster and avoids kCLErrorLocationUnknown on iOS
      }
    );
  };

  // Filter
  useEffect(() => {
    let list = allFoods;
    if (activeCategory !== 'all') list = list.filter(f => f.category === activeCategory);
    if (searchTerm) list = list.filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFoods(list);
  }, [activeCategory, searchTerm, allFoods]);

  // Modal
  const openModal = (food) => {
    if (food.isSoldOut) return;
    setSelectedFood(food);
    setModalQuantity(1);
    setSelectedPanSize(food.panSizes.length > 0 ? food.panSizes[0].size : '');
    setNote('');
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setSelectedFood(null); };

  const getModalPrice = () => {
    if (!selectedFood) return 0;
    if (selectedPanSize) {
      const p = selectedFood.panSizes.find(p => p.size === selectedPanSize);
      return p ? p.price : selectedFood.price;
    }
    return selectedFood.price;
  };

  const addToCartFromModal = () => {
    if (!selectedFood || selectedFood.isSoldOut) return;
    const priceAtOrder = getModalPrice();
    const cartItem = { id: selectedFood.id, name: selectedFood.name, priceAtOrder, quantity: modalQuantity, panSize: selectedPanSize || null, note: note.trim() || null, image: selectedFood.image };
    const existing = cart.find(i => i.id === cartItem.id && i.panSize === cartItem.panSize);
    if (existing) {
      setCart(cart.map(i => i.id === existing.id && i.panSize === existing.panSize ? { ...i, quantity: i.quantity + modalQuantity } : i));
    } else {
      setCart([...cart, cartItem]);
    }
    closeModal();
  };

  // Cart
  const addToCart = (food) => {
    if (food.isSoldOut) { setError("Sorry, this dish is currently sold out."); setTimeout(() => setError(null), 3500); return; }
    if (food.hasSizes && food.panSizes.length > 0) { openModal(food); return; }
    const cartItem = { id: food.id, name: food.name, priceAtOrder: food.price, quantity: 1, panSize: null, note: null, image: food.image };
    const existing = cart.find(i => i.id === cartItem.id && !i.panSize);
    if (existing) {
      setCart(cart.map(i => i.id === cartItem.id && !i.panSize ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, cartItem]);
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

  const onCheckoutSubmit = async (data) => {
    if (deliveryError) { setError('Please fix the delivery address before proceeding.'); return; }
    try {
      const orderData = {
        items: cart.map(i => ({ food: i.id, quantity: i.quantity })),
        mobileNumber: data.mobileNumber,
        deliveryLocation: `${data.streetAddress}, ${data.city}, NJ ${data.zipCode}`,
      };
      const { id } = await createCheckoutSession(orderData);
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      setError(err.message || 'Checkout failed');
    }
  };

  // Delivery info pill content
  const renderDeliveryInfo = () => {
    if (deliveryLoading || locating) {
      return (
        <div className="fos-delivery-info">
          <Loader size={14} className="fos-spin" />
          Calculating delivery distance…
        </div>
      );
    }
    if (deliveryError) {
      return (
        <div className="fos-delivery-info error">
          <XCircle size={14} />
          {deliveryError}
        </div>
      );
    }
    if (deliveryMiles !== null) {
      return (
        <div className="fos-delivery-info success">
          <CheckCircle size={14} color="var(--sage)" />
          <strong>{deliveryMiles} miles</strong> from our kitchen · Delivery fee: <strong>${deliveryFee.toFixed(2)}</strong>
        </div>
      );
    }
    return (
      <div className="fos-delivery-info">
        <MapPin size={14} />
        We deliver within ~20 miles of Irvington, NJ. Enter your address to see the fee.
      </div>
    );
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="fos-root">

        {/* Toast */}
        {(orderSuccess || error) && (
          <div className={`fos-toast ${orderSuccess ? 'success' : 'error'}`}>
            <span className="fos-toast-icon">
              {orderSuccess
                ? <CheckCircle size={18} color="#3A9A3A" />
                : <XCircle size={18} color="#C8440A" />}
            </span>
            <div>
              <div className="fos-toast-title">{orderSuccess ? 'Order placed!' : 'Something went wrong'}</div>
              <div className="fos-toast-sub">{orderSuccess ? "You'll receive a confirmation soon." : error}</div>
            </div>
            <button className="fos-toast-close" onClick={() => { setOrderSuccess(null); setError(null); }}><X size={14} /></button>
          </div>
        )}

        {/* Header */}
        <header className={`fos-header ${scrolled ? 'scrolled' : ''}`}>
          <div className="fos-header-inner">
            <Link href="https://9jabukarestaurant.com">
              <img src="/9ja.png" alt="9jabuka" className="fos-logo" />
            </Link>
            <nav className="fos-nav">
              <a href="https://9jabukarestaurant.com">Home</a>
              <a href="#menu">Menu</a>
              <a href="/pages/catering">Catering</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="fos-search-wrap">
              <Search />
              <input type="text" placeholder="Search dishes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="fos-search-input" />
            </div>
            <button className="fos-cart-btn" onClick={() => setShowCart(true)}>
              <ShoppingCart size={16} />
              <span>${getTotalPrice()}</span>
              {getTotalItems() > 0 && <span className="fos-cart-badge">{getTotalItems()}</span>}
            </button>
            <button className="fos-menu-btn" onClick={() => setMobileMenuOpen(v => !v)}><Menu size={18} /></button>
          </div>
          {mobileMenuOpen && (
            <div className="fos-mobile-menu">
              <div className="fos-search-wrap" style={{ maxWidth: '100%' }}>
                <Search />
                <input type="text" placeholder="Search dishes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="fos-search-input" />
              </div>
              <a href="#menu" onClick={() => setMobileMenuOpen(false)}>Menu</a>
              <a href="/pages/catering" onClick={() => setMobileMenuOpen(false)}>Reservation & Catering</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            </div>
          )}
        </header>

        {/* Hero */}
        <section className="fos-hero">
          <div className="fos-hero-bg" />
          <div className="fos-hero-gradient" />
          <div className="fos-hero-content">
            <div className="fos-hero-pill"><Flame size={11} /> Authentic Nigerian Cuisine</div>
            <h1 className="fos-hero-title">From Our Kitchen,<br /><em>To Your Table</em></h1>
            <p className="fos-hero-sub">Fresh ingredients, traditional recipes passed down through generations — delivered to your door.</p>
            <div className="fos-hero-stats">
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">4.9★</div>
                <div className="fos-hero-stat-label">Avg Rating</div>
              </div>
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">30–45</div>
                <div className="fos-hero-stat-label">Min Delivery</div>
              </div>
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">{allFoods.length}+</div>
                <div className="fos-hero-stat-label">Menu Items</div>
              </div>
              <div className="fos-hero-stat">
                <div className="fos-hero-stat-val">~20mi</div>
                <div className="fos-hero-stat-label">Delivery Radius</div>
              </div>
            </div>
          </div>
        </section>

        <div className="fos-stripe" />

        {/* Mobile categories */}
        <div className="fos-mobile-cats" id="menu">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`fos-mobile-cat-pill ${activeCategory === cat ? 'active' : ''}`}>
              <span>{CAT_EMOJI[cat] || '🍽️'}</span>
              {formatCategoryName(cat)}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="fos-layout">
          {/* Sidebar */}
          <aside className="fos-sidebar">
            <div className="fos-sidebar-title">Categories</div>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`fos-cat-btn ${activeCategory === cat ? 'active' : ''}`}>
                <span className="fos-cat-emoji">{CAT_EMOJI[cat] || '🍽️'}</span>
                <span className="fos-cat-name">{formatCategoryName(cat)}</span>
                <span className="fos-cat-count">{cat === 'all' ? allFoods.length : allFoods.filter(f => f.category === cat).length}</span>
              </button>
            ))}
          </aside>

          {/* Food grid */}
          <div>
            <div className="fos-grid-header">
              <h2 className="fos-grid-title">
                {formatCategoryName(activeCategory)}
                {searchTerm && <span style={{ fontStyle: 'italic', fontWeight: 400, fontSize: '1.1rem', color: '#9E876A' }}> — "{searchTerm}"</span>}
              </h2>
              {!loading && <span className="fos-grid-count">{filteredFoods.length} dishes</span>}
            </div>
            <div className="fos-food-scroll">
              {loading ? (
                <div className="fos-loader"><div className="fos-spinner" /><p className="fos-loader-text">Preparing the menu…</p></div>
              ) : filteredFoods.length > 0 ? (
                <div className="fos-grid">
                  {filteredFoods.map(food => (
                    <div key={food.id} className={`fos-card ${food.isSoldOut ? 'sold-out' : ''}`} onClick={() => !food.isSoldOut && openModal(food)}>
                      <div className="fos-card-img-wrap">
                        <img src={food.image} alt={food.name} className="fos-card-img" />
                        <div className="fos-card-img-overlay" />
                        <div className="fos-card-badge">{formatCategoryName(food.category)}</div>
                        {food.isSoldOut && <div className="fos-card-sold-badge"><XCircle size={11} />Sold Out</div>}
                        <div className="fos-card-time"><Clock size={11} />{food.time}</div>
                        <div className="fos-card-star"><Star size={10} style={{ fill: '#D4A017', color: '#D4A017' }} />4.8</div>
                      </div>
                      <div className="fos-card-body">
                        <div className="fos-card-name">{food.name}</div>
                        <div className="fos-card-desc">{food.description}</div>
                        <div className="fos-card-footer">
                          <div className="fos-card-price-wrap">
                            <span className="fos-card-price">
                              {food.hasSizes ? `From $${Math.min(...food.panSizes.map(s => s.price)).toFixed(2)}` : `$${food.price.toFixed(2)}`}
                            </span>
                            {food.hasSizes && <span className="fos-card-price-from">Multiple sizes</span>}
                          </div>
                          <button className="fos-add-btn" disabled={food.isSoldOut} onClick={e => { e.stopPropagation(); addToCart(food); }}>
                            {food.isSoldOut ? <><XCircle size={13} />Sold Out</> : <><Plus size={13} />Add</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="fos-empty">
                  <div className="fos-empty-emoji">🍽️</div>
                  <h3 className="fos-empty-title">No dishes found</h3>
                  <p className="fos-empty-sub">{searchTerm ? `No results for "${searchTerm}"` : 'Nothing in this category yet.'}</p>
                  {(searchTerm || activeCategory !== 'all') && <button className="fos-empty-btn" onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>Show all dishes</button>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pan size / add modal */}
        {modalOpen && selectedFood && (
          <div className="fos-overlay" onClick={closeModal}>
            <div className="fos-modal" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <img src={selectedFood.image} alt={selectedFood.name} className="fos-modal-img" />
              <button className="fos-modal-close" onClick={closeModal}><X size={16} /></button>
              <div className="fos-modal-body">
                <div className="fos-modal-title">{selectedFood.name}</div>
                {selectedFood.panSizes && selectedFood.panSizes.length > 0 && (
                  <div className="fos-field-group">
                    <label className="fos-field-label">Choose Size</label>
                    <select value={selectedPanSize} onChange={e => setSelectedPanSize(e.target.value)} className="fos-select">
                      {selectedFood.panSizes.map(ps => <option key={ps.size} value={ps.size}>{ps.size} — ${ps.price.toFixed(2)}</option>)}
                    </select>
                  </div>
                )}
                <div className="fos-field-group">
                  <label className="fos-field-label">Quantity</label>
                  <div className="fos-qty-row">
                    <button className="fos-qty-btn" onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}><Minus size={14} /></button>
                    <span className="fos-qty-val">{modalQuantity}</span>
                    <button className="fos-qty-btn" onClick={() => setModalQuantity(modalQuantity + 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className="fos-field-group">
                  <label className="fos-field-label">Special Instructions</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Extra spicy, no onions…" rows={2} className="fos-textarea" />
                </div>
              </div>
              <div className="fos-modal-footer">
                <div className="fos-modal-total">
                  <span className="fos-modal-total-label">Subtotal</span>
                  <span className="fos-modal-total-price">${(getModalPrice() * modalQuantity).toFixed(2)}</span>
                </div>
                <button className="fos-primary-btn" onClick={addToCartFromModal}><ShoppingCart size={16} /> Add to Cart</button>
              </div>
            </div>
          </div>
        )}

        {/* Cart panel */}
        {showCart && (
          <>
            <div className="fos-cart-overlay" onClick={() => setShowCart(false)} />
            <div className="fos-cart-panel">
              <div className="fos-cart-header">
                <div className="fos-cart-title">
                  Your Order
                  {getTotalItems() > 0 && <span className="fos-cart-title-count">{getTotalItems()}</span>}
                </div>
                <button className="fos-close-btn" onClick={() => setShowCart(false)}><X size={16} /></button>
              </div>
              {cart.length === 0 ? (
                <div className="fos-cart-empty">
                  <div className="fos-cart-empty-icon"><ShoppingCart size={28} color="#BEA98A" /></div>
                  <div className="fos-cart-empty-title">Your cart is empty</div>
                  <div className="fos-cart-empty-sub">Browse our menu and add some dishes!</div>
                </div>
              ) : (
                <>
                  <div className="fos-cart-items">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${item.panSize}-${idx}`} className="fos-cart-item">
                        <img src={item.image} alt={item.name} className="fos-cart-item-img" />
                        <div className="fos-cart-item-info">
                          <div className="fos-cart-item-name">{item.name}</div>
                          <div className="fos-cart-item-meta">{item.panSize && <>{item.panSize} · </>}${item.priceAtOrder.toFixed(2)} each</div>
                          {item.note && <div className="fos-cart-item-meta" style={{ fontStyle: 'italic' }}>"{item.note}"</div>}
                          <div className="fos-cart-item-price">${(item.priceAtOrder * item.quantity).toFixed(2)}</div>
                        </div>
                        <div className="fos-cart-qty">
                          <button className="fos-cart-qty-btn" onClick={() => updateQuantity(item.id, item.panSize, -1)}><Minus size={10} /></button>
                          <span className="fos-cart-qty-val">{item.quantity}</span>
                          <button className="fos-cart-qty-btn" onClick={() => updateQuantity(item.id, item.panSize, 1)}><Plus size={10} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="fos-cart-footer">
                    <div className="fos-cart-line"><span>Subtotal</span><span>${getTotalPrice()}</span></div>
                    <div className="fos-cart-line"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
                    <div className="fos-cart-total">
                      <span className="fos-cart-total-label">Total</span>
                      <span className="fos-cart-total-price">${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                    </div>
                    <button className="fos-primary-btn" onClick={() => { setShowCart(false); setShowCheckout(true); }}>Checkout <ArrowRight size={16} /></button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Checkout modal */}
        {showCheckout && (
          <div className="fos-overlay" onClick={() => setShowCheckout(false)}>
            <div className="fos-checkout-modal" onClick={e => e.stopPropagation()}>
              <div className="fos-checkout-header">
                <div>
                  <div className="fos-checkout-title">Complete Your Order</div>
                  <div className="fos-checkout-sub">Fill in your delivery details below</div>
                </div>
                <button className="fos-close-btn" onClick={() => setShowCheckout(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit(onCheckoutSubmit)}>
                <div className="fos-checkout-body">
                  <div>
                    <div className="fos-section-header">
                      <MapPin size={18} className="fos-section-icon" />
                      <span className="fos-section-title">Delivery Address</span>
                    </div>

                    {/* Delivery info banner */}
                    {renderDeliveryInfo()}

                    <div className="fos-input-group">
                      {/* Street address + locate button */}
                      <div className="fos-address-row">
                        <input
                          type="text"
                          placeholder="Street Address"
                          {...register('streetAddress', { required: 'Street address is required' })}
                          className="fos-input"
                        />
                        <button
                          type="button"
                          className="fos-locate-btn"
                          onClick={handleLocateMe}
                          disabled={locating}
                          title="Use my current location"
                        >
                          {locating
                            ? <Loader size={14} className="fos-spin" />
                            : <Navigation size={14} />}
                          {locating ? 'Locating…' : 'Locate Me'}
                        </button>
                      </div>
                      {errors.streetAddress && <p className="fos-error-text">{errors.streetAddress.message}</p>}

                      <div className="fos-input-row">
                        <input
                          type="text"
                          placeholder="City"
                          {...register('city', { required: 'City is required' })}
                          className="fos-input"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          maxLength={5}
                          {...register('zipCode', {
                            required: 'ZIP code is required',
                            pattern: { value: /^\d{5}$/, message: 'Enter a valid 5-digit ZIP' },
                          })}
                          className="fos-input"
                        />
                      </div>
                      {(errors.city || errors.zipCode) && (
                        <p className="fos-error-text">{errors.city?.message || errors.zipCode?.message}</p>
                      )}

                      <div className="fos-input-icon-wrap">
                        <Phone size={16} />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          {...register('mobileNumber', { required: 'Phone number is required' })}
                          className="fos-input"
                        />
                      </div>
                      {errors.mobileNumber && <p className="fos-error-text">{errors.mobileNumber.message}</p>}
                    </div>
                  </div>

                  <div className="fos-order-summary">
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.875rem', color: 'var(--ink)' }}>Order Summary</div>
                    {cart.map((i, idx) => (
                      <div key={`${i.id}-${i.panSize}-${idx}`} className="fos-summary-item">
                        <span>{i.name} × {i.quantity}{i.panSize ? ` (${i.panSize})` : ''}</span>
                        <span style={{ fontWeight: 600 }}>${(i.priceAtOrder * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <hr className="fos-summary-divider" />
                    <div className="fos-summary-item"><span>Subtotal</span><span>${getTotalPrice()}</span></div>
                    <div className="fos-summary-item">
                      <span>Delivery {deliveryMiles ? `(${deliveryMiles} mi)` : ''}</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <hr className="fos-summary-divider" />
                    <div className="fos-summary-total">
                      <span className="fos-summary-total-label">Total</span>
                      <span className="fos-summary-total-price">${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 1.75rem 1.75rem' }}>
                  {deliveryError && (
                    <p className="fos-error-text" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={13} /> {deliveryError}
                    </p>
                  )}
                  <button type="submit" className="fos-pay-btn" disabled={!!deliveryError || deliveryLoading}>
                    {deliveryLoading
                      ? <><Loader size={16} className="fos-spin" /> Calculating…</>
                      : <>Pay ${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)} <ArrowRight size={16} /></>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="fos-footer" id="contact">
          <div className="fos-footer-inner">
            <div>
              <img src="/9ja.png" alt="9jabuka" className="fos-footer-logo" />
              <p className="fos-footer-desc">
                Bringing you the authentic taste of Nigeria with fresh ingredients and traditional recipes passed down through generations.
              </p>
              <div className="fos-footer-info">
                <div className="fos-footer-info-row"><MapPin size={13} /><span>891 Clinton Ave / 666 Springfield Ave, Irvington, NJ 07111</span></div>
                <div className="fos-footer-info-row"><Clock size={13} /><span>Daily 9AM – 7:30PM</span></div>
                <div className="fos-footer-info-row"><Phone size={13} /><span>973-753-4447 · 862-291-6464</span></div>
              </div>
            </div>
            <div>
              <div className="fos-footer-heading">Quick Links</div>
              <div className="fos-footer-links">
                <a href="#menu">Menu</a>
                <a href="#about">About Us</a>
                <a href="#contact">Contact</a>
                <a href="#faq">FAQ</a>
              </div>
            </div>
            <div>
              <div className="fos-footer-heading">Customer Care</div>
              <div className="fos-footer-links">
                <a href="#support">Support</a>
                <a href="#delivery">Delivery Info</a>
                <a href="#returns">Returns</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="fos-footer-bottom">
            © 2025 9jabuka · All rights reserved · Authentic Nigerian flavors to your table · Delivering within ~20 miles of Irvington, NJ
          </div>
        </footer>

      </div>
    </Elements>
  );
};

export default FoodOrderingSystem;