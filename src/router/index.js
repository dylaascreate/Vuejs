import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // =============================================================================
        // 1. PUBLIC ROUTES (Accessible by everyone)
        // =============================================================================
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue'),
            meta: { title: 'Welcome' }
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import('@/views/pages/Contact.vue'),
            meta: { title: 'Contact Us' }
        },
        {
            path: '/matrix',
            name: 'matrix',
            component: () => import('@/views/pages/Matrix.vue'),
            meta: { title: 'Matrix Features' }
        },
        {
            path: '/protocol',
            name: 'protocol',
            component: () => import('@/views/pages/SystemProtocols.vue'),
            meta: { title: 'System Protocols' }
        },
        {
            path: '/status',
            name: 'status',
            component: () => import('@/views/pages/SystemStatus.vue'),
            meta: { title: 'System Status' }
        },
        {
            path: '/copyright',
            name: 'copyright',
            component: () => import('@/views/pages/Copyright.vue'),
            meta: { title: 'Copyright' }
        },

        // =============================================================================
        // 2. GUEST AUTH ROUTES (Accessible only if NOT logged in)
        // =============================================================================
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { guest: true, title: 'Login' }
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue'),
            meta: { guest: true, title: 'Create Account' }
        },
        {
            path: '/auth/reset-password',
            name: 'reset-password',
            component: () => import('@/views/pages/auth/ResetPassword.vue'),
            meta: { guest: true, title: 'Reset Password' }
        },

        // =============================================================================
        // 3. ERROR PAGES
        // =============================================================================
        {
            path: '/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
            meta: { title: 'Access Denied' }
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
            meta: { title: 'Error' }
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: { title: 'Page Not Found' }
        },

        // =============================================================================
        // 4. PROTECTED ROUTES (Requires Login)
        //    All routes inside here use the Main AppLayout (Sidebar/Navbar)
        // =============================================================================
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true }, // Applies to all children
            children: [
                // --- 4.1 SHARED DASHBOARD & PROFILE ---
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { title: 'Dashboard' }
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/pages/UserProfile.vue'),
                    meta: { title: 'My Profile' }
                },
                {
                    path: '/profile-settings',
                    name: 'profile-settings',
                    component: () => import('@/views/pages/ProfileSettings.vue'),
                    meta: { title: 'Settings' }
                },

                // --- 4.2 ADMIN ROUTES (Role: 'admin') ---
                {
                    path: '/admin/dashboard',
                    name: 'admin-dashboard',
                    component: () => import('@/views/pages/AdminDashboard.vue'),
                    meta: { title: 'Admin Console', roles: ['admin'] }
                },
                {
                    path: '/admin/users',
                    name: 'admin-users',
                    component: () => import('@/views/pages/admin/UserManagement.vue'),
                    meta: { title: 'User Management', roles: ['admin'] }
                },
                {
                    path: '/admin/roadmaps',
                    name: 'admin-roadmaps',
                    component: () => import('@/views/pages/admin/RoadmapManagement.vue'),
                    meta: { title: 'Roadmap Management', roles: ['admin'] }
                },
                {
                    path: '/admin/courses',
                    name: 'admin-courses',
                    component: () => import('@/views/pages/admin/CourseManagement.vue'),
                    meta: { title: 'Course Management', roles: ['admin'] }
                },
                {
                    path: '/admin/skills',
                    name: 'admin-skills',
                    component: () => import('@/views/pages/admin/SkillManagement.vue'),
                    meta: { title: 'Skill Management', roles: ['admin'] }
                },
                {
                    path: '/admin/careers',
                    name: 'admin-careers',
                    component: () => import('@/views/pages/admin/CareerManagement.vue'),
                    meta: { title: 'Career Paths', roles: ['admin'] }
                },
                {
                    path: '/admin/roles',
                    name: 'admin-roles',
                    component: () => import('@/views/pages/admin/RolePermissionManagement.vue'),
                    meta: { title: 'Role Permissions', roles: ['admin'] }
                },

                // --- 4.3 STUDENT ROUTES (Role: 'student') ---
                {
                    path: '/student/dashboard',
                    name: 'student-dashboard',
                    component: () => import('@/views/pages/StudentDashboard.vue'),
                    meta: { title: 'Student Dashboard', roles: ['student'] }
                },
                {
                    path: '/student/roadmap-generator',
                    name: 'roadmap-generator',
                    component: () => import('@/views/pages/RoadmapGenerator.vue'),
                    // meta: { title: 'AI Generator', roles: ['student'] }
                },
                {
                    path: '/student/roadmap-loading',
                    name: 'roadmap-loading',
                    component: () => import('@/views/pages/RoadmapLoading.vue'),
                    // meta: { title: 'Generating...', roles: ['student'] }
                },
                {
                    path: '/student/roadmap-details/:id',
                    name: 'roadmap-details',
                    component: () => import('@/views/pages/RoadmapDetails.vue'),
                    // meta: { title: 'Roadmap Details', roles: ['student'] }
                },
                {
                    path: '/student/roadmap-details-academic/:id',
                    name: 'roadmap-details-academic',
                    component: () => import('@/views/pages/RoadmapDetailsAcademic.vue'),
                    // meta: { title: 'Roadmap Details', roles: ['student'] }
                },
                {
                    path: '/student/roadmaps',
                    name: 'student-roadmaps',
                    component: () => import('@/views/pages/StudentRoadmapList.vue'),
                    // meta: { title: 'My Roadmaps', roles: ['student'] }
                },
                {
                    path: '/student/skills',
                    name: 'student-skills',
                    component: () => import('@/views/pages/StudentSkills.vue'),
                    meta: { title: 'My Skills', roles: ['student'] }
                },
                {
                    path: '/student/courses',
                    name: 'student-courses',
                    component: () => import('@/views/pages/StudentCourses.vue'),
                    meta: { title: 'My Courses', roles: ['student'] }
                },
                {
                    path: '/student/projects',
                    name: 'student-projects',
                    component: () => import('@/views/pages/StudentProjects.vue'),
                    meta: { title: 'My Projects', roles: ['student'] }
                },
                {
                    path: '/student/calendar',
                    name: 'student-calendar',
                    component: () => import('@/views/pages/LearningCalendar.vue'),
                    meta: { title: 'Learning Calendar', roles: ['student'] }
                },
                {
                    path: '/student/careers',
                    name: 'student-careers',
                    component: () => import('@/views/pages/CareerProgression.vue'),
                    meta: { title: 'Career Progression', roles: ['student'] }
                },

                // --- 4.4 UI KIT / UTILITIES (For Development/Demo) ---
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue'),
                    meta: { title: 'Empty Page' }
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue'),
                    meta: { title: 'CRUD Demo' }
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue'),
                    meta: { title: 'Documentation' }
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue'),
                    meta: { title: 'Buttons' }
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue'),
                    meta: { title: 'Charts' }
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue'),
                    meta: { title: 'File Upload' }
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue'),
                    meta: { title: 'Form Layout' }
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue'),
                    meta: { title: 'Input' }
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue'),
                    meta: { title: 'List' }
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue'),
                    meta: { title: 'Media' }
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue'),
                    meta: { title: 'Menu' }
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue'),
                    meta: { title: 'Messages' }
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue'),
                    meta: { title: 'Misc' }
                },
                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue'),
                    meta: { title: 'Overlay' }
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue'),
                    meta: { title: 'Panel' }
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue'),
                    meta: { title: 'Table' }
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue'),
                    meta: { title: 'Timeline' }
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue'),
                    meta: { title: 'Tree' }
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    component: () => import('@/views/utilities/Blocks.vue'),
                    meta: { title: 'Blocks', breadcrumb: ['Prime Blocks', 'Free Blocks'] }
                }
            ]
        }
    ]
});

