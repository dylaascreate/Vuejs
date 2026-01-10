<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const lastUpdated = ref(new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
}));

// State for scroll detection
const scrollContainer = ref(null);
const canProceed = ref(false);

const protocols = ref([
    {
        id: '01',
        title: 'ACCESS_CONTROL',
        content: 'Users are responsible for maintaining the confidentiality of their authentication keys (passwords). Any unauthorized access detected via your node ID (account) is your sole liability. The System Admin reserves the right to terminate connections exhibiting suspicious latency or unauthorized payload injection.'
    },
    {
        id: '02',
        title: 'DATA_INTEGRITY',
        content: 'Content transmitted through DevNexus (Roadmaps, Resumes) remains the intellectual property of the creator. However, by uploading, you grant the System a non-exclusive, worldwide license to parse, index, and display this data for optimization purposes.'
    },
    {
        id: '03',
        title: 'SYSTEM_STABILITY',
        content: 'Users strictly prohibited from: (a) Reverse engineering the neural engine or source code. (b) Deploying bots, scrapers, or overload attacks (DDoS). (c) Injecting malicious scripts (XSS/SQLi) into the input streams. Violation results in immediate IP blacklisting.'
    },
    {
        id: '04',
        title: 'LIMITATION_OF_LIABILITY',
        content: 'The System is provided "as-is" without warranty of any kind. DevNexus is not liable for data loss, career roadmap deviations, or downtime caused by server outages or AI hallucinations. Use the generated blueprints at your own risk.'
    },
    {
        id: '05',
        title: 'PROTOCOL_UPDATES',
        content: 'System protocols may be patched (updated) at any time. Continued usage of the interface constitutes acceptance of the new patch version. Critical updates will be broadcasted via the main dashboard channel.'
    }
]);

// Scroll Handler
const handleScroll = () => {
    const el = scrollContainer.value;
    if (el) {
        // Check if user is near the bottom (allow 20px threshold)
        const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;

        if (isAtBottom) {
            canProceed.value = true;
        }
    }
};

// Check on load (in case content fits without scrolling)
onMounted(() => {
    if (scrollContainer.value) {
        if (scrollContainer.value.scrollHeight <= scrollContainer.value.clientHeight) {
            canProceed.value = true;
        }
    }
});

const proceedToRegister = () => {
    if (!canProceed.value) return;

    toast.add({ severity: 'success', summary: 'Protocols Accepted', detail: 'Redirecting to registration...', life: 1500 });

    setTimeout(() => {
        router.push('/auth/register');
    }, 1000);
};
</script>

<template>
    <div class="relative min-h-screen font-sans text-[#2c4c52] flex items-center justify-center p-4">

        <Toast />

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="relative z-10 w-full max-w-4xl">

            <div class="text-center mb-8">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2c4c52] text-white shadow-lg mb-4 border border-[#7bc5cd]/30">
                    <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span class="font-mono text-xs font-bold tracking-widest uppercase">SECURE_CONNECTION_ESTABLISHED</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#2c4c52]">System Protocols</h1>
                <p class="text-[#4a7a82] font-mono text-xs mt-2 font-bold uppercase">Last Patch: {{ lastUpdated }}</p>
            </div>

            <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-1 rounded-[2rem] shadow-2xl">
                <div class="bg-white/40 border border-[#2c4c52]/10 rounded-[1.8rem] overflow-hidden flex flex-col h-[60vh] md:h-[500px]">

                    <div class="bg-[#2c4c52] p-4 flex justify-between items-center text-white/80 border-b border-white/10 shrink-0">
                        <div class="flex gap-2">
                            <div class="w-3 h-3 rounded-full bg-red-400"></div>
                            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div class="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div class="font-mono text-xs opacity-50">/root/legal/terms_of_service.log</div>
                        <i class="pi pi-lock text-xs"></i>
                    </div>

                    <div ref="scrollContainer"
                         @scroll="handleScroll"
                         class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 scroll-smooth">

                        <div v-for="item in protocols" :key="item.id" class="relative pl-6 md:pl-0">
                            <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#2c4c52]/10 md:hidden"></div>

                            <div class="flex flex-col md:flex-row gap-4 md:gap-8 items-start group">
                                <div class="hidden md:flex flex-col items-center gap-1 min-w-[60px]">
                                    <span class="font-black text-2xl text-[#2c4c52]/20 group-hover:text-[#7bc5cd] transition-colors">{{ item.id }}</span>
                                </div>

                                <div class="flex-1">
                                    <h3 class="font-black text-[#2c4c52] uppercase text-lg mb-2 flex items-center gap-2">
                                        <i class="pi pi-hashtag text-xs text-[#7bc5cd] md:hidden"></i>
                                        {{ item.title }}
                                    </h3>
                                    <p class="text-sm text-[#4a7a82] leading-relaxed font-medium">
                                        {{ item.content }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="text-center pt-8 opacity-50">
                            <span class="font-mono text-xs text-[#2c4c52] tracking-widest">--- END OF TRANSMISSION ---</span>
                        </div>

                    </div>

                    <div class="p-6 bg-white/50 border-t border-[#2c4c52]/10 backdrop-blur-md shrink-0">
                        <div class="flex flex-col md:flex-row items-center justify-between gap-4">

                            <div class="text-xs font-mono font-bold uppercase transition-colors"
                                  :class="canProceed ? 'text-green-600' : 'text-[#2c4c52]/40 animate-pulse'">
                                <i :class="canProceed ? 'pi pi-check-circle' : 'pi pi-arrow-down'"></i>
                                {{ canProceed ? ' Protocols Acknowledged' : ' Scroll to bottom to accept' }}
                             </div>

                            <Button label="INITIALIZE CONNECTION"
                                    icon="pi pi-user-plus"
                                    :disabled="!canProceed"
                                    class="w-full md:w-auto !rounded-full !font-black !text-xs !py-3 !px-6 transition-all duration-300"
                                    :class="canProceed
                                        ? '!bg-[#2c4c52] !text-[#7bc5cd] !border-[#2c4c52] hover:brightness-110 shadow-lg'
                                        : '!bg-gray-300 !text-gray-500 !border-gray-300 cursor-not-allowed grayscale'"
                                    @click="proceedToRegister" />
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Custom Scrollbar for the "Terminal" feel */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(44, 76, 82, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #2c4c52;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #7bc5cd;
}
</style>
