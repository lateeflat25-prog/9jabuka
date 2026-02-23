"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Home, MapPin, Phone, Mail, Calendar, Users, Clock, Menu, X } from 'lucide-react';


export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("loading");
  const [orderInfo, setOrderInfo] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  useEffect(() => {
    // Read session_id from URL query string (one-time read)
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    const saveOrder = async () => {
      try {
        const response = await fetch(
          "https://9jabukabackend.vercel.app/api/orders/place",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save order");
        }

        const data = await response.json();
        setOrderInfo(data.order || data); // adjust based on your actual response structure
        setStatus("success");
      } catch (error) {
        console.error("Order creation error:", error);
        setStatus("error");
      }
    };

    saveOrder();
  }, []); // ← empty array → runs only once on mount

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 pb-2">
          {status === "loading" && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">
                Processing your order...
              </h2>
              <p className="text-gray-500 mt-2">Please wait a moment</p>
            </div>
          )}

          {status === "success" && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Payment Successful!
                </h1>
                <p className="text-lg text-gray-600">Thank you for your purchase</p>
              </div>

              {orderInfo && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Order Details</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    {orderInfo.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Reference:</span>
                        <span className="font-medium">{orderInfo.referenceNumber}</span>
                      </div>
                    )}

                    {orderInfo.totalAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium">
                          ₦{Number(orderInfo.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date().toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center text-gray-600 mb-8 leading-relaxed">
                <p>We've sent a confirmation to your phone number.</p>
                <p className="mt-1">Track your order anytime using your phone number.</p>
              </div>
            </>
          )}

          {status === "error" && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <span className="text-4xl">!</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't confirm your order right now.<br/>
                Please track it using your phone number.
              </p>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 pt-2 flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl text-center transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/track"
            className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-medium py-4 px-6 rounded-xl text-center transition-colors duration-200"
          >
            Track Order
          </Link>
        </div>

        <div className="bg-gray-50 py-4 px-8 text-center text-xs text-gray-500 border-t">
          Thank you for shopping with us • Questions? Contact support
        </div>
      </div>
    </div>
  );
}