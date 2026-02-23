// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'https://9jabukabackend-inky.vercel.app/api',
// });

// export const uploadFood = async (formData) => {
//   const response = await api.post('/foods/upload', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// export const getOrders = async () => {
//   const response = await api.get('/orders');
//   return response.data;
// };

// export const updateOrderStatus = async (referenceNumber, status) => {
//   const response = await api.patch(`/orders/${referenceNumber}`, { status });
//   return response.data;
// };

// export const getFoods = async () => {
//   const response = await api.get('/foods');
//   return response.data;
// };

// export const getFoodById = async (id) => {
//   const response = await api.get(`/foods/${id}`);
//   return response.data;
// };

// export const updateFood = async (id, formData) => {
//   const response = await api.put(`/foods/${id}`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// export const deleteFood = async (id) => {
//   const response = await api.delete(`/foods/${id}`);
//   return response.data;
// };

// export const placeOrder = async (orderData) => {
//   const response = await api.post('/orders/place', orderData);
//   return response.data;
// };

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://9jabukabackend-inky.vercel.app/api',
});

// Transform cart data to match backend expectations
const transformOrderData = (cartItems, customerInfo) => {
  return {
    items: cartItems.map(item => ({
      food: item.foodId, // Backend expects 'food' not 'foodId'
      quantity: item.quantity,
    })),
    mobileNumber: customerInfo.phone, // Extract phone from customerInfo
    deliveryLocation: `${customerInfo.streetAddress}, ${customerInfo.city}, ${customerInfo.zipCode}`, // Combine address fields
  };
};

// Food Management
export const uploadFood = async (formData) => {
  const response = await api.post('/foods/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getFoods = async () => {
  const response = await api.get('/foods');
  return response.data;
};

export const getFoodById = async (id) => {
  const response = await api.get(`/foods/${id}`);
  return response.data;
};

export const updateFood = async (id, formData) => {
  const response = await api.put(`/foods/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteFood = async (id) => {
  const response = await api.delete(`/foods/${id}`);
  return response.data;
};

// Order Management
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const placeOrder = async (orderData) => {
  const response = await api.post('/orders/place', orderData);
  return response.data;
};

export const trackOrder = async (referenceNumber) => {
  const response = await api.get(`/orders/track/${referenceNumber}`);
  return response.data;
};

// FIXED: Update order status by reference number
export const updateOrderStatus = async (referenceNumber, status) => {
  try {
    // Step 1: Get the full order by reference number to retrieve its MongoDB _id
    const order = await trackOrder(referenceNumber);
    
    if (!order || !order._id) {
      throw new Error('Order not found');
    }
    
    // Step 2: Map frontend status names to backend expected values
    const statusMap = {
      'confirmed': 'accepted',
      'cancelled': 'rejected',
      'pending': 'pending'
    };
    
    const backendStatus = statusMap[status] || status;
    
    // Step 3: Update using the MongoDB _id (not reference number)
    const response = await api.patch(`/orders/${order._id}`, { 
      status: backendStatus 
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Stripe Checkout - with data transformation
export const createCheckoutSession = async (cartItems, customerInfo) => {
  try {
    // Transform the data to match backend expectations
    const transformedData = transformOrderData(cartItems, customerInfo);
    const response = await api.post('/orders/create-checkout-session', transformedData);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error.response?.data || error);
    throw error;
  }
};

export const verifyPayment = async (sessionId) => {
  const response = await api.post('/orders/verify-payment', { sessionId });
  return response.data;
};

export default api;