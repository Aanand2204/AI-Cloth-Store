// Barrel re-export: keeps existing `from '../services/api_v2.js'` imports
// working while the actual implementations live in services/api/*.js, split
// by domain (auth, products, cart, orders, chat).
export * from './api/common.js';
export * from './api/auth.js';
export * from './api/products.js';
export * from './api/cart.js';
export * from './api/orders.js';
export * from './api/chat.js';
