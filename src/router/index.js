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

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 1. Restore session if needed
    if (!authStore.user && to.meta.requiresAuth) {
         await authStore.getUser();
    }

    // 2. Logic Chain
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Case A: User needs to login
        next({ name: 'login' }); // (Must be lowercase)

    } else if (to.meta.guest && authStore.isAuthenticated) {
        // Case B: User is already logged in, kick them out of login page
        next({ name: 'dashboard' }); // (Must be lowercase)

    } else {
        // Case C: Proceed as normal
        next(); 
    }
});

export default router
