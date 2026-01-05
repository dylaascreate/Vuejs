<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '@/lib/axios';

const toast = useToast();

const POLL_INTERVAL = 30000;

// --- State ---
const isChecking = ref(false);
const lastChecked = ref(new Date());
let pollingTimer = null;

// 1. Custom Model Status
const customModelStatus = ref({
    name: 'DevNexus Core',
    filename: 'devnexus.pkl',
    status: 'unknown',
    size: '0 MB',
    integrity: '-',
    latency: 0
});

// 2. Ollama AI Engine
const ollamaStatus = ref({
    name: 'Ollama Engine',
    model: 'Unknown',
    status: 'unknown',
    latency: 0,
    uptime: '-'
});

// 3. Flask API
const flaskStatus = ref({
    name: 'Flask AI Gateway',
    version: '-',
    python_version: '-',
    status: 'unknown',
    latency: 0,
    host: 'localhost:5000',
    connections: 0
});

// 4. Laravel API
const laravelStatus = ref({
    name: 'Laravel Core API',
    version: '-',
    php: '-',
    status: 'unknown',
    latency: 0,
    host: 'localhost:8000',
    queue: '-'
});

// 5. PostgreSQL Database
const pgsqlStatus = ref({
    name: 'PostgreSQL DB',
    version: '-',
    status: 'unknown',
    latency: 0,
    connections: 0,
    size: '-'
});

const services = ref([
    { id: 'roadmap', name: 'Roadmap Generator', icon: 'pi-map', status: 'unknown', latency: 0 },
    { id: 'cv', name: 'CV Evaluator', icon: 'pi-file-check', status: 'unknown', latency: 0 },
    { id: 'quiz', name: 'Quiz Generator', icon: 'pi-question-circle', status: 'unknown', latency: 0 },
    { id: 'chat', name: 'AI Chat Helper', icon: 'pi-comments', status: 'unknown', latency: 0 },
    { id: 'skill', name: 'Skill Recommender', icon: 'pi-bolt', status: 'unknown', latency: 0 },
    // These specific services are not in monitor.py yet, so they will default to unknown
    { id: 'career', name: 'Career Recommender', icon: 'pi-compass', status: 'unknown', latency: 0 },
    { id: 'gap_analysis', name: 'Skill Gap Analyzer', icon: 'pi-chart-bar', status: 'unknown', latency: 0 },
    { id: 'project', name: 'Project Recommender', icon: 'pi-box', status: 'unknown', latency: 0 }
]);

const logs = ref([]);

// --- Computed ---
const overallHealth = computed(() => {
    if (flaskStatus.value.status === 'outage') return 'CRITICAL FAILURE';
    if (ollamaStatus.value.status === 'outage') return 'AI ENGINE DOWN';
    if (customModelStatus.value.status === 'corrupt') return 'MODEL CORRUPT';

    const down = services.value.filter(s => s.status === 'outage').length;
    const degraded = services.value.filter(s => s.status === 'degraded').length;

    if (down > 0) return 'PARTIAL OUTAGE';
    if (degraded > 0) return 'DEGRADED';
    if (flaskStatus.value.status === 'unknown') return 'CONNECTING...';

    return 'OPERATIONAL';
});

const statusColor = computed(() => {
    switch(overallHealth.value) {
        case 'OPERATIONAL': return 'bg-green-500';
        case 'DEGRADED': return 'bg-yellow-500';
        case 'CONNECTING...': return 'bg-gray-400';
        default: return 'bg-red-500';
    }
});

// --- Actions ---

const parseLatency = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseInt(val.replace('ms', '')) || 0;
    return 0;
};

const addLog = (level, msg) => {
    const timeStr = new Date().toLocaleTimeString();
    logs.value.unshift({ time: timeStr, level, msg });
    if (logs.value.length > 50) logs.value.pop();
};

