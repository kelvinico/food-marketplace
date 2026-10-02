function getCart() {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : { vendorId: null, items: [] };
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();

  if (cart.vendorId && cart.vendorId !== product.vendor_id) {
    const confirmSwitch = window.confirm(
      'Your cart has items from a different vendor. Start a new cart with this item?'
    );
    if (!confirmSwitch) return getCart();
    cart.items = [];
  }

  cart.vendorId = product.vendor_id;

  const existing = cart.items.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
    });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.productId !== productId);
  if (cart.items.length === 0) cart.vendorId = null;
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.items.find((i) => i.productId === productId);
  if (item) item.quantity = Math.max(1, quantity);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  const empty = { vendorId: null, items: [] };
  saveCart(empty);
  return empty;
}

export function getCartTotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export { getCart };