import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useRoadmapStore = defineStore('roadmap', {
    state: () => ({
        roadmaps: [],
        activeRoadmap: null, // For details view
        stats: null,         // For dashboard widgets
        loading: false,
        errors: {},

        // --- NEW: Generation UI State ---
        genProgress: 0,
        genStatus: 'Initializing...',
        genError: false,
        _genInterval: null // Internal use only
    }),

    getters: {
        allRoadmaps: (state) => state.roadmaps,
        currentRoadmap: (state) => state.activeRoadmap,
        isLoading: (state) => state.loading,
        getErrors: (state) => state.errors
    },

    actions: {
        // --- Fetch List (e.g., for StudentRoadmapList or Admin tables) ---
        async fetchRoadmaps(params = {}) {
            this.loading = true;
            try {
                // Params can handle filtering like ?status=active or ?type=academic
                const response = await api.get('/api/roadmaps', { params });
                this.roadmaps = response.data.data || response.data;
                this.errors = {};
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // --- Fetch Single Detail (e.g., for RoadmapDetails page) ---
        async fetchRoadmap(id) {
            this.loading = true;
            this.activeRoadmap = null; // Clear previous state
            try {
                const response = await api.get(`/api/roadmaps/${id}`);
                this.activeRoadmap = response.data.data || response.data;
                this.errors = {};
                return this.activeRoadmap;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- Create / Initialize Roadmap (Manual) ---
        async createRoadmap(data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await api.post('/api/roadmaps', data);
                // Add to local state immediately to avoid refetch
                this.roadmaps.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- AI Generation Endpoint (For RoadmapGenerator) ---
        async generateRoadmapAI(promptData) {
            this.loading = true;
            this.errors = {};
            try {
                // Assuming a specific endpoint for AI generation logic
                const response = await api.post('/api/roadmaps/generate', promptData);
                this.roadmaps.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- Update Roadmap (Progress or Details) ---
        async updateRoadmap(id, data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await api.put(`/api/roadmaps/${id}`, data);
                this.activeRoadmap = response.data.data || response.data;

                // Update list item if it exists
                const index = this.roadmaps.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.roadmaps[index] = this.activeRoadmap;
                }
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- Delete Roadmap ---
        async deleteRoadmap(id) {
            this.loading = true;
            try {
                await api.delete(`/api/roadmaps/${id}`);
                this.roadmaps = this.roadmaps.filter(r => r.id !== id);
                if (this.activeRoadmap?.id === id) {
                    this.activeRoadmap = null;
                }
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- Fetch Stats (For Widgets) ---
        async fetchRoadmapStats() {
            try {
                const response = await api.get('/api/roadmaps/stats');
                this.stats = response.data;
            } catch (error) {
                console.error('Failed to load roadmap stats', error);
            }
        },


        async generateRoadmapWithAnimation(payload, config, router, toast) {
            // 1. Reset State
            this.clearGenerationInterval();
            this.genError = false;
            this.genProgress = 0;
            this.genStatus = 'Initializing...';

            try {
                // 2. Start Animation Loop
                this._genInterval = setInterval(() => {
                    if (this.genProgress < 90) {
                        // Slow down as we get closer to 90%
                        const increment = this.genProgress > 60 ? 0.5 : 2;
                        this.genProgress += increment;

                        // Find relevant message from the passed config
                        const currentStep = config.steps.findLast(step => this.genProgress >= step.threshold);
                        if (currentStep) {
                            this.genStatus = currentStep.message;
                        }
                    }
                }, 200);

                // 3. Real API Call
                const response = await api.post('/api/generate-roadmap', payload);

                // 4. Success Handling
                this.clearGenerationInterval();
                this.genProgress = 100;
                this.genStatus = 'GENERATION COMPLETE.';

                // Store the new roadmap immediately
                const newRoadmapData = response.data.data;
                this.activeRoadmap = newRoadmapData;

                // 5. Redirect after short delay
                setTimeout(() => {
                    const isAcademic = payload.type === 'Academic';
                    const targetPath = isAcademic
                        ? `/student/roadmap-details-academic/${newRoadmapData.id}`
                        : `/student/roadmap-details/${newRoadmapData.id}`;

                    router.push(targetPath);
                }, 800);

            } catch (error) {
                // 6. Error Handling
                this.clearGenerationInterval();
                this.genProgress = 0;
                this.genStatus = 'GENERATION FAILED.';
                this.genError = true;

                console.error("Roadmap Generation Error:", error);
                if (toast) {
                    toast.add({ severity: 'error', summary: 'AI Error', detail: 'Failed to generate roadmap. Please try again.', life: 5000 });
                }
            }
        },

        // Helper to clean up interval (called on unmount)
        clearGenerationInterval() {
            if (this._genInterval) {
                clearInterval(this._genInterval);
                this._genInterval = null;
            }
        },
        // --- Centralized Error Handling ---
        handleError(error) {
            if (error.response && error.response.status === 422) {
                // Validation errors from Laravel
                this.errors = error.response.data.errors;
            } else {
                this.errors = { general: ['An unexpected error occurred.'] };
                console.error('Roadmap Store Error:', error);
            }
        }
    }
});
