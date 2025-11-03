export const API_BASE_URL = "http://localhost:8080";

const getAuthHeaders = (token, contentType = 'application/json') => {
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const createCart = async (token = null) => { // <-- EXPORT ADDED
  const res = await fetch(`${API_BASE_URL}/carts`, {
    method: "POST",
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) throw new Error("Failed to create cart");
  return await res.json();
};

export const getCart = async (cartId, token = null) => { // <-- EXPORT ADDED
  const res = await fetch(`${API_BASE_URL}/carts/${cartId}`, {
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return await res.json();
};

export const getCartItemCount = async (cartId, token = null) => { // <-- EXPORT ADDED
  try {
    const cart = await getCart(cartId, token);
    return cart.items ? cart.items.length : 0;
  } catch (e) {
    return 0;
  }
};

export const addToCart = async (cartId, productId, quantity = 1, token = null) => { // <-- EXPORT ADDED
  const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return await res.json();
};

export const updateCartItem = async (cartId, productId, quantity, token = null) => { // <-- EXPORT ADDED
  const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return await res.json();
};

export const removeFromCart = async (cartId, productId, token = null) => { // <-- EXPORT ADDED
  const res = await fetch(`${API_BASE_URL}/carts/${cartId}/items/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) throw new Error("Failed to remove cart item");
  return true;
};

export const getWishlist = async (token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to fetch wishlist");
  const res = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized: Please login.");
    throw new Error(`Failed to fetch wishlist.`);
  }
  return await res.json();
};

export const addToWishlist = async (productId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to add to wishlist");
  const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: "POST",
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) {
    if (res.status === 409) throw new Error("Product is already in your wishlist.");
    if (res.status === 401) throw new Error("Unauthorized: Please login.");
    throw new Error(`Failed to add to wishlist.`);
  }
  return await res.json();
};

export const removeFromWishlist = async (productId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to remove wishlist item");
  const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Item not found in wishlist.");
    if (res.status === 401) throw new Error("Unauthorized: Please login.");
    throw new Error(`Failed to remove wishlist item.`);
  }
  return true;
};


export const getAllOrders = async (token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to fetch orders");
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized: Please login.");
    throw new Error(`Failed to fetch orders. Status: ${res.status}`);
  }
  return await res.json();
};

export const getOrderDetails = async (orderId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to view order details");
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders(token, null),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized: Please login.");
    if (res.status === 404) throw new Error("Order not found.");
    if (res.status === 403) throw new Error("Access denied to this order.");
    throw new Error(`Failed to fetch order. Status: ${res.status}`);
  }
  return await res.json();
};

export const initiateCheckout = async (cartId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to checkout");
  if (!cartId) throw new Error("Cart ID is missing");

  const res = await fetch(`${API_BASE_URL}/checkout`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ cartId }),
  });
  if (!res.ok) {
    throw new Error(`Checkout failed. Status: ${res.status}`);
  }
  return await res.json();
};


export const getAllCategories = async () => { // <-- EXPORT ADDED
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories. (Check backend controller/security)");
  return await res.json();
};

export const getProductsByCategory = async (categoryId) => { // <-- EXPORT ADDED
    let url = `${API_BASE_URL}/products`;
    if (categoryId) {
        url += `?categoryId=${categoryId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch products for category ${categoryId || 'all'}.`);
    return await res.json();
};

export const searchProducts = async (query) => {
  const res = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Failed to search for: ${query}`);
  return await res.json();
};
