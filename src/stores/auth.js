import { defineStore } from 'pinia';
import api from '../lib/axios'; // Your axios instance

export const useAuthStore = defineStore('auth', {
    state: () => ({
        authUser: null,
        errors: {}
    },
    {
        persist: true,
    }),
    getters: {
        user: (state) => state.authUser,
        isAuthenticated: (state) => !!state.authUser // Returns true if user exists
    },
    actions: {
        async getUser() {
            try {
                const response = await api.get('/api/user');
                this.authUser = response.data;
            } catch (error) {
                this.authUser = null;
            }
        },
        async register(userData) {
            this.errors = {}; // Reset errors
            try {
                // 1. Get CSRF cookie first (Sanctum requirement)
                await api.get('/sanctum/csrf-cookie');

                // 2. Post registration data
                await api.post('/api/register', userData);

                // 3. Fetch the new user
                await this.getUser();
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    this.errors = error.response.data.errors;
                }
                throw error;
            }
        },
        // Login action
        async login(email, password) {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/login', { email, password });
            await this.getUser(); // Fetch user data after login
        },
        // Logout action
        async logout() {
            try {
                // 1. Call Laravel API (Server tries to delete HttpOnly cookies)
                await api.post('/api/logout');
            } catch (error) {
                console.error('API Logout failed, clearing local state anyway', error);
            } finally {
                // 2. Clear local state
                this.authUser = null;
                localStorage.clear();
                sessionStorage.clear();

                // 3. FORCE DELETE THE COOKIE
                // This sets the cookie expiration to the past, effectively removing it
                document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                // Optional: If you use a 'laravel_session' check and it's not HttpOnly
                // document.cookie = "laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }
    }
});
