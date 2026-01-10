import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useSkillStore = defineStore('skill', {
    state: () => ({
        skills: [],          // Global system skills (Admin view)
        userSkills: [],      // Authenticated user's specific skills/mastery (Student view)
        activeSkill: null,   // For editing/details
        stats: null,         // For radar charts/widgets
        loading: false,
        errors: {}
    }),

    getters: {
        allSkills: (state) => state.skills,
        mySkillMatrix: (state) => state.userSkills,
        isLoading: (state) => state.loading,
        getErrors: (state) => state.errors,
        // Helper: Filter verified skills for the student
        verifiedUserSkills: (state) => state.userSkills.filter(s => s.verified)
    },

    actions: {
        // --- Global Skills (Admin / System) ---

        // Fetch all available system skills
        async fetchSkills(params = {}) {
            this.loading = true;
            try {
                // Params can handle filtering like ?domain=Frontend
                const response = await api.get('/api/skills', { params });
                this.skills = response.data.data || response.data;
                this.errors = {};
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // Create a new system skill (Admin)
        async createSkill(data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await api.post('/api/skills', data);
                this.skills.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Update a system skill (Admin)
        async updateSkill(id, data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await api.put(`/api/skills/${id}`, data);
                const updatedSkill = response.data.data || response.data;

                // Update in local list
                const index = this.skills.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.skills[index] = updatedSkill;
                }
                return updatedSkill;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete a system skill (Admin)
        async deleteSkill(id) {
            this.loading = true;
            try {
                await api.delete(`/api/skills/${id}`);
                this.skills = this.skills.filter(s => s.id !== id);
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- Student Specific (User Matrix) ---

        // Fetch the current user's skill matrix (with levels/mastery)
        async fetchUserMatrix() {
            this.loading = true;
            try {
                const response = await api.get('/api/student/skills');
                this.userSkills = response.data.data || response.data;
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // Add a skill to the user's profile (or update mastery level)
        async updateUserSkill(skillId, data) {
            this.loading = true;
            this.errors = {};
            try {
                // If skillId is missing or 'new', pass 'new' to backend but ensure data has 'name'
                const targetId = (skillId && skillId !== 'new') ? skillId : 'new';

                const response = await api.post(`/api/student/skills/${targetId}`, data);
                const updatedEntry = response.data.data || response.data;

                // Update local userSkills state
                // Remove old entry if it existed (to avoid duplicates if ID changed from 'new' to '105')
                const index = this.userSkills.findIndex(s => s.id === updatedEntry.id);
                if (index !== -1) {
                    this.userSkills[index] = updatedEntry;
                } else {
                    this.userSkills.push(updatedEntry);
                }
                return updatedEntry;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove a skill from user profile (detach)
        async removeUserSkill(skillId) {
            this.loading = true;
            try {
                await api.delete(`/api/student/skills/${skillId}`);
                this.userSkills = this.userSkills.filter(s => s.id !== skillId && s.skill_id !== skillId);
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- Analytics ---

        // Fetch data for SkillRadarWidget and other charts
        async fetchSkillStats() {
            try {
                const response = await api.get('/api/skills/stats');
                this.stats = response.data;
            } catch (error) {
                console.error('Failed to load skill stats', error);
            }
        },
        // src/stores/roadmap.js
        async addSkillToProfile(skillName) {
            try {
                const response = await api.post('/api/user/skills', {
                    name: skillName,
                    proficiency: 1 // Default to 1%
                });

                // Update local user skills list in the store
                // Assuming you have a userSkills array in your state
                this.userSkills.push(response.data);
                return response.data;
            } catch (error) {
                console.error("Failed to add skill:", error);
                throw error;
            }
        },

        // --- Error Handling ---
        handleError(error) {
            if (error.response && error.response.status === 422) {
                this.errors = error.response.data.errors;
            } else {
                this.errors = { general: ['An unexpected error occurred.'] };
                console.error('Skill Store Error:', error);
            }
        }
    }
});
