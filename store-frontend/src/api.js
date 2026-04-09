export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const clearAuthState = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  window.dispatchEvent(new CustomEvent("auth:expired"));
};

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

const extractErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data?.error) {
      return data.error;
    }

    if (data?.message) {
      return data.message;
    }

    if (data && typeof data === 'object') {
      const validationMessages = Object.values(data).filter(
        (value) => typeof value === 'string' && value.trim()
      );

      if (validationMessages.length > 0) {
        return validationMessages.join(', ');
      }
    }
  } catch (error) {
    // Fall back to the default message when the response body is empty or not JSON.
  }

  return fallbackMessage;
};

const requestJson = async (url, options = {}, fallbackMessage = 'Request failed') => {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthState();
    }
    throw new Error(await extractErrorMessage(response, fallbackMessage));
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
};

export const createCart = async (token = null) => { // <-- EXPORT ADDED
  return requestJson(`${API_BASE_URL}/carts`, {
    method: "POST",
    headers: getAuthHeaders(token, null),
  }, "Failed to create cart");
};

export const getCart = async (cartId, token = null) => { // <-- EXPORT ADDED
  return requestJson(`${API_BASE_URL}/carts/${cartId}`, {
    headers: getAuthHeaders(token, null),
  }, "Failed to fetch cart");
};

export const getCartItemCount = async (cartId, token = null) => { // <-- EXPORT ADDED
  try {
    const cart = await getCart(cartId, token);
    return cart.items
      ? cart.items.reduce((total, item) => total + (item.quantity || 0), 0)
      : 0;
  } catch (e) {
    return 0;
  }
};

export const addToCart = async (cartId, productId, quantity = 1, token = null) => { // <-- EXPORT ADDED
  return requestJson(`${API_BASE_URL}/carts/${cartId}/items`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ productId, quantity }),
  }, "Failed to add to cart");
};

export const updateCartItem = async (cartId, productId, quantity, token = null) => { // <-- EXPORT ADDED
  return requestJson(`${API_BASE_URL}/carts/${cartId}/items/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ quantity }),
  }, "Failed to update cart item");
};

export const removeFromCart = async (cartId, productId, token = null) => { // <-- EXPORT ADDED
  await requestJson(`${API_BASE_URL}/carts/${cartId}/items/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token, null),
  }, "Failed to remove cart item");
  return true;
};

export const getWishlist = async (token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to fetch wishlist");
  return requestJson(`${API_BASE_URL}/wishlist`, {
    headers: getAuthHeaders(token, null),
  }, "Failed to fetch wishlist.");
};

export const addToWishlist = async (productId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to add to wishlist");
  return requestJson(`${API_BASE_URL}/wishlist/${productId}`, {
    method: "POST",
    headers: getAuthHeaders(token, null),
  }, "Failed to add to wishlist.");
};

export const removeFromWishlist = async (productId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to remove wishlist item");
  await requestJson(`${API_BASE_URL}/wishlist/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token, null),
  }, "Failed to remove wishlist item.");
  return true;
};


export const getAllOrders = async (token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to fetch orders");
  return requestJson(`${API_BASE_URL}/orders`, {
    headers: getAuthHeaders(token, null),
  }, "Failed to fetch orders.");
};

export const getOrderDetails = async (orderId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to view order details");
  return requestJson(`${API_BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders(token, null),
  }, "Failed to fetch order.");
};

export const initiateCheckout = async (cartId, token) => { // <-- EXPORT ADDED
  if (!token) throw new Error("Login required to checkout");
  if (!cartId) throw new Error("Cart ID is missing");

  return requestJson(`${API_BASE_URL}/checkout`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ cartId }),
  }, "Checkout failed.");
};


export const getAllCategories = async () => { // <-- EXPORT ADDED
  return requestJson(`${API_BASE_URL}/categories`, {}, "Failed to fetch categories.");
};

export const getProductsByCategory = async (categoryId) => { // <-- EXPORT ADDED
    let url = `${API_BASE_URL}/products`;
    if (categoryId) {
        url += `?categoryId=${categoryId}`;
    }
    return requestJson(url, {}, `Failed to fetch products for category ${categoryId || 'all'}.`);
};

export const searchProducts = async (query) => {
  return requestJson(
    `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
    {},
    `Failed to search for: ${query}`
  );
};
