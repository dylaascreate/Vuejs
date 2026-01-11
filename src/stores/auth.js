import { defineStore } from 'pinia';
import api from '../lib/axios'; // Your axios instance

export const useAuthStore = defineStore('auth', {
    state: () => ({
        authUser: null,
        errors: {}
    }),
    persist: true,
    getters: {
        user: (state) => state.authUser,
        isAuthenticated: (state) => !!state.authUser, // Returns true if user exists
        getErrors: (state) => state.errors
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
            this.errors = {};
            try {
                await api.get('/sanctum/csrf-cookie');
                await api.post('/api/login', { email, password });
                await this.getUser(); // Fetch user data after login
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    this.errors = error.response.data.errors;
                }
                throw error;
            }
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
                document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        },
        // Update Profile Action
        async updateProfile(profileData) {
            this.errors = {};
            try {
                // Using POST for FormData (file uploads) often works best with Laravel if _method is set to PUT
                // or if the endpoint is defined as POST. Assuming a standard update endpoint here.
                // If passing FormData, ensure the API endpoint accepts it.
                await api.post('/api/user/profile-information', profileData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                await this.getUser(); // Refresh user data
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    this.errors = error.response.data.errors;
                }
                throw error;
            }
        },
        // Update Password Action
        async updatePassword(passwordData) {
            this.errors = {};
            try {
                await api.put('/api/user/password', passwordData);
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    this.errors = error.response.data.errors;
                }
                throw error;
            }
        },
        async deleteAccount(password) {
            this.errors = {};
            try {
                // Usually requires password confirmation
                await api.post('/api/user/confirm-password', { password });
                // Then delete
                await api.delete('/api/user'); // Ensure your API supports DELETE /api/user

                // Cleanup local state
                this.authUser = null;
                localStorage.clear();
                sessionStorage.clear();
                document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            } catch (error) {
                if (error.response && error.response.data.errors) {
                     this.errors = error.response.data.errors;
                } else {
                     // Generic error or password mismatch
                     this.errors = { password: ['Unable to delete account. Please check your password.'] };
                }
                throw error;
            }
        }
    }
});
