import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import Login from '../views/auth/Login.vue'
import Dashboard from '@/views/pages/Dashboard.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path:'/login',
      name:'login',
      component: Login,
      meta: {guest:true},
    },
    
    {
      path:'/dashboard',
      name:'dashboard',
      component: Dashboard,
      meta: {requiresAuth:true},
    }
  ],
})

// 2. The Navigation Guard (The "Bouncer")
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // specific case: If refreshing the page, wait for the user query to finish
    // so we know if the session is actually valid.
    if (!authStore.user && to.meta.requiresAuth) {
         await authStore.getUser();
    }

    // A. If route requires auth and user is NOT logged in -> Login
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'Login' });
    }

    // B. If route is for guests (Login page) and user IS logged in -> Dashboard
    if (to.meta.guest && authStore.isAuthenticated) {
        return next({ name: 'Dashboard' });
    }

    // C. Otherwise, allow navigation
    next();
});

export default router
