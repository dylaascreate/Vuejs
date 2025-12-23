import { defineStore } from 'pinia';
import api from '../lib/axios'; // Your axios instance

export const useAuthStore = defineStore('auth', {
    state: () => ({
        authUser: null
    }),
    getters: {
        user: (state) => state.authUser,
        isAuthenticated: (state) => !!state.authUser // Returns true if user exists
    },
    actions: {
        // Fetch user (used on page refresh to restore session)
        async getUser() {
            try {
                const response = await api.get('/api/user');
                this.authUser = response.data;
            } catch (error) {
                this.authUser = null;
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
            await api.post('/api/logout');
            this.authUser = null;
        }
    }
});