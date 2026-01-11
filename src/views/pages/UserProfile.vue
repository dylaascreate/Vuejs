<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';

// Import Stores
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useSkillStore } from '@/stores/skill';
import { useRoadmapStore } from '@/stores/roadmap'; // [1] Import Roadmap Store
import { useProjectStore } from '@/stores/project'; // [2] Import Project Store

const toast = useToast();
const router = useRouter();

// Initialize Stores
const authStore = useAuthStore();
const userStore = useUserStore();
const skillStore = useSkillStore();
const roadmapStore = useRoadmapStore(); // [3] Init
const projectStore = useProjectStore(); // [4] Init

// Destructure State
const { user: authUser } = storeToRefs(authStore);
const { userSkills } = storeToRefs(skillStore);
const { userProjects } = storeToRefs(projectStore); // Get Projects
const { roadmaps } = storeToRefs(roadmapStore);     // Get Roadmaps (Assuming state is named 'roadmaps' or 'userRoadmaps')

// --- Computed Properties ---

// 1. User Display Info
const displayUser = computed(() => ({
    name: authUser.value?.name || 'Guest User',
    role: authUser.value?.role || 'Student',
    email: authUser.value?.email || '',
    location: authUser.value?.location || 'DevNexus Online',
    bio: authUser.value?.bio || 'Exploring the DevNexus system architecture. initializing learning protocols.',
    avatar: authUser.value?.avatar || 'https://imagine-public.x.ai/imagine-public/images/fbd4b811-df27-49d0-b122-fd18c0cb0cc6.png?cache=1&dl=1'
}));

// 2. Real Stats (Derived from Store Data Lengths)
const realStats = computed(() => ({
    roadmaps: roadmaps.value?.length || 0,
    skills: userSkills.value?.length || 0,
    projects: userProjects.value?.length || 0
}));

// 3. Top Skills (Sorted by Proficiency)
const topSkills = computed(() => {
    return [...(userSkills.value || [])]
        .sort((a, b) => b.proficiency - a.proficiency)
        .slice(0, 5);
});

// --- Actions ---

const goToSettings = () => {
    router.push('/profile-settings');
};

const logout = async () => {
    try {
        await authStore.logout();
        router.push('/auth/login');
        toast.add({ severity: 'success', summary: 'System Log', detail: 'Session terminated successfully.', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Logout failed.', life: 3000 });
    }
};

// --- Lifecycle ---

onMounted(() => {
    // Fetch all necessary data
    userStore.fetchUserStats();   // Keep for specific aggregates if needed
    skillStore.fetchUserMatrix(); // Fetch Skills
    projectStore.fetchUserProjects(); // [5] Fetch Projects

    // [6] Fetch Roadmaps (Check your roadmap store for exact action name, usually fetchRoadmaps or fetchUserRoadmaps)
    if (roadmapStore.fetchRoadmaps) {
        roadmapStore.fetchRoadmaps();
    } else if (roadmapStore.fetchUserRoadmaps) {
        roadmapStore.fetchUserRoadmaps();
    }
});
</script>

<template>
    <div class="relative min-h-screen font-sans text-[#2c4c52]">
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-6 max-w-[1600px] mx-auto">

            <div class="col-span-12 lg:col-span-3 space-y-6">

                <div class="card p-6 flex flex-col items-center text-center group relative">
                    <Button icon="pi pi-cog" text rounded
                        class="!absolute top-3 right-3 !text-[#2c4c52]/40 hover:!text-[#2c4c52] !w-8 !h-8 transition-colors z-10"
                        v-tooltip.left="'Edit Profile'" @click="goToSettings" />

                    <div class="relative mb-6">
                        <div class="w-32 h-32 rounded-3xl bg-[#2c4c52] p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <img :src="displayUser.avatar" class="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                    </div>

                    <h2 class="text-2xl font-black uppercase tracking-tighter">{{ displayUser.name }}</h2>
                    <p class="font-mono text-xs font-bold text-[#7bc5cd] mb-1">{{ displayUser.role }}</p>
                    <p class="text-[10px] font-mono text-[#4a7a82]/60 mb-4">{{ displayUser.email }}</p>

                    <p class="text-sm text-[#4a7a82] leading-relaxed mb-6 italic">
                        "{{ displayUser.bio }}"
                    </p>

                    <div class="w-full pt-6 border-t border-[#2c4c52]/10 flex justify-around">
                        <div class="text-center">
                            <span class="block text-xl font-black">{{ realStats.roadmaps }}</span>
                            <span class="text-[9px] font-mono font-bold uppercase opacity-50">Roadmaps</span>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-black">{{ realStats.skills }}</span>
                            <span class="text-[9px] font-mono font-bold uppercase opacity-50">Skills</span>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-black">{{ realStats.projects }}</span>
                            <span class="text-[9px] font-mono font-bold uppercase opacity-50">Projects</span>
                        </div>
                    </div>
                </div>

                <div class="card p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-black text-xs uppercase tracking-widest text-[#7bc5cd]">Top Skills</h4>
                        <router-link to="/student/skills">
                            <i class="pi pi-arrow-right text-xs text-[#2c4c52]/50 hover:text-[#2c4c52] cursor-pointer"></i>
                        </router-link>
                    </div>

                    <div v-if="topSkills.length > 0" class="space-y-4">
                        <div v-for="skill in topSkills" :key="skill.id">
                            <div class="flex justify-between text-[10px] font-bold uppercase mb-1">
                                <span>{{ skill.name }}</span>
                                <span class="text-[#7bc5cd]">{{ skill.proficiency }}%</span>
                            </div>
                            <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52] rounded-full"
                                     :style="{ width: skill.proficiency + '%' }"></div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-4">
                        <span class="text-xs text-[#4a7a82]">No skills recorded.</span>
                        <br>
                        <router-link to="/student/skills" class="text-[10px] font-bold text-[#2c4c52] hover:underline">
                            Initialize Matrix ->
                        </router-link>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-9 space-y-8">

                <div>
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-3xl font-black uppercase tracking-tighter">Featured Artifacts</h3>
                            <span class="font-mono text-[10px] text-[#7bc5cd] font-bold">PROJECT_REPOSITORY_INDEX</span>
                        </div>

                        <Button
                            icon="pi pi-sign-out"
                            label="LOGOUT"
                            class="y2k-button-secondary !text-xs !px-4"
                            @click="logout"
                        />
                    </div>

                    <div v-if="userProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="project in userProjects" :key="project.id"
                             class="card p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-white/80">

                            <div class="h-48 overflow-hidden relative">
                                <!-- <img :src="project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80'" -->
                                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#2c4c52] to-transparent opacity-60"></div>
                                <span class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-mono text-[9px] font-bold text-white border border-white/30">
                                    {{ project.status || 'ACTIVE' }}
                                </span>
                            </div>

                            <div class="p-6">
                                <div class="flex gap-2 mb-3">
                                    <Tag v-for="t in (project.tech || ['DevNexus'])" :key="t" :value="t" class="!bg-[#2c4c52]/5 !text-[#2c4c52] !text-[9px] !font-bold" />
                                </div>
                                <h4 class="text-xl font-black uppercase mb-2">{{ project.title || project.name }}</h4>
                                <p class="text-sm text-[#4a7a82] mb-6 line-clamp-2">{{ project.description }}</p>

                                <div class="flex justify-between items-center pt-4 border-t border-[#2c4c52]/5">
                                    <Button icon="pi pi-external-link" class="p-button-rounded p-button-text !text-[#2c4c52]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-12 border-2 border-dashed border-[#2c4c52]/10 rounded-3xl bg-white/40">
                        <i class="pi pi-folder-open text-4xl text-[#2c4c52]/30 mb-4"></i>
                        <h4 class="text-[#2c4c52] font-bold">No Artifacts Found</h4>
                        <p class="text-xs text-[#4a7a82] mt-2">Begin a roadmap to generate projects.</p>
                        <router-link to="/student/projects">
                            <Button label="START NEW PROJECT" class="y2k-button-secondary !mt-4 !text-xs" />
                        </router-link>
                    </div>
                </div>

                <div class="card p-6">
                    <h4 class="font-black text-xs uppercase tracking-widest mb-6 text-[#7bc5cd]">Active_Synchronizations</h4>

                    <div v-if="roadmaps.length > 0" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        <div v-for="map in roadmaps" :key="map.id" class="min-w-[280px] p-4 bg-white/60 border border-white rounded-2xl flex items-center gap-4">
                            <div class="w-12 h-12 bg-[#2c4c52] rounded-xl flex items-center justify-center text-[#7bc5cd]">
                                <i class="pi pi-map"></i>
                            </div>
                            <div>
                                <span class="block font-bold text-sm">{{ map.title }}</span>
                                <span class="text-[10px] font-mono font-bold text-[#4a7a82]">{{ map.progress || 0 }}% COMPLETE</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center text-xs text-[#4a7a82] py-4">
                        No active roadmaps initialized.
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid #2c4c52 !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
}
.y2k-button-secondary:hover {
    background: #2c4c52 !important;
    color: #7bc5cd !important;
}
</style>
