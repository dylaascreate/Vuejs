<script setup>
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';

// 1. Layout Composables
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

// 2. Notification System Logic
const op = ref();
const notifications = ref([
    {
        id: 1,
        title: 'New Skill Mastered',
        description: 'You unlocked the Vue_Logic_v3 artifact.',
        time: '2m ago',
        icon: 'pi pi-bolt',
        unread: true
    },
    {
        id: 2,
        title: 'Roadmap Optimized',
        description: 'Frontend track updated with new nodes.',
        time: '1h ago',
        icon: 'pi pi-map',
        unread: true
    },
    {
        id: 3,
        title: 'Security Alert',
        description: 'New login detected from IP: 192.168.1.1',
        time: '5h ago',
        icon: 'pi pi-shield',
        unread: false
    }
]);

const toggleNotifications = (event) => {
    op.value.toggle(event);
};

const markAllRead = () => {
    notifications.value.forEach((n) => (n.unread = false));
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action text-[#2c4c52] dark:text-[#7bc5cd]" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>

            <router-link to="/landing" class="layout-topbar-logo flex items-center gap-3">
                <div class="w-8 h-8 bg-[#2c4c52] rounded-lg flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-[#7bc5cd]">
                        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
                    </svg>
                </div>
                <span class="text-xl font-black tracking-tighter text-[#2c4c52] dark:text-white uppercase">
                    DEV<span class="text-[#7bc5cd]">NEXUS</span>
                </span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>

                <div class="relative">
                    <button
                        v-styleclass="{
                            selector: '@next',
                            enterFromClass: 'hidden',
                            enterActiveClass: 'p-anchored-overlay-enter-active',
                            leaveToClass: 'hidden',
                            leaveActiveClass: 'p-anchored-overlay-leave-active',
                            hideOnOutsideClick: true
                        }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{
                    selector: '@next',
                    enterFromClass: 'hidden',
                    enterActiveClass: 'p-anchored-overlay-enter-active',
                    leaveToClass: 'hidden',
                    leaveActiveClass: 'p-anchored-overlay-leave-active',
                    hideOnOutsideClick: true
                }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <router-link to="/student/calendar">
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-calendar"></i>
                            <span>Calendar</span>
                        </button>
                    </router-link>

                                    <button type="button" class="layout-topbar-action relative" @click="toggleNotifications">
                    <i class="pi pi-inbox"></i>
                    <span v-if="notifications.some((n) => n.unread)" class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                    <router-link to="/profile">
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                    </router-link>
                </div>
            </div>
        </div>

        <OverlayPanel ref="op" class="y2k-inbox-overlay">
            <div class="w-80 md:w-96 overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-[#2c4c52]/10 bg-[#2c4c52]/5">
                    <div>
                        <span class="block font-black text-[#2c4c52] uppercase text-sm tracking-tighter">Signal Inbox</span>
                        <span class="font-mono text-[9px] font-bold text-[#7bc5cd] uppercase tracking-widest">Inbound_Stream</span>
                    </div>
                    <button @click="markAllRead" class="text-[10px] font-bold text-[#4a7a82] hover:text-[#2c4c52] uppercase transition-colors">Clear All</button>
                </div>

                <div class="max-h-80 overflow-y-auto">
                    <div
                        v-for="n in notifications"
                        :key="n.id"
                        :class="['p-4 flex gap-4 cursor-pointer transition-colors border-b border-[#2c4c52]/5 last:border-0', n.unread ? 'bg-[#7bc5cd]/5 hover:bg-[#7bc5cd]/10' : 'hover:bg-gray-50']"
                    >
                        <div class="w-10 h-10 rounded-xl bg-[#2c4c52] flex items-center justify-center shrink-0">
                            <i :class="[n.icon, 'text-[#7bc5cd]']"></i>
                        </div>

                        <div class="flex-1">
                            <div class="flex justify-between items-start mb-1">
                                <span class="font-bold text-xs text-[#2c4c52]">{{ n.title }}</span>
                                <span class="font-mono text-[9px] text-[#4a7a82]">{{ n.time }}</span>
                            </div>
                            <p class="text-[11px] text-[#4a7a82] leading-tight">{{ n.description }}</p>
                        </div>
                    </div>
                </div>

                <div class="p-3 text-center border-t border-[#2c4c52]/5">
                    <button class="font-mono text-[10px] font-black text-[#2c4c52] uppercase hover:underline">View All Transmissions</button>
                </div>
            </div>
        </OverlayPanel>
    </div>
</template>

<style scoped>
/* Glassmorphic Dropdown Override */
:deep(.y2k-inbox-overlay.p-overlaypanel) {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(15px) !important;
    border: 1px solid rgba(255, 255, 255, 0.6) !important;
    border-radius: 1.5rem !important;
    box-shadow: 0 20px 40px rgba(44, 76, 82, 0.15) !important;
    padding: 0 !important;
}

:deep(.y2k-inbox-overlay.p-overlaypanel:before),
:deep(.y2k-inbox-overlay.p-overlaypanel:after) {
    display: none !important;
}

/* Custom Scrollbar for the Inbox */
.max-h-80::-webkit-scrollbar {
    width: 4px;
}
.max-h-80::-webkit-scrollbar-thumb {
    background: #7bc5cd;
    border-radius: 10px;
}
</style>