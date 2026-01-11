import { defineStore } from 'pinia';
import api from '../lib/axios';
import { useAuthStore } from './auth';

export const useUserStore = defineStore('user', {
    state: () => ({
        // --- Personal Profile State ---
        stats: {
            roadmaps: 0,
            skills: 0,
            projects: 0
        },

        // --- Admin / Directory State ---
        users: [], // Stores the list of all users for Admin views

        // --- Common State ---
        loading: false,
        error: null
    }),

    getters: {
        // Personal Getters
        userStats: (state) => state.stats,

        // Admin / Directory Getters
        allUsers: (state) => state.users,
        getUserById: (state) => (id) => state.users.find(u => u.id === id),

        // Common
        isLoading: (state) => state.loading,
        getError: (state) => state.error
    },

    actions: {
        // =========================================
        //  PERSONAL PROFILE ACTIONS
        // =========================================

        /**
         * Fetch aggregated stats for the user profile
         */
        async fetchUserStats() {
            this.loading = true;
            try {
                const response = await api.get('/api/user/stats');
                this.stats = response.data;
            } catch (error) {
                console.error('Failed to fetch user stats', error);
                this.stats = { roadmaps: 0, skills: 0, projects: 0 };
            } finally {
                this.loading = false;
            }
        },

        /**
         * Update basic profile information
         */
        async updateProfile(formData) {
            this.loading = true;
            this.error = null;
            try {
                // [FIX] Changed from .put() to .post() to support FormData/File Uploads
                const response = await api.post('/api/user/profile', formData);

                // Refresh the Auth Store so the UI (TopBar, etc) updates immediately
                const authStore = useAuthStore();
                await authStore.getUser();

                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Change User Password
         */
        async updatePassword(passwordData) {
            this.loading = true;
            this.error = null;
            try {
                await api.put('/api/user/password', passwordData);
                return true;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // =========================================
        //  ADMIN MANAGEMENT ACTIONS (Directory)
        // =========================================

        /**
         * Fetch ALL users
         */
        async fetchUsers() {
            this.loading = true;
            try {
                const response = await api.get('/api/users');
                this.users = response.data.data || response.data;
                this.error = null;
            } catch (error) {
                console.error('User Store (Admin) Error:', error);
                this.error = error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetch Single User (Useful for Detail Views)
         * [ADDED] - Missing in original code
         */
        async fetchUser(id) {
            this.loading = true;
            try {
                const response = await api.get(`/api/users/${id}`);
                return response.data.data || response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Create a new user (Admin)
         */
        async createUser(userData) {
            this.loading = true;
            try {
                const response = await api.post('/api/users', userData);
                this.users.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Update a specific user by ID (Admin)
         */
        async updateUser(id, userData) {
            this.loading = true;
            try {
                const response = await api.put(`/api/users/${id}`, userData);
                const updated = response.data.data || response.data;

                const index = this.users.findIndex(u => u.id === id);
                if (index !== -1) this.users[index] = updated;

                return updated;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Delete a user (Admin)
         */
        async deleteUser(id) {
            this.loading = true;
            try {
                await api.delete(`/api/users/${id}`);
                this.users = this.users.filter(u => u.id !== id);
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Bulk Delete Users (Admin)
         * [ADDED] - Missing in original code, required for 'Delete Selected' features
         */
        async deleteUsers(ids) {
            this.loading = true;
            try {
                // Adjust endpoint based on backend capability
                await api.post('/api/users/batch-delete', { ids });
                this.users = this.users.filter(u => !ids.includes(u.id));
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // =========================================
        //  HELPERS
        // =========================================
        handleError(error) {
            if (error.response && error.response.status === 422) {
                this.error = error.response.data.errors;
            } else {
                this.error = error.message || 'An unexpected error occurred.';
            }
        }
    }
});
