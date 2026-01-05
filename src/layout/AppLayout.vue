<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, ref, watch } from 'vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import AiAssistant from './AiAssistant.vue';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref(null);

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

function bindOutsideClickListener() {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive = false;
                layoutState.staticMenuMobileActive = false;
                layoutState.menuHoverActive = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
}

function unbindOutsideClickListener() {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
}

function isOutsideClicked(event) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
}
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20" 
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-30 z-0 pointer-events-none"></div>
        <div class="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#a7e2e8] rounded-full blur-[120px] opacity-30 z-0 pointer-events-none"></div>

        <app-topbar></app-topbar>
        
        <app-sidebar></app-sidebar>
        
        <div class="layout-main-container relative z-10">
            <div class="layout-main">
                <router-view></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        
        <div class="layout-mask animate-fadein"></div>
    </div>
    <Toast />
    <AiAssistant />
</template>

<style lang="scss" scoped></style>