import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: [],       // List of student projects
        loading: false,
        error: null
    }),

    getters: {
        userProjects: (state) => state.projects,
        projectCount: (state) => state.projects.length,
        isLoading: (state) => state.loading
    },

    actions: {
        async fetchUserProjects() {
            this.loading = true;
            this.error = null;
            try {
                // Endpoint convention based on your previous 'student/skills'
                const response = await api.get('/api/student/projects');
                this.projects = response.data.data || response.data;
            } catch (error) {
                console.error('Failed to fetch projects', error);
                this.error = 'Could not load projects';
                // Fallback empty array to prevent UI breaks
                this.projects = [];
            } finally {
                this.loading = false;
            }
        },

        async createProject(projectData) {
            this.loading = true;
            try {
                const response = await api.post('/api/student/projects', projectData);
                this.projects.push(response.data.data || response.data);
                return response.data;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateProject(id, payload) {
            this.loading = true;
            try {
                const response = await api.put(`/api/student/projects/${id}`, payload);
                const updatedProject = response.data.data || response.data;

                const index = this.projects.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.projects[index] = updatedProject;
                }
                return updatedProject;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteProject(id) {
            this.loading = true;
            try {
                await api.delete(`/api/student/projects/${id}`);
                this.projects = this.projects.filter(p => p.id !== id);
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