const checkSystemStatus = async () => {
    isChecking.value = true;

    try {
        const response = await axios.get('/api/system-status');
        const data = response.data;
        const core = data.core || {};

        // 1. Update Core Components
        if (core.laravel) {
            laravelStatus.value = { ...laravelStatus.value, ...core.laravel, latency: parseLatency(core.laravel.latency) };
        }
        if (core.postgres) {
            pgsqlStatus.value = { ...pgsqlStatus.value, ...core.postgres, latency: parseLatency(core.postgres.latency) };
        }
        if (core.flask) {
            flaskStatus.value = { ...flaskStatus.value, ...core.flask, latency: parseLatency(core.flask.latency) };
        }
        if (core.ollama) {
            ollamaStatus.value = { ...ollamaStatus.value, ...core.ollama, latency: parseLatency(core.ollama.latency) };
        }

        // 2. Update Custom Model
        if (core.custom_model) {
            const cm = core.custom_model;
            // Handle new nested structure if details exist
            const details = cm.details || {};
            customModelStatus.value = {
                ...customModelStatus.value,
                status: cm.status,
                latency: parseLatency(cm.latency),
                filename: details.file || cm.file || 'devnexus.pkl',
                size: details.size || cm.size || '0 MB',
                integrity: details.integrity || cm.integrity || '-'
            };
        }

        // 3. Update Microservices (Map Frontend ID -> Backend Key)
        const backendServices = data.services || {};

        // Mapping: [Frontend ID] : [Backend JSON Key]
        const serviceMap = {
            'roadmap': 'roadmap_generator',
            'cv': 'cv_ats_scorer',
            'quiz': 'quiz_generator',
            'chat': 'website_chatbot',
            'skill': 'skill_recommender',
            'career': 'career_recommender',
            'gap_analysis': 'skill_gap',
            'project': 'project_recommender'

        };

        services.value.forEach(localService => {
            const backendKey = serviceMap[localService.id];

            // Only update if the backend actually sends data for this service
            if (backendKey && backendServices[backendKey]) {
                const remoteData = backendServices[backendKey];
                localService.status = remoteData.status;
                localService.latency = parseLatency(remoteData.latency);
            } else {
                // Keep 'unknown' or previous state for services not yet monitored
            }
        });

        addLog('INFO', 'System telemetry synchronized');
        lastChecked.value = new Date();

    } catch (error) {
        console.error("Health Check Failed:", error);

        flaskStatus.value.status = 'outage';
        ollamaStatus.value.status = 'unknown';
        customModelStatus.value.status = 'offline';

        // Mark monitored services as unknown/outage on failure
        services.value.forEach(s => s.status = 'unknown');

        const errorMsg = error.response?.data?.message || error.message;
        addLog('ERR', `Gateway Connection Failed: ${errorMsg}`);
    } finally {
        isChecking.value = false;
    }
};

const getServiceColor = (status) => {
    if (status === 'operational') return 'text-green-600 bg-green-100';
    if (status === 'degraded') return 'text-yellow-600 bg-yellow-100';
    if (status === 'outage' || status === 'offline') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
};

onMounted(() => {
    checkSystemStatus();
    pollingTimer = setInterval(checkSystemStatus, POLL_INTERVAL);
});

