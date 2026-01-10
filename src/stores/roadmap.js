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
        // async generateRoadmapAI(promptData) {
        //     this.loading = true;
        //     this.errors = {};
        //     try {
        //         // Assuming a specific endpoint for AI generation logic
        //         const response = await api.post('/api/roadmaps/generate', promptData);
        //         this.roadmaps.push(response.data.data || response.data);
        //         return response.data;
        //     } catch (error) {
        //         this.handleError(error);
        //         throw error;
        //     } finally {
        //         this.loading = false;
        //     }
        // },

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
        // src/stores/roadmap.js
        async updateRoadmapStatus(id, status) {
            try {
                await api.patch(`/api/roadmaps/${id}`, { status: status });

                // Update local state so the UI reacts immediately
                if (this.currentRoadmap && this.currentRoadmap.id === id) {
                    this.currentRoadmap.status = status;
                }
            } catch (error) {
                console.error("Status update failed:", error);
                throw error;
            }
        },
        // src/stores/roadmap.js
        async archiveRoadmap(id) {
            try {
                // Send the status update to Laravel
                const response = await api.patch(`/api/roadmaps/${id}`, {
                    status: 'archived'
                });

                // Update the local state so the UI reflects the change immediately
                if (this.currentRoadmap && this.currentRoadmap.id === id) {
                    this.currentRoadmap.status = 'archived';
                }

                // Update the list as well
                const index = this.allRoadmaps.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.allRoadmaps[index].status = 'archived';
                }
            } catch (error) {
                console.error("Archiving failed:", error);
                throw error;
            }
        },
        // Inside your Roadmap Store actions
        async updateTaskStatus(taskId, completed) {
            const response = await api.patch(`/api/tasks/${taskId}`, {
                completed: completed
            });

            // Update the local progress integer in the store
            if (this.currentRoadmap) {
                this.currentRoadmap.progress = response.data.progress;
            }
        },
        async updateTaskDetails(taskId, payload) {
            // Example: PUT /api/tasks/{taskId}
            const response = await api.put(`/api/tasks/${taskId}`, payload);
            return response.data;
        },
        async addTask(phaseId, payload) {
            // Adjust '/api/tasks' to match your actual Laravel/Backend route
            // Example: POST /api/phases/{phaseId}/tasks
            const response = await api.post(`/api/phases/${phaseId}/tasks`, payload);
            
            // Return the data so the component can push it to the UI
            return response.data; 
        },
        // src/stores/roadmap.js
        async startAndResetRoadmap(id) {
            try {
                // 1. Backend Sync
                await api.post(`/api/roadmaps/${id}/reset`);

                // 2. Local State Update
                if (this.currentRoadmap && this.currentRoadmap.id === id) {
                    this.currentRoadmap.status = 'active'; // Change to active
                    this.currentRoadmap.progress = 0;      // Reset progress column

                    // Set all tasks in all phases to false
                    this.currentRoadmap.phases.forEach(phase => {
                        if (phase.tasks) {
                            phase.tasks.forEach(task => task.completed = false);
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to initialize roadmap:", error);
                throw error;
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
                        const increment = this.genProgress > 60 ? 0.5 : 2;
                        this.genProgress += increment;

                        const currentStep = config.steps.findLast(step => this.genProgress >= step.threshold);
                        if (currentStep) {
                            this.genStatus = currentStep.message;
                        }
                    }
                }, 200);

                // 3. Real API Call
                // FIX: Updated URL to match RoadmapController.php
                const response = await api.post('/api/roadmaps/generate', payload);

                // 4. Success Handling
                this.clearGenerationInterval();
                this.genProgress = 100;
                this.genStatus = 'GENERATION COMPLETE.';

                // Store the new roadmap immediately
                const newRoadmapData = response.data.data;
                this.activeRoadmap = newRoadmapData;

                // 5. Redirect after short delay
                setTimeout(() => {
                    // FIX: Check the DB response and handle Case Sensitivity safely
                    const type = newRoadmapData.type ? newRoadmapData.type.toLowerCase() : 'general';
                    const isAcademic = type === 'academic';

                    const targetPath = isAcademic
                        ? `/student/roadmap-details-academic/${newRoadmapData.id}`
                        : `/student/roadmap-details/${newRoadmapData.id}`;

                    router.push(targetPath);
                }, 800);
                
                // OPTIONAL: Return data in case the component needs it for something else
                return newRoadmapData; 

            } catch (error) {
                // 6. Error Handling
                this.clearGenerationInterval();
                this.genProgress = 0;
                this.genStatus = 'GENERATION FAILED.';
                this.genError = true;

                console.error("Roadmap Generation Error:", error);
                if (toast) {
                    toast.add({ severity: 'error', summary: 'AI Error', detail: 'Failed to generate roadmap.', life: 5000 });
                }
                throw error; // Re-throw so the component knows it failed
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
