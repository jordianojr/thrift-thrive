import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../lib/firebaseConfig'; 
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Home from '../views/Home.vue';
import Marketplace from '../views/Marketplace.vue';
import Profile from '../views/Profile.vue';
import Sell from '../views/Sell.vue';
import ThriftMap from '../views/ThriftMap.vue';
import Item from '../views/Item.vue';
import Chat from '../views/Chat.vue';

// Function to check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('user') !== null; // Returns true if user data exists in localStorage
};

// Router setup
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => (isLoggedIn() ? '/home' : '/login')
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: Marketplace,
      meta: { requiresAuth: true },
    },
    {
      path: '/thrift-stores',
      name: 'thrift-stores',
      component: ThriftMap,
      meta: { requiresAuth: true },
    },
    {
      path: '/fashion-blog',
      name: 'fashion-blog',
      component: Marketplace,
      meta: { requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: Marketplace,
      meta: { requiresAuth: true },
    },
    {
      path: '/cart',
      name: 'cart',
      component: Marketplace,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/sell',
      name: 'sell',
      component: Sell,
      meta: { requiresAuth: true },
    },
    {
      path: '/item/:category/:id',
      name: 'item',
      component: Item,
      meta: { requiresAuth: true },
    },
    {
      path: '/chat/:sellerId',
      name: 'Chat',
      component: Chat,
      meta: { requiresAuth: true },
    }
  ]
});

// Navigation guard for routes that require authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const loggedIn = isLoggedIn();

  if (requiresAuth && !loggedIn) {
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.name === 'register') && loggedIn) {
    next({ name: 'home' });
  } else {
    next();
  }
});


// Firebase authentication state listener to manage local storage
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in, store user information in localStorage
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    // User is signed out, remove user information from localStorage
    localStorage.removeItem('user');
  }
});

export default router;

