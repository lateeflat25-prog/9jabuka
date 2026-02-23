"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { Home, MapPin, Phone, Mail, Calendar, Users, Clock, Menu, X } from 'lucide-react';

export default function OrderTrackPage() {
  const [mode, setMode] = useState("initial");
  const [mobileNumber, setMobileNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  // Read query params once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const phoneFromUrl = params.get("phone");

    if (phoneFromUrl) {
      setMobileNumber(phoneFromUrl);
    }

    if (sessionId) {
      setMode("loading");
      const finalizeOrder = async () => {
        try {
          const res = await fetch("https://9jabukabackend-inky.vercel.app/api/orders/place", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          if (!res.ok) throw new Error("Failed to finalize order");

          const { order } = await res.json();
          setOrders([order]);
          setMobileNumber(order.mobileNumber || mobileNumber);
          setSelectedOrder(order);
          setMode("success");
        } catch (err) {
          console.error(err);
          setError("Order confirmed but tracking details loading... Try with your phone number.");
          setMode("initial");
        }
      };
      finalizeOrder();
    }
  }, []); // ← empty dependency array → runs once on mount

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setMode("loading");
    setError("");
    setOrders([]);
    setSelectedOrder(null);

    try {
      const params = new URLSearchParams({ mobileNumber: mobileNumber.trim() });
      const res = await fetch(`https://9jabukabackend-inky.vercel.app/api/orders/track-by-phone-only?${params}`);

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "No orders found");

      setOrders(data.orders || []);
      if (data.orders?.length === 1) {
        setSelectedOrder(data.orders[0]);
      }
      setMode("success");
    } catch (err) {
      setError(err.message);
      setMode("error");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${map[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </span>
    );
  };

  return (

  <div className="min-h-screen bg-gray-50 flex flex-col gap-5">
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


 <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white py-8 px-4 sm:px-6 lg:px-8 mt-12">
     

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel - Form / Header */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="p-8 lg:p-10">
                <div className="text-center mb-8">
                  {mode === "success" && orders.length > 0 ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h1 className="text-3xl font-bold text-gray-900">
                        {orders[0]?.mobileNumber === mobileNumber ? "Order Confirmed!" : "Your Orders"}
                      </h1>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Track Your Order
                      </h1>
                      <p className="text-gray-600">
                        Enter your phone number to view recent orders
                      </p>
                    </>
                  )}
                </div>

                {(mode === "initial" || mode === "error") && (
                  <form onSubmit={handleTrack} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="07019312514"
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        We'll show your orders from the last 30 days
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Search size={18} />
                      Find My Orders
                    </button>
                  </form>
                )}

                {mode === "loading" && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading your orders...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Orders & Details */}
          <div className="lg:col-span-7 xl:col-span-8">
            {mode === "success" && orders.length > 0 ? (
              <div className="space-y-6">
                {orders.length > 1 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center text-gray-600">
                    {orders.length} recent orders found • Click to view details
                  </div>
                )}

                <div className="grid gap-5">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-pointer overflow-hidden ${
                        selectedOrder?._id === order._id
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-green-300 hover:shadow-md"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg">#{order.referenceNumber}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleString("en-GB", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ₦{order.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          {order.deliveryLocation}
                        </p>
                      </div>
                    </div>
                  ))}

                  {selectedOrder && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-7">
                      <h2 className="text-2xl font-bold mb-6">Order Details</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-xl font-bold">
                            ₦{selectedOrder.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                          <p className="font-medium">{selectedOrder.deliveryLocation}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg mb-4">Order Items</h3>
                        <div className="space-y-4">
                          {selectedOrder.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-3 border-b last:border-b-0"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.food?.name || "Food Item"} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  ₦{((item.food?.price || 0) * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : mode === "success" && orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  No recent orders found
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any orders for this phone number in the last 30 days.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          Questions? Contact support with your phone number • We'll be happy to help!
        </div>
      </div>
    </div>
    </div>
   
  );
}