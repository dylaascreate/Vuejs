import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useCareerStore = defineStore('career', {
    state: () => ({
        // --- Admin / Management State ---
        careers: [],

        // --- Student / Recommendation State ---
        recommendations: [],
        globalAdvice: null,

        // --- Common State ---
        loading: false,
        error: null,      // General connection/system errors
        validationErrors: {} // Field-specific validation errors (Laravel 422)
    }),

    getters: {
        // Admin Getters
        allCareers: (state) => state.careers,

        // Student Getters
        hasRecommendations: (state) => state.recommendations.length > 0,
        getAdvice: (state) => state.globalAdvice || "Expand your skill graph to generate insights.",

        // Common
        isLoading: (state) => state.loading,
        getErrors: (state) => state.validationErrors
    },

    actions: {
        // =========================================
        //  STUDENT: Recommendations & Advice
        // =========================================
        async fetchRecommendations(userSkills) {
            this.loading = true;
            this.error = null;
            this.recommendations = [];
            this.globalAdvice = null;

            try {
                const skillsPayload = userSkills.map(s => ({
                    name: s.name || s.skill?.name
                }));

                const response = await api.post('/api/careers/recommend', {
                    skills: skillsPayload
                });

                if (response.data && response.data.data) {
                    const data = response.data.data;

                    // 1. Map Recommendations
                    if (data.recommendations) {
                        this.recommendations = data.recommendations.map((rec, index) => ({
                            id: index + 1,
                            title: rec.career_title,
                            matchPercentage: parseInt(rec.compatibility_score) || 0,
                            description: rec.reasoning,
                            topSkills: rec.matched_skills,
                            missingSkills: rec.missing_skills
                        }));
                    }

                    // 2. Map Global Advice
                    if (data.global_advice) {
                        this.globalAdvice = data.global_advice;
                    }
                }
            } catch (err) {
                console.error("Career Store Error:", err);
                this.error = err;
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // =========================================
        //  ADMIN: Career Management (CRUD)
        // =========================================

        // Fetch all careers (Table View)
        async fetchCareers() {
            this.loading = true;
            try {
                const response = await api.get('/api/careers');
                this.careers = response.data.data || response.data;
                this.validationErrors = {};
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // Create a new career
        async createCareer(data) {
            this.loading = true;
            this.validationErrors = {};
            try {
                const response = await api.post('/api/careers', data);
                this.careers.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Update existing career
        async updateCareer(id, data) {
            this.loading = true;
            this.validationErrors = {};
            try {
                // Note: Ensure your Laravel route supports PUT/PATCH at /api/careers/{id}
                const response = await api.put(`/api/careers/${id}`, data);
                const updatedCareer = response.data.data || response.data;

                const index = this.careers.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.careers[index] = updatedCareer;
                }
                return updatedCareer;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete single career
        async deleteCareer(id) {
            this.loading = true;
            try {
                await api.delete(`/api/careers/${id}`);
                this.careers = this.careers.filter(c => c.id !== id);
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Bulk delete careers
        async deleteCareers(ids) {
            this.loading = true;
            try {
                // Adjust endpoint based on your backend implementation (e.g., POST to /batch-delete)
                // If backend doesn't support batch, you might loop promises here.
                await api.post('/api/careers/batch-delete', { ids });
                this.careers = this.careers.filter(c => !ids.includes(c.id));
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
            this.error = error;
            if (error.response && error.response.status === 422) {
                this.validationErrors = error.response.data.errors;
            } else {
                this.validationErrors = { general: ['An unexpected error occurred.'] };
                console.error('Career Store API Error:', error);
            }
        }
    }
});
