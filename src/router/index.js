import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/blocks',
                    name: 'blocks',
                    meta: {
                        breadcrumb: ['Prime Blocks', 'Free Blocks']
                    },
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                },
                {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/pages/StudentDashboard.vue')
},
{
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/pages/AdminDashboard.vue')
},
{
    path: '/student/roadmap-generator',
    name: 'roadmap-generator',
    component: () => import('@/views/pages/RoadmapGenerator.vue')
},
{
    path: '/student/roadmap-loading',
    name: 'roadmap-loading',
    component: () => import('@/views/pages/RoadmapLoading.vue')
},
{
    path: '/student/roadmap-details',
    name: 'roadmap-details',
    component: () => import('@/views/pages/RoadmapDetails.vue')
},
{
    path: '/student/roadmap-details-academic',
    name: 'roadmap-details-academic',
    component: () => import('@/views/pages/RoadmapDetailsAcademic.vue')
},
{
    path: '/student/roadmaps',
    name: 'student-roadmaps',
    component: () => import('@/views/pages/StudentRoadmapList.vue')
},
{
    path: '/student/skills',
    name: 'student-skills',
    component: () => import('@/views/pages/StudentSkills.vue')
},
{
    path: '/student/courses',
    name: 'student-courses',
    component: () => import('@/views/pages/StudentCourses.vue')
},
{
    path: '/student/projects',
    name: 'student-projects',
    component: () => import('@/views/pages/StudentProjects.vue')
},
{
    path: '/student/calendar',
    name: 'student-calendar',
    component: () => import('@/views/pages/LearningCalendar.vue')
},
{
    path: '/student/careers',
    name: 'student-careers',
    component: () => import('@/views/pages/CareerProgression.vue')
},
{
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/pages/admin/UserManagement.vue')
},
{
    path: '/admin/roadmaps',
    name: 'admin-roadmaps',
    component: () => import('@/views/pages/admin/RoadmapManagement.vue')
},
{
    path: '/admin/courses',
    name: 'admin-courses',
    component: () => import('@/views/pages/admin/CourseManagement.vue')
},
{
    path: '/admin/skills',
    name: 'admin-skills',
    component: () => import('@/views/pages/admin/SkillManagement.vue')
},
{
    path: '/admin/careers',
    name: 'admin-careers',
    component: () => import('@/views/pages/admin/CareerManagement.vue')
},
{
    path: '/admin/roles',
    name: 'admin-roles',
    component: () => import('@/views/pages/admin/RolePermissionManagement.vue')
},
{
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/pages/UserProfile.vue')
                },
{
                    path: '/profile-settings',
                    name: 'profile-settings',
                    component: () => import('@/views/pages/ProfileSettings.vue')
                },

            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },{
            path: '/status',
            name: 'status',
            component: () => import('@/views/pages/SystemStatus.vue')
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import('@/views/pages/Contact.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: {guest:true},
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue'),
            meta: {guest:true},
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 1. Restore session if needed
    if (!authStore.user && to.meta.requiresAuth) {
         await authStore.getUser();
    }

    // 2. Logic Chain
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Case A: User needs to login
        next({ name: 'login' }); // (Must be lowercase)

    } else if (to.meta.guest && authStore.isAuthenticated) {
        // Case B: User is already logged in, kick them out of login page
        next({ name: 'dashboard' }); // (Must be lowercase)

    } else {
        // Case C: Proceed as normal
        next();
    }
});

export default router;
