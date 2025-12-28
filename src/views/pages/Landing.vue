<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref } from 'vue';

const { isDarkTheme } = useLayout();

// Custom "Star" Icon based on your logo shape
const StarIcon = {
    template: `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 animate-pulse">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
        </svg>
    `
};

const features = ref([
    { title: 'AI GENERATION', desc: 'Neural networks building your path.', icon: 'pi pi-bolt' },
    { title: 'CYBER TRACKING', desc: 'Monitor academic velocity.', icon: 'pi pi-chart-line' },
    { title: 'NET_PORTFOLIO', desc: 'Display your digital artifacts.', icon: 'pi pi-id-card' },
]);
</script>

<template>
    <div class="min-h-screen bg-[#e0f2f1] text-[#2c4c52] font-sans selection:bg-[#7bc5cd] selection:text-white overflow-hidden relative">
        
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20" 
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-40 z-0"></div>
        <div class="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#a7e2e8] rounded-full blur-[120px] opacity-40 z-0"></div>

        <nav class="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 bg-gradient-to-tr from-[#7bc5cd] to-white rounded flex items-center justify-center shadow-lg border border-white/50">
                    <component :is="StarIcon" class="text-white w-6 h-6" />
                </div>
                <span class="text-2xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-[#2c4c52] to-[#5d9ca4]">
                    DEVNEXUS
                </span>
            </div>

            <div class="hidden md:flex gap-8 font-mono text-sm font-bold tracking-widest text-[#2c4c52]/80">
                <a href="#matrix" class="hover:text-[#2c4c52] hover:underline decoration-2 underline-offset-4 transition-all">MATRIX</a>
                <a href="#modules" class="hover:text-[#2c4c52] hover:underline decoration-2 underline-offset-4 transition-all">MODULES</a>
                <a href="/contact" class="hover:text-[#2c4c52] hover:underline decoration-2 underline-offset-4 transition-all">CONNECT</a>
            </div>

            <div class="flex gap-4">
                <router-link to="/auth/login">
                <Button label="LOGIN" class="y2k-button-secondary font-mono text-sm" />
                </router-link>
                <router-link to="/auth/register">
                <Button label="ENTER SYSTEM" class="y2k-button-primary font-mono text-sm" />
                </router-link>
            </div>
        </nav>

        <main class="relative z-10 container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
            
            <div class="md:w-1/2 space-y-8 text-center md:text-left">
                <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#2c4c52]/20 bg-white/30 backdrop-blur-md">
                    <span class="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                    <span class="font-mono text-xs font-bold tracking-widest text-[#2c4c52]">SYSTEM ONLINE v2.0</span>
                </div>
                
                <h1 class="text-6xl md:text-8xl font-black leading-none tracking-tighter text-[#2c4c52] drop-shadow-sm">
                    FUTURE <br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] via-[#5d9ca4] to-[#2c4c52]">SOFTWARE ENGINEER</span>
                </h1>
                
                <p class="text-xl md:text-2xl text-[#4a7a82] font-medium max-w-lg mx-auto md:mx-0">
                    Accelerate your evolution. AI-driven roadmaps designed for the next generation of developers.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                    <button class="y2k-brutalist-btn px-8 py-4 bg-[#2c4c52] text-white font-bold text-lg rounded-none hover:bg-[#1a3338] transition-all flex items-center justify-center gap-3">
                        <i class="pi pi-bolt"></i> GENERATE ROADMAP
                    </button>
                    <button class="px-8 py-4 border-2 border-[#2c4c52] text-[#2c4c52] font-bold text-lg hover:bg-[#2c4c52] hover:text-white transition-all uppercase tracking-wider">
                        View Demo
                    </button>
                </div>
            </div>

            <div class="md:w-1/2 relative h-[500px] w-full flex items-center justify-center">
                <div class="relative w-80 h-80">
                    <div class="absolute inset-0 border-[20px] border-[#7bc5cd]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div class="absolute inset-4 border-[2px] border-[#2c4c52]/20 rounded-full"></div>
                    
                    <div class="absolute top-0 right-[-40px] bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-xl shadow-xl transform rotate-12 hover:rotate-0 transition-all duration-500 z-20 w-48">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-mono text-[10px] font-bold">STATUS</span>
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        <div class="font-bold text-[#2c4c52] text-lg">SKILL ACQUIRED</div>
                        <div class="text-xs text-[#2c4c52]/70">Vue.js Mastery</div>
                    </div>

                    <div class="absolute bottom-[-20px] left-[-20px] bg-[#2c4c52] text-white p-4 rounded-xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500 z-20 w-56">
                        <div class="font-mono text-xs text-[#7bc5cd] mb-1">// SYSTEM_MSG</div>
                        <div class="font-bold text-xl">Roadmap Ready</div>
                        <div class="w-full bg-white/20 h-1 mt-3 rounded-full overflow-hidden">
                            <div class="bg-[#7bc5cd] w-3/4 h-full"></div>
                        </div>
                    </div>

                    <div class="absolute inset-0 flex items-center justify-center z-10">
                         <div class="w-32 h-32 bg-gradient-to-br from-[#7bc5cd] to-white rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(123,197,205,0.6)]">
                            <component :is="StarIcon" class="text-white w-16 h-16 -rotate-45" />
                         </div>
                    </div>
                </div>
            </div>
        </main>

        <div class="bg-[#2c4c52] py-4 transform -rotate-1 shadow-xl overflow-hidden relative z-20">
            <div class="whitespace-nowrap animate-marquee flex gap-8 text-[#7bc5cd] font-mono font-bold text-lg tracking-widest">
                <span>/// DEVNEXUS_v2.0</span>
                <span>/// AI_POWERED</span>
                <span>/// STUDENT_CENTRIC</span>
                <span>/// CAREER_ACCELERATION</span>
                <span>/// DEVNEXUS_v2.0</span>
                <span>/// AI_POWERED</span>
                <span>/// STUDENT_CENTRIC</span>
                <span>/// CAREER_ACCELERATION</span>
                <span>/// DEVNEXUS_v2.0</span>
                <span>/// AI_POWERED</span>
                <span>/// STUDENT_CENTRIC</span>
                <span>/// CAREER_ACCELERATION</span>
            </div>
        </div>

        <section id="modules" class="container mx-auto px-6 py-24 relative z-10">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-black text-[#2c4c52] mb-4 uppercase tracking-tighter">
                    System <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">Modules</span>
                </h2>
                <div class="w-24 h-2 bg-[#2c4c52] mx-auto"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div v-for="(item, index) in features" :key="index" 
                     class="group relative bg-white/40 backdrop-blur-sm border border-white/80 p-8 rounded-3xl hover:bg-white/60 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(123,197,205,0.4)]">
                    
                    <div class="absolute inset-0 bg-gradient-to-br from-[#7bc5cd]/20 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity"></div>
                    
                    <div class="relative z-10">
                        <div class="w-16 h-16 bg-[#2c4c52] rounded-2xl flex items-center justify-center mb-6 text-[#7bc5cd] text-2xl shadow-lg group-hover:scale-110 transition-transform">
                            <i :class="item.icon"></i>
                        </div>
                        <h3 class="text-2xl font-black text-[#2c4c52] mb-2 font-mono uppercase">{{ item.title }}</h3>
                        <p class="text-[#4a7a82] font-medium">{{ item.desc }}</p>
                    </div>
                    
                    <div class="absolute top-4 right-4 text-[#2c4c52]/20 font-mono font-bold">0{{ index + 1 }}</div>
                    <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#7bc5cd] rounded-br-2xl"></div>
                </div>
            </div>
        </section>

        <footer class="bg-white/50 backdrop-blur-md border-t border-[#7bc5cd]/30 py-12 relative z-10">
            <div class="container mx-auto px-6 text-center">
                <div class="mb-8">
                    <component :is="StarIcon" class="w-12 h-12 text-[#2c4c52] mx-auto mb-4" />
                    <h2 class="text-3xl font-black text-[#2c4c52] mb-6">INITIALIZE YOUR JOURNEY</h2>
                    <Button label="CREATE ACCOUNT" class="y2k-button-primary !text-xl !px-12 !py-4" />
                </div>
                
                <div class="flex justify-center gap-6 mt-12 text-[#2c4c52]/60 font-mono text-sm">
                    <a href="#" class="hover:text-[#2c4c52]">COPYRIGHT_2025</a>
                    <span>//</span>
                    <a href="#" class="hover:text-[#2c4c52]">PRIVACY_PROTOCOL</a>
                    <span>//</span>
                    <a href="#" class="hover:text-[#2c4c52]">SYSTEM_STATUS</a>
                </div>
            </div>
        </footer>

    </div>
</template>

<style scoped>
/* Y2K Button Styles Override */
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 15px rgba(44, 76, 82, 0.3);
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(44, 76, 82, 0.4);
    filter: brightness(1.1);
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

/* Brutalist Button */
.y2k-brutalist-btn {
    box-shadow: 6px 6px 0px 0px rgba(123, 197, 205, 1);
    transition: all 0.1s;
}
.y2k-brutalist-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0px 0px rgba(123, 197, 205, 1);
}

/* Marquee Animation */
.animate-marquee {
    animation: marquee 20s linear infinite;
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* Hide PrimeVue default button focus rings for cleaner Y2K look */
:deep(.p-button:focus) {
    box-shadow: none;
}
</style>