onUnmounted(() => {
    if (pollingTimer) clearInterval(pollingTimer);
});
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="relative z-10 p-4 max-w-7xl mx-auto flex flex-col gap-6">

            <div class="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-server text-xs"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">INFRA_MONITOR_V2.1</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">System Status</h2>
                </div>

                <div class="text-right">
                    <div class="text-xs font-mono font-bold text-[#4a7a82] uppercase mb-1">Last Scan</div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-[#2c4c52]">{{ lastChecked.toLocaleTimeString() }}</span>
                        <Button icon="pi pi-refresh" rounded text
                                :class="{'animate-spin': isChecking}"
                                class="!w-8 !h-8 !bg-[#2c4c52] !text-[#7bc5cd] hover:brightness-110"
                                @click="checkSystemStatus" />
                    </div>
                </div>
            </div>

            <div class="relative overflow-hidden rounded-3xl p-8 flex items-center justify-between shadow-lg transition-colors duration-500"
                 :class="overallHealth === 'OPERATIONAL' ? 'bg-[#2c4c52] text-white' : (overallHealth.includes('CRITICAL') ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white')">

                <div class="absolute inset-0 opacity-10 pointer-events-none"
                     style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;">
                </div>

                <div class="relative z-10 flex items-center gap-6">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500"
                         :class="overallHealth === 'OPERATIONAL' ? 'bg-[#7bc5cd]/20 ' : 'bg-white/20'">
                        <i class="pi text-3xl" :class="overallHealth === 'OPERATIONAL' ? 'pi-check-circle text-[#7bc5cd]' : 'pi-exclamation-triangle text-white'"></i>
                    </div>
                    <div>
                        <div class="font-mono text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Global System Health</div>
                        <h1 class="text-3xl !text-white uppercase tracking-tight">{{ overallHealth }}</h1>
                    </div>
                </div>

                <div class="relative hidden md:block">
                    <div class="w-4 h-4 rounded-full animate-ping absolute" :class="statusColor"></div>
                    <div class="w-4 h-4 rounded-full relative" :class="statusColor"></div>
                </div>
            </div>

            <h3 class="font-black text-[#2c4c52] uppercase tracking-tight text-xl mt-2">Core Infrastructure</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-teal-500/20 transition-all"></div>

                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-3 bg-teal-100 text-teal-700 rounded-xl shadow-sm">
                            <i class="pi pi-microchip text-xl"></i>
                        </div>
                        <div class="text-right">
                             <Tag :value="customModelStatus.status.toUpperCase()"
                                 :severity="customModelStatus.status === 'operational' ? 'success' : (customModelStatus.status === 'loading' ? 'warn' : 'danger')"
                                 class="!font-mono !text-[10px] mb-1" />
                             <div class="text-[10px] font-mono text-[#4a7a82]">Custom Pickle Model</div>
                        </div>
                    </div>
                    <h3 class="font-black text-[#2c4c52] text-lg">{{ customModelStatus.name }}</h3>
                    <p class="text-xs font-mono text-[#4a7a82] mb-6">{{ customModelStatus.filename }} ({{ customModelStatus.size }})</p>

                    <div class="space-y-3 relative z-10">
                        <div class="flex justify-between text-sm border-b border-[#2c4c52]/10 pb-2">
                            <span class="text-[#4a7a82]">Loaded Status</span>
                            <span class="font-bold" :class="customModelStatus.integrity ? 'text-green-600' : 'text-red-500'">{{ customModelStatus.integrity ? 'Loaded' : 'Not Loaded' }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-[#4a7a82]">Inference Latency</span>
                            <span class="font-mono font-bold text-[#2c4c52]">{{ customModelStatus.latency }}ms</span>
                        </div>
                        <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-teal-500 rounded-full animate-pulse" style="width: 75%"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <i class="pi pi-code text-xl"></i>
                        </div>
                        <div class="text-right">
                             <Tag :value="flaskStatus.status.toUpperCase()"
                                 :severity="flaskStatus.status === 'operational' ? 'success' : (flaskStatus.status === 'unknown' ? 'secondary' : 'danger')"
                                 class="!font-mono !text-[10px] mb-1" />
                             <div class="text-[10px] font-mono text-[#4a7a82]">Python / Gateway</div>
                        </div>
                    </div>
                    <h3 class="font-black text-[#2c4c52] text-lg">{{ flaskStatus.name }}</h3>
                    <p class="text-xs font-mono text-[#4a7a82] mb-6">{{ flaskStatus.version }} (Python {{ flaskStatus.python_version }})</p>

                    <div class="space-y-3">
                        <div class="flex justify-between text-sm border-b border-[#2c4c52]/10 pb-2">
                            <span class="text-[#4a7a82]">Active Threads</span>
                            <span class="font-bold text-[#2c4c52]">{{ flaskStatus.connections }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-[#4a7a82]">Latency</span>
                            <span class="font-mono font-bold text-[#2c4c52]">{{ flaskStatus.latency }}ms</span>
                        </div>
                        <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full animate-pulse" style="width: 25%"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <i class="pi pi-box text-xl"></i>
                        </div>
                         <div class="text-right">
                             <Tag :value="ollamaStatus.status.toUpperCase()"
                                 :severity="ollamaStatus.status === 'operational' ? 'success' : 'danger'"
                                 class="!font-mono !text-[10px] mb-1" />
                             <div class="text-[10px] font-mono text-[#4a7a82]">LLM Inference</div>
                        </div>
                    </div>
                    <h3 class="font-black text-[#2c4c52] text-lg">{{ ollamaStatus.name }}</h3>
                    <p class="text-xs font-mono text-[#4a7a82] mb-6">Model: {{ ollamaStatus.model }}</p>

                    <div class="space-y-3">
                        <div class="flex justify-between text-sm border-b border-[#2c4c52]/10 pb-2">
                            <span class="text-[#4a7a82]">Uptime</span>
                            <span class="font-bold text-[#2c4c52]">{{ ollamaStatus.uptime }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-[#4a7a82]">Latency</span>
                            <span class="font-mono font-bold text-[#2c4c52]">{{ ollamaStatus.latency }}ms</span>
                        </div>
                        <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-purple-500 rounded-full animate-pulse" style="width: 45%"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-3 bg-red-100 text-red-600 rounded-xl">
                            <i class="pi pi-server text-xl"></i>
                        </div>
                        <div class="text-right">
                             <Tag :value="laravelStatus.status.toUpperCase()"
                                 :severity="laravelStatus.status === 'operational' ? 'success' : 'danger'"
                                 class="!font-mono !text-[10px] mb-1" />
                             <div class="text-[10px] font-mono text-[#4a7a82]">PHP / Main API</div>
                        </div>
                    </div>
                    <h3 class="font-black text-[#2c4c52] text-lg">{{ laravelStatus.name }}</h3>
                    <p class="text-xs font-mono text-[#4a7a82] mb-6">{{ laravelStatus.version }} (PHP {{ laravelStatus.php }})</p>

                    <div class="space-y-3">
                        <div class="flex justify-between text-sm border-b border-[#2c4c52]/10 pb-2">
                            <span class="text-[#4a7a82]">Queue Worker</span>
                            <span class="font-bold text-[#2c4c52]">{{ laravelStatus.queue }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-[#4a7a82]">Latency</span>
                            <span class="font-mono font-bold text-[#2c4c52]">{{ laravelStatus.latency }}ms</span>
                        </div>
                        <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-red-500 rounded-full animate-pulse" style="width: 35%"></div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-3 bg-blue-100 text-blue-800 rounded-xl">
                            <i class="pi pi-database text-xl"></i>
                        </div>
                        <div class="text-right">
                             <Tag :value="pgsqlStatus.status.toUpperCase()"
                                 :severity="pgsqlStatus.status === 'operational' ? 'success' : 'danger'"
                                 class="!font-mono !text-[10px] mb-1" />
                             <div class="text-[10px] font-mono text-[#4a7a82]">RDBMS</div>
                        </div>
                    </div>
                    <h3 class="font-black text-[#2c4c52] text-lg">{{ pgsqlStatus.name }}</h3>
                    <p class="text-xs font-mono text-[#4a7a82] mb-6">v{{ pgsqlStatus.version }} - {{ pgsqlStatus.size }}</p>

                    <div class="space-y-3">
                        <div class="flex justify-between text-sm border-b border-[#2c4c52]/10 pb-2">
                            <span class="text-[#4a7a82]">Active Connections</span>
                            <span class="font-bold text-[#2c4c52]">{{ pgsqlStatus.connections }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-[#4a7a82]">Query Latency</span>
                            <span class="font-mono font-bold text-[#2c4c52]">{{ pgsqlStatus.latency }}ms</span>
                        </div>
                        <div class="h-1.5 w-full bg-[#2c4c52]/5 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-blue-800 rounded-full animate-pulse" style="width: 15%"></div>
                        </div>
                    </div>
                </div>

            </div>

            <h3 class="font-black text-[#2c4c52] uppercase tracking-tight text-xl mt-2">AI Microservices & Agents</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="service in services" :key="service.id"
                        class="bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-2xl hover:shadow-md transition-all flex items-center gap-4">

                    <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm text-[#2c4c52]">
                        <i :class="['pi', service.icon]"></i>
                    </div>

                    <div class="flex-1">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-sm text-[#2c4c52]">{{ service.name }}</span>
                            <span class="w-2 h-2 rounded-full"
                                    :class="service.status === 'operational' ? 'bg-green-500' : (service.status === 'degraded' ? 'bg-yellow-500' : (service.status === 'unknown' ? 'bg-gray-400' : 'bg-red-500'))">
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded" :class="getServiceColor(service.status)">
                                {{ service.status }}
                            </span>
                            <span class="text-[10px] font-mono text-[#4a7a82]">
                                {{ service.latency }}ms
                            </span>
                        </div>
                        <div class="h-1 w-full bg-[#2c4c52]/5 rounded-full mt-2 overflow-hidden">
                            <div class="h-full bg-[#2c4c52]/30" :style="{ width: Math.min(100, (service.latency / 10)) + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-[#1a2c30] p-6 rounded-3xl shadow-inner font-mono text-xs overflow-hidden border border-[#2c4c52]/50 mt-4">
                <div class="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <i class="pi pi-terminal text-[#7bc5cd]"></i>
                    <span class="font-bold text-[#7bc5cd] uppercase tracking-wider">Live System Logs</span>
                </div>
                <div class="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    <div v-for="(log, i) in logs" :key="i" class="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors">
                        <span class="text-[#4a7a82] min-w-[60px]">{{ log.time }}</span>
                        <span class="font-bold min-w-[50px]"
                              :class="log.level === 'INFO' ? 'text-[#7bc5cd]' : (log.level === 'WARN' ? 'text-yellow-400' : (log.level === 'ERR' ? 'text-red-400' : 'text-gray-300'))">
                            [{{ log.level }}]
                        </span>
                        <span class="text-gray-300">{{ log.msg }}</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #2c4c52;
    border-radius: 10px;
}
</style>
