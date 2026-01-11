// src/stores/skill.js
import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useSkillStore = defineStore('skill', {
    state: () => ({
        skills: [],          // Global system skills (Admin view / Dropdown options)
        userSkills: [],      // Authenticated user's specific skills (Student view)
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
        verifiedUserSkills: (state) => state.userSkills.filter(s => s.verified),
        /**
         * AGGREGATION LOGIC:
         * 1. Extract Domains from System Skills.
         * 2. Map User Skills to these Domains using ID.
         * 3. Calculate Average Proficiency per Domain.
         */
        getDomainAggregates: (state) => {
            // A. Get all unique domains from the System Skills table
            const systemDomains = {};
            state.skills.forEach(skill => {
                const domain = skill.category || skill.domain || 'Uncategorized';
                if (!systemDomains[domain]) {
                    systemDomains[domain] = { total: 0, count: 0, label: domain };
                }
            });

            // B. Aggregate User Data into these domains
            state.userSkills.forEach(userSkill => {
                // Find the corresponding system skill to get the correct Domain
                // Handle cases where userSkill.skill might be nested or just an ID
                const skillId = userSkill.skill_id || userSkill.id;
                const systemSkill = state.skills.find(s => s.id === skillId);

                if (systemSkill) {
                    const domain = systemSkill.category || systemSkill.domain || 'Uncategorized';
                    const proficiency = parseInt(userSkill.proficiency || userSkill.pivot?.proficiency || 0);

                    if (systemDomains[domain]) {
                        systemDomains[domain].total += proficiency;
                        systemDomains[domain].count += 1;
                    }
                }
            });

            // C. Format for Chart (Label + Average Score)
            return Object.values(systemDomains).map(d => ({
                domain: d.label,
                score: d.count > 0 ? Math.round(d.total / d.count) : 0,
                skillCount: d.count // Useful if you want to show "5 skills" in tooltip
            })).sort((a, b) => a.domain.localeCompare(b.domain));
        }
    },

    actions: {
        // =========================================================================
        // 1. GLOBAL SYSTEM SKILLS (Admin / General Listing)
        // =========================================================================

        async fetchSkills() {
            this.loading = true;
            try {
                const response = await api.get('/api/skills');
                this.skills = response.data.data || response.data;
            } catch (error) {
                console.error('Failed to fetch system skills:', error);
            } finally {
                this.loading = false;
            }
        },

        // Fetch the current user's skill matrix
        async fetchUserMatrix() {
            this.loading = true;
            try {
                const response = await api.get('/api/student/skills');
                this.userSkills = response.data.data || response.data;
            } catch (error) {
                console.error('Failed to fetch user matrix:', error);
            } finally {
                this.loading = false;
            }
        },

        async createSkill(data) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await api.post('/api/skills', data);
                // Push new system skill to local list
                this.skills.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

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

        // =========================================================================
        // 2. STUDENT SPECIFIC (User Matrix)
        // =========================================================================

        async fetchUserMatrix() {
            this.loading = true;
            try {
                const response = await api.get('/api/student/skills');
                // Controller returns flat objects with 'proficiency' and 'verified' merged in
                this.userSkills = response.data.data || response.data;
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Attach or Update a skill for the user.
         * * @param {Number|String} skillId - The ID of the existing skill OR 'new' if creating custom
         * @param {Object} data - { proficiency: 50, name: "Custom Name" (if new), domain: "..." }
         */
        async updateUserSkill(skillId, data) {
            this.loading = true;
            this.errors = {};
            try {
                // Controller Logic:
                // 1. If numeric ID provided -> Finds Skill -> Attaches/Updates Pivot
                // 2. If 'new' (or non-numeric) provided -> Checks 'name' in body -> Creates Skill -> Attaches Pivot

                const targetId = (skillId && skillId !== 'new') ? skillId : 'new';

                // Ensure default proficiency if missing (Controller requires it)
                const payload = {
                    proficiency: 1, // Default to 1% if not specified
                    ...data
                };

                const response = await api.post(`/api/student/skills/${targetId}`, payload);
                const updatedEntry = response.data.data || response.data;

                // Update local userSkills state
                // Check if we are updating an existing entry in the user's matrix
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

        async removeUserSkill(skillId) {
            this.loading = true;
            try {
                await api.delete(`/api/student/skills/${skillId}`);
                // Remove from local userSkills array
                this.userSkills = this.userSkills.filter(s => s.id !== skillId);
            } catch (error) {
                this.handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // =========================================================================
        // 3. ANALYTICS & UTILS
        // =========================================================================

        async fetchSkillStats() {
            try {
                const response = await api.get('/api/skills/stats');
                this.stats = response.data;
            } catch (error) {
                console.error('Failed to load skill stats', error);
            }
        },

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
