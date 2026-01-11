import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useCourseStore = defineStore('course', {
    state: () => ({
        catalog: [],      // All available courses
        userCourses: [],  // Enrolled courses
        loading: false,
        error: null
    }),

    getters: {
        courseCatalog: (state) => state.catalog,
        myCourses: (state) => state.userCourses,
        isLoading: (state) => state.loading
    },

    actions: {
        // --- READ (Shared) ---
        async fetchCatalog() {
            this.loading = true;
            try {
                const response = await api.get('/api/courses');
                this.catalog = response.data.data || response.data;
            } catch (error) {
                console.error('Failed to load catalog', error);
            } finally {
                this.loading = false;
            }
        },

        // --- STUDENT ACTIONS ---
        async fetchUserCourses() {
            this.loading = true;
            try {
                // [FIX] Change this from '/api/courses' to '/api/my-courses'
                // OLD: const response = await api.get('/api/courses');
                const response = await api.get('/api/student/courses');

                this.userCourses = response.data.data || response.data;
            } catch (error) {
                this.userCourses = [];
            } finally {
                this.loading = false;
            }
        },

        async enrollCourse(courseId) {
            this.loading = true;
            try {
                const response = await api.post('/api/student/courses', { course_id: courseId });
                this.userCourses.push(response.data.data || response.data);
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCourseProgress(courseId, payload) {
            this.loading = true;
            try {
                // Student updating their own status/grade
                await api.put(`/api/student/courses/${courseId}`, payload);
                await this.fetchUserCourses(); // Refresh to ensure sync
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // --- ADMIN ACTIONS (NEW) ---

        // Create a new Course in the Database
        async createCourse(courseData) {
            this.loading = true;
            try {
                const response = await api.post('/api/courses', courseData);
                const newCourse = response.data.data || response.data;
                this.catalog.push(newCourse);
                return newCourse;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Update Course Details (Name, Credits, etc.)
        async updateCourse(id, courseData) {
            this.loading = true;
            try {
                const response = await api.put(`/api/courses/${id}`, courseData);
                const updated = response.data.data || response.data;

                // Update local catalog
                const index = this.catalog.findIndex(c => c.id === id);
                if (index !== -1) this.catalog[index] = updated;

                return updated;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete Course from Database
        async deleteCourse(id) {
            this.loading = true;
            try {
                await api.delete(`/api/courses/${id}`);
                this.catalog = this.catalog.filter(c => c.id !== id);
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
