<script setup>
import { computed } from 'vue'; // 1. Import computed
import { useAuthStore } from '@/stores/auth'; // 2. Import Store
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

// Helper to check roles easily
const isAdmin = computed(() => authStore.user?.role === 'admin');
const isStudent = computed(() => authStore.user?.role === 'student');

// 3. Change 'ref' to 'computed' so it reacts to login changes
const model = computed(() => [
    // =============================================================================
    // 1. GENERAL / HOME (Visible to everyone)
    // =============================================================================
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'My Profile', icon: 'pi pi-fw pi-user', to: '/profile' }
        ]
    },

    // =============================================================================
    // 2. STUDENT MODULE (Hidden if not Student)
    // =============================================================================
    {
        label: 'Student',
        // visible: isStudent.value, // <--- CONDITION ADDED
        items: [
            { label: 'My Roadmaps', icon: 'pi pi-fw pi-map', to: '/student/roadmaps' },
            { label: 'My Skills', icon: 'pi pi-fw pi-star', to: '/student/skills' },
            { label: 'My Courses', icon: 'pi pi-fw pi-book', to: '/student/courses' },
            { label: 'My Projects', icon: 'pi pi-fw pi-folder', to: '/student/projects' },
            // { label: 'Calendar', icon: 'pi pi-fw pi-calendar', to: '/student/calendar' },
            { label: 'Career Path', icon: 'pi pi-fw pi-compass', to: '/student/careers' }
        ]
    },

    // =============================================================================
    // 3. ADMIN MODULE (Hidden if not Admin)
    // =============================================================================
    {
        label: 'Admin',
        // visible: isAdmin.value, // <--- CONDITION ADDED
        items: [
            { label: 'Admin Dashboard', icon: 'pi pi-fw pi-chart-line', to: '/admin/dashboard' },
            {
                label: 'Access Control', // Parent Label
                icon: 'pi pi-fw pi-lock', // Parent Icon
                items: [
                    { label: 'User Management', icon: 'pi pi-fw pi-users', to: '/admin/users' },
                    { label: 'Roles & Permissions', icon: 'pi pi-fw pi-shield', to: '/admin/roles' },
                ]
            },
            { label: 'Roadmap Management', icon: 'pi pi-fw pi-sitemap', to: '/admin/roadmaps' },
            { label: 'Skill Management', icon: 'pi pi-fw pi-tags', to: '/admin/skills' },
            { label: 'Course Management', icon: 'pi pi-fw pi-book', to: '/admin/courses' },
            { label: 'Career Management', icon: 'pi pi-fw pi-briefcase', to: '/admin/careers' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item.label">
            <app-menu-item
                v-if="!item.separator && item.visible !== false"
                :item="item"
                :index="i"
            ></app-menu-item>

            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
