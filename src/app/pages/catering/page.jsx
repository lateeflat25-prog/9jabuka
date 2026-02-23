// pages/reservation-catering.js
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MapPin, Phone, Mail, Calendar, Users, Clock, Menu, X } from 'lucide-react';
import Link from 'next/link';

// Placeholder images (replace with actual URLs hosted on your server or CDN)
const CATERING_IMAGES = [
  '/r1.jpeg', // Party
  'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Event setup
  '/r2.jpeg', // Party
];

const ReservationCateringPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [cateringSuccess, setCateringSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Form hooks for reservation and catering
  const reservationForm = useForm();
  const cateringForm = useForm();

  // Placeholder API functions (replace with actual backend endpoints)
  const submitReservation = async (data) => {
    try {
      console.log('Reservation Data:', data);
      return { message: 'Reservation request submitted successfully!' };
    } catch (err) {
      throw new Error('Failed to submit reservation');
    }
  };

  const submitCatering = async (data) => {
    try {
      console.log('Catering Data:', data);
      return { message: 'Catering request submitted successfully!' };
    } catch (err) {
      throw new Error('Failed to submit catering request');
    }
  };

  // Handle form submissions
  const onReservationSubmitქSubmit = async (data) => {
    try {
      const response = await submitReservation(data);
      setReservationSuccess(response);
      setError(null);
      reservationForm.reset();
    } catch (err) {
      setError(err.message);
      setReservationSuccess(null);
    }
  };

  const onCateringSubmit = async (data) => {
    try {
      const response = await submitCatering(data);
      setCateringSuccess(response);
      setError(null);
      cateringForm.reset();
    } catch (err) {
      setError(err.message);
      setCateringSuccess(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="absolute  inset-0 bg-[url('/bg2.jpg')] lg:bg-[url('/bg.jpg')] fixed bg-cover bg-center bg-black/50"></div> 
          <div className="relative z-10">


      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
                <Link href="https://9jabukarestaurant.com">
                <div>
                 <img src="/9ja.png" alt="9jabuka Logo" className="h-8 w-auto" />
                </div>
                </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
         <a href="#menu" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Menu</a>
                <a href="/pages/catering" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Reservation and catering</a>
                <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
            </nav>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <nav className="flex flex-col space-y-2">
                                <a href="https://9jabukarestaurant.com" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Home</a>

                <a href="#menu" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Menu</a>
                <a href="/pages/catering" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Reservation and catering</a>
                <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Success/Error Message */}
      <AnimatePresence>
        {(reservationSuccess || cateringSuccess || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-99 max-w-md w-full mx-4"
          >
            <div className={`p-4 rounded-lg shadow-lg ${
              reservationSuccess || cateringSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                {reservationSuccess || cateringSuccess ? (
                  <XCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${reservationSuccess || cateringSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {reservationSuccess ? 'Reservation Success' : cateringSuccess ? 'Catering Request Success' : 'Error'}
                  </p>
                  <p className={`text-sm ${reservationSuccess || cateringSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {reservationSuccess?.message || cateringSuccess?.message || error}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setReservationSuccess(null);
                    setCateringSuccess(null);
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className=" z-99">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
         
 <div>
              <img src="/9ja.png" alt=''/>
            </div>
         

          {/* Catering Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 text-green-600 mr-2" />
                Catering Services
              </h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h4 className="text-3xl font-bold text-gray-900 mb-4">Have an Event Coming Up?</h4>
                <p className="text-lg text-gray-600 mb-4">
                  At 9jabuka, we offer full-service catering for all your events, from intimate gatherings to grand celebrations. Whether it’s a corporate event, wedding, birthday, or any special occasion, our team is dedicated to delighting your guests with freshly made, authentic Nigerian cuisine. Pamper everyone’s taste buds with our vibrant flavors and customizable menus tailored to your needs.
                </p>
                <p className="text-gray-600">
                  Let us bring the rich taste of Nigeria to your event. Fill out the form below, and our team will work with you to create a memorable culinary experience.
                </p>
              </motion.div>

              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8"
              >
                {CATERING_IMAGES.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-lg shadow-md"
                  >
                    <img
                      src={image}
                      alt={`Catering Image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                     
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Catering Form */}
              <form onSubmit={cateringForm.handleSubmit(onCateringSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      {...cateringForm.register('name', { required: 'Full name is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                    {cateringForm.formState.errors.name && (
                      <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.name.message}</p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...cateringForm.register('phone', { required: 'Phone number is required' })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    {cateringForm.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.phone.message}</p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        {...cateringForm.register('email', { required: 'Email is required' })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    {cateringForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.email.message}</p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <input
                      type="date"
                      {...cateringForm.register('eventDate', { required: 'Event date is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {cateringForm.formState.errors.eventDate && (
                      <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.eventDate.message}</p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        placeholder="Number of guests"
                        {...cateringForm.register('guests', {
                          required: 'Number of guests is required',
                          min: { value: 10, message: 'Minimum 10 guests for catering' },
                        })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                    {cateringForm.formState.errors.guests && (
                      <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.guests.message}</p>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      {...cateringForm.register('eventType', { required: 'Event type is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select event type</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="other">Other</option>
                    </select>
                    {cateringForm.formState.errors.eventType && (
                      <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.eventType.message}</p>
                    )}
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Details</label>
                  <textarea
                    placeholder="Tell us about your event (menu preferences, special requests, etc.)"
                    {...cateringForm.register('details', { required: 'Event details are required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    rows="6"
                  />
                  {cateringForm.formState.errors.details && (
                    <p className="text-red-500 text-xs mt-1">{cateringForm.formState.errors.details.message}</p>
                  )}
                </motion.div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 shadow-sm"
                >
                  Submit Catering Request
                </motion.button>
              </form>
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            id="contact"
            className="mb-16"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-6 h-6 text-green-600 mr-2" />
                Contact Us
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Newark Location</h4>
                  <p className="text-gray-600 mb-2">666 Springfield Ave, Newark, NJ 07103</p>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href="tel:+18622916464" className="hover:text-green-600">(862) 291-6464</a>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Irvington Location</h4>
                  <p className="text-gray-600 mb-2">891-899 Clinton Ave, Irvington, NJ 07111</p>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href="tel:+19737534447" className="hover:text-green-600">(973) 753-4447</a>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">General Inquiries</h4>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:info@9jabukarestaurant.com" className="hover:text-green-600">9jabuka00@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   <div className="col-span-1 md:col-span-2">
                     <div className="flex items-center space-x-3 mb-4">
                       <div >
      <div>
                      <img src="/9ja.png" alt="9jabuka Logo" className="h-8 w-auto" />
                     </div>                  </div>
                      
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
  );
};

export default ReservationCateringPage;