<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();

// Dynamic User Data
const user = ref({
    name: 'Sophie A.',
    role: 'Frontend Architect',
    location: 'Cyberjaya, MY',
    bio: 'Synthesizing neural interfaces and glassmorphic design systems. Currently optimizing the DevNexus core protocol.',
    stats: { roadmaps: 14, skills: 42, projects: 8 }
});

const goToSettings = () => {
    router.push({ name: 'profile-settings' }); // Assumes you named your route 'profile-settings'
    // Alternatively, use path: router.push('/profile-settings');
};

// Featured Projects Data
const featuredProjects = ref([
    {
        id: 1,
        title: 'Neural Grid UI',
        tech: ['Vue 3', 'Three.js'],
        description: 'A high-performance data visualization engine for real-time stream monitoring.',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80',
        status: 'DEPLOYED'
    },
    {
        id: 2,
        title: 'Auth Protocol V2',
        tech: ['Node.js', 'JWT'],
        description: 'Secure biometric-ready authentication middleware for distributed systems.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
        status: 'IN_REVIEW'
    }
]);

const skills = ref([
    { name: 'Vue.js', level: 95 },
    { name: 'TypeScript', level: 80 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'System Design', level: 75 }
]);

const logout = async () =>{
    try {
        await authStore.logout(); // Calls the API logout + clears state
        router.push('/auth/login');
        toast.add({ severity: 'success', summary: 'End of Session', detail: 'Session terminated', life: 3000 });
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'End of Session', detail: 'Unable to end session. Try again.', life: 3000 });
    }
};
</script>

<template>
    <div class="relative min-h-screen font-sans text-[#2c4c52]">
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-6 max-w-[1600px] mx-auto">

            <div class="col-span-12 lg:col-span-3 space-y-6">
                <div class="card p-6 flex flex-col items-center text-center group">
                    <Button icon="pi pi-cog" text rounded
                    class="!absolute top-3 right-3 !text-[#2c4c52]/40 hover:!text-[#2c4c52] !w-8 !h-8 transition-colors"
                    v-tooltip.left="'Edit Profile'" @click="goToSettings" />

                    <div class="relative mb-6">
                        <div class="w-32 h-32 rounded-3xl bg-[#2c4c52] p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <img src="https://imagine-public.x.ai/imagine-public/images/fbd4b811-df27-49d0-b122-fd18c0cb0cc6.png?cache=1&dl=1" class="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <div class="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                    </div>
                    <h2 class="text-2xl font-black uppercase tracking-tighter">{{ user.name }}</h2>
                    <p class="font-mono text-xs font-bold text-[#7bc5cd] mb-4">{{ user.role }}</p>
                    <p class="text-sm text-[#4a7a82] leading-relaxed mb-6">{{ user.bio }}</p>

                    <div class="w-full pt-6 border-t border-[#2c4c52]/10 flex justify-around">
                        <div v-for="(val, label) in user.stats" :key="label" class="text-center">
                            <span class="block text-xl font-black">{{ val }}</span>
                            <span class="text-[9px] font-mono font-bold uppercase opacity-50">{{ label }}</span>
                        </div>
                    </div>
                </div>

                <div class="card p-6">
                    <h4 class="font-black text-xs uppercase tracking-widest mb-6 text-[#7bc5cd]">Matrix</h4>
                    <div class="space-y-4">
                        <div v-for="skill in skills" :key="skill.name">
                            <div class="flex justify-between text-[10px] font-bold uppercase mb-1">
                                <span>{{ skill.name }}</span>
                                <span>{{ skill.level }}%</span>
                            </div>
                            <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-[#7bc5cd] to-[#2c4c52] rounded-full" :style="{ width: skill.level + '%' }"></div>
                            </div>
                        </div>
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
                        <!-- <Button icon="pi pi-plus" label="NEW_PROJECT" class="y2k-button-secondary !text-xs !px-4" /> -->
                        <Button
                        icon="pi pi-sign-out"
                        label="logout"
                        class="y2k-button-secondary !text-xs !px-4"
                        @click="logout"
                    />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="project in featuredProjects" :key="project.id"
                             class="card p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-white/80">

                            <div class="h-48 overflow-hidden relative">
                                <img :src="project.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#2c4c52] to-transparent opacity-60"></div>
                                <span class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-mono text-[9px] font-bold text-white border border-white/30">
                                    {{ project.status }}
                                </span>
                            </div>

                            <div class="p-6">
                                <div class="flex gap-2 mb-3">
                                    <Tag v-for="t in project.tech" :key="t" :value="t" class="!bg-[#2c4c52]/5 !text-[#2c4c52] !text-[9px] !font-bold" />
                                </div>
                                <h4 class="text-xl font-black uppercase mb-2">{{ project.title }}</h4>
                                <p class="text-sm text-[#4a7a82] mb-6 line-clamp-2">{{ project.description }}</p>

                                <div class="flex justify-between items-center pt-4 border-t border-[#2c4c52]/5">
                                    <!-- <div class="flex -space-x-2">
                                        <div v-for="i in 3" :key="i" class="w-6 h-6 rounded-full border-2 border-white bg-[#7bc5cd]"></div>
                                    </div> -->
                                    <Button icon="pi pi-external-link" class="p-button-rounded p-button-text !text-[#2c4c52]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card p-6">
                    <h4 class="font-black text-xs uppercase tracking-widest mb-6 text-[#7bc5cd]">Active_Synchronizations</h4>
                    <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        <div v-for="i in 3" :key="i" class="min-w-[280px] p-4 bg-white/60 border border-white rounded-2xl flex items-center gap-4">
                            <div class="w-12 h-12 bg-[#2c4c52] rounded-xl flex items-center justify-center text-[#7bc5cd]">
                                <i class="pi pi-map"></i>
                            </div>
                            <div>
                                <span class="block font-bold text-sm">Frontend Track</span>
                                <span class="text-[10px] font-mono font-bold text-[#4a7a82]">75% COMPLETE</span>
                            </div>
                        </div>
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