// =============================================================================
// NAVIGATION GUARD (Global Security Logic)
// =============================================================================
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 1. SET PAGE TITLE
    const pageTitle = to.meta.title;
    const appName = 'DevNexus';
    document.title = pageTitle ? `${pageTitle} | ${appName}` : appName;

    // 2. GET USER DATA
    const isLoggedIn = !!authStore.user;
    const userRole = authStore.user?.role; // Ensure this matches your API response structure

    // === SCENARIO A: GUEST ONLY PAGES (Login/Register) ===
    // If logged-in user tries to access login page, redirect to Dashboard
    if (to.meta.guest && isLoggedIn) {
        return next({ name: 'dashboard' });
    }

    // === SCENARIO B: PROTECTED PAGES (Dashboard, Admin, etc.) ===
    // If guest tries to access protected page, redirect to Login
    if (to.meta.requiresAuth && !isLoggedIn) {
        return next({ name: 'login' });
    }

    // === SCENARIO C: ROLE BASED ACCESS ===
    // If route has specific roles (e.g., ['admin']) and user doesn't match
    if (to.meta.roles) {
        if (!to.meta.roles.includes(userRole)) {
            return next({ name: 'accessDenied' });
        }
    }

    // 5. ALLOW NAVIGATION
    next();
});

export default router;
