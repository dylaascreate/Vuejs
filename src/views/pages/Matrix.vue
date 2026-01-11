<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/lib/axios';

const router = useRouter();

// --- STATE ---
const activeTab = ref('PLAYGROUND'); // Default to Playground for easy testing
const oracleResult = ref(null);
const binaryInput = ref('');
const canvasRef = ref(null);

// --- AI MICRO-TOOLS STATE (Neural Uplink) ---
const activeAiTool = ref('SUGGEST');
const aiInput = ref('');
const aiLoading = ref(false);
const aiResult = ref(null);
const atsFile = ref(null);

// --- QUIZ STATE (New Dedicated Box) ---
const quizTopic = ref('');
const quizLoading = ref(false);
const quizStep = ref('SETUP'); // SETUP, TAKING, RESULT
const quizData = ref(null);
const userAnswers = ref({});
const gradingResult = ref(null);

// --- 1. MATRIX RAIN EFFECT ---
let intervalId = null;

const initMatrixRain = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '01'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
        ctx.fillStyle = 'rgba(15, 23, 25, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7bc5cd';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    };
    intervalId = setInterval(draw, 33);
};

// --- 2. ORACLE & BINARY (UNCHANGED) ---
const archetypes = [
    { title: 'The Void Architect', desc: 'You build backend systems that are invisible yet hold the world together.', icon: 'pi pi-database' },
    { title: 'The Pixel Weaver', desc: 'You manipulate light and geometry to create stunning frontends.', icon: 'pi pi-palette' },
    { title: 'The Bug Whisperer', desc: 'Code breaks in your presence, but you know exactly how to fix it.', icon: 'pi pi-wrench' },
    { title: 'The Neural Prophet', desc: 'You speak the language of AI and data tensors.', icon: 'pi pi-bolt' },
];

const consultOracle = () => {
    oracleResult.value = { title: 'ANALYZING_AURA...', desc: 'Scanning GitHub repositories...', icon: 'pi pi-spin pi-spinner' };
    setTimeout(() => {
        oracleResult.value = archetypes[Math.floor(Math.random() * archetypes.length)];
    }, 1500);
};

const binaryOutput = computed(() => {
    if (!binaryInput.value) return '';
    return binaryInput.value.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
});

// --- 3. AI TOOLS LOGIC (NEURAL UPLINK) ---
const runAiTool = async () => {
    aiLoading.value = true;
    aiResult.value = null;

    try {
        let response;
        // A. SKILL EXPANDER
        if (activeAiTool.value === 'EXPAND') {
            if (!aiInput.value) throw new Error("Skill name required");
            response = await axios.post('/api/ai/skill-expand', { skill: aiInput.value, level: 'Beginner' });
            if (response.data.status === 'success') aiResult.value = response.data.data;
        }
        // B. CAREER SUGGESTIONS
        else if (activeAiTool.value === 'SUGGEST') {
            if (!aiInput.value) throw new Error("Job Title required");
            response = await axios.post('/api/ai/suggest-skills', { career: aiInput.value, level: 'Junior' });
            if (response.data.status === 'success') aiResult.value = response.data.data;
        }
        // C. ATS SCANNER
        else if (activeAiTool.value === 'ATS') {
            if (!atsFile.value || !aiInput.value) throw new Error("File and Job Desc required");
            const formData = new FormData();
            formData.append('cv_file', atsFile.value);
            formData.append('job_description', aiInput.value);
            response = await axios.post('/api/ai/score-cv', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            if (response.data.data) aiResult.value = response.data.data;
        }

    } catch (error) {
        console.error(error);
        aiResult.value = { error: 'NEURAL_LINK_FAILED: ' + (error.message || 'Server Unreachable') };
    } finally {
        aiLoading.value = false;
    }
};

const handleFileUpload = (event) => {
    atsFile.value = event.target.files[0];
};

// --- 4. QUIZ LOGIC (NEW) ---
const runQuiz = async () => {
    if (!quizTopic.value) return;
    quizLoading.value = true;
    userAnswers.value = {};
    gradingResult.value = null;

    try {
        // Step 1: Generate Quiz
        const response = await axios.post('/api/ai/quiz', { query: quizTopic.value });
        if (response.data.status === 'success') {
            quizData.value = response.data.data;
            quizStep.value = 'TAKING';
        }
    } catch (error) {
        console.error("Quiz Gen Failed", error);
        alert("Failed to generate simulation.");
    } finally {
        quizLoading.value = false;
    }
};

const submitQuiz = async () => {
    if (!quizData.value) return;
    quizLoading.value = true;

    try {
        // Step 2: Grade Quiz
        const payload = {
            user_answers: userAnswers.value,
            original_quiz: quizData.value.questions
        };
        const response = await axios.post('/api/ai/grade-quiz', payload);
        if (response.data.status === 'success') {
            gradingResult.value = response.data;
            quizStep.value = 'RESULT';
        }
    } catch (error) {
        console.error("Grading Failed", error);
        alert("Failed to grade answers.");
    } finally {
        quizLoading.value = false;
    }
};

const resetQuiz = () => {
    quizStep.value = 'SETUP';
    quizData.value = null;
    userAnswers.value = {};
    gradingResult.value = null;
    quizTopic.value = '';
};


// --- LIFECYCLE ---
onMounted(() => {
    initMatrixRain();
    window.addEventListener('resize', initMatrixRain);
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener('resize', initMatrixRain);
});

const features = [
    { title: 'AI Roadmaps', desc: 'Dynamic learning paths generated by Ollama AI based on your career goals.', icon: 'pi pi-map' },
    { title: 'Academic Sync', desc: 'Upload university syllabus files to align industry skills with grades.', icon: 'pi pi-graduation-cap' },
    { title: 'Skill Gap Matrix', desc: 'Compare your current abilities against thousands of job descriptions.', icon: 'pi pi-chart-bar' },
];
</script>

<template>
    <div class="relative min-h-screen w-full overflow-hidden font-sans text-[#2c4c52] bg-[#0f1719]">
        <canvas ref="canvasRef" class="absolute inset-0 z-0 opacity-20 pointer-events-none"></canvas>
        <div class="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#7bc5cd]/5 to-[#0f1719] pointer-events-none"></div>

        <div class="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col">

            <div class="w-full flex flex-col items-center text-center mb-12 animate-fade-in-down">
                <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#7bc5cd]/10 border border-[#7bc5cd]/30 backdrop-blur-md mb-4">
                    <i class="pi pi-code text-[#7bc5cd] text-xs"></i>
                    <span class="font-mono text-xs font-bold text-[#7bc5cd] tracking-[0.2em] uppercase">DevNexus_V1.0</span>
                </div>
                <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 glow-text">
                    The <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-white">Matrix</span>
                </h1>
                <p class="text-[#7bc5cd]/70 font-mono text-sm md:text-base max-w-2xl text-center">
                    Decode your potential. Bridge the gap between Academic Theory and Industry Reality.
                </p>
                <Button label="RETURN_HOME" icon="pi pi-arrow-left" class="p-button-text !font-mono !font-bold !text-[#2c4c52]" @click="router.push('/landing')" />
            </div>

            <div class="flex justify-center gap-4 mb-12">
                <button @click="activeTab = 'SYSTEM_CORE'"
                    class="px-6 py-3 rounded-full font-mono text-sm font-bold uppercase transition-all duration-300 border backdrop-blur-md"
                    :class="activeTab === 'SYSTEM_CORE' ? 'bg-[#7bc5cd] text-[#0f1719] border-[#7bc5cd] shadow-[0_0_20px_rgba(123,197,205,0.4)]' : 'bg-white/5 text-[#7bc5cd] border-white/10 hover:bg-white/10'">
                    System_Core
                </button>
                <button @click="activeTab = 'PLAYGROUND'"
                    class="px-6 py-3 rounded-full font-mono text-sm font-bold uppercase transition-all duration-300 border backdrop-blur-md"
                    :class="activeTab === 'PLAYGROUND' ? 'bg-[#7bc5cd] text-[#0f1719] border-[#7bc5cd] shadow-[0_0_20px_rgba(123,197,205,0.4)]' : 'bg-white/5 text-[#7bc5cd] border-white/10 hover:bg-white/10'">
                    Guest_Playground
                </button>
            </div>

            <div v-if="activeTab === 'SYSTEM_CORE'" class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in-up">
                <div v-for="(feat, i) in features" :key="i"
                     class="group relative bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:border-[#7bc5cd]/50">
                    <div class="w-14 h-14 rounded-2xl bg-[#7bc5cd]/10 flex items-center justify-center mb-6 group-hover:bg-[#7bc5cd] transition-colors duration-300">
                        <i :class="feat.icon" class="text-2xl text-[#7bc5cd] group-hover:text-[#0f1719]"></i>
                    </div>
                    <h3 class="text-xl font-black text-white uppercase mb-2">{{ feat.title }}</h3>
                    <p class="text-[#7bc5cd]/60 text-sm leading-relaxed">{{ feat.desc }}</p>
                </div>
                <div class="md:col-span-3 mt-8 text-center p-12 bg-gradient-to-r from-[#7bc5cd]/10 to-transparent border border-[#7bc5cd]/20 rounded-3xl backdrop-blur-md">
                    <h2 class="text-2xl font-bold text-white uppercase mb-4">Ready to Jack In?</h2>
                    <button @click="router.push('/auth/login')" class="px-8 py-3 rounded-full bg-[#7bc5cd] text-[#0f1719] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(123,197,205,0.3)]">
                        Initialize User Protocol
                    </button>
                </div>
            </div>

            <div v-if="activeTab === 'PLAYGROUND'" class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in-up">

                <div class="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-xl font-black text-white uppercase flex items-center gap-2">
                                <i class="pi pi-eye text-[#7bc5cd]"></i> The Oracle
                            </h3>
                            <span class="text-[10px] font-mono text-[#7bc5cd]/50 border border-[#7bc5cd]/20 px-2 py-1 rounded">V1.0</span>
                        </div>
                        <p class="text-[#7bc5cd]/60 text-sm mb-8">
                            Unsure of your path? Let the algorithm analyze your digital signature and assign you a developer archetype.
                        </p>
                        <div v-if="oracleResult" class="bg-[#0f1719]/50 border border-[#7bc5cd]/20 p-6 rounded-2xl mb-6 text-center animate-pulse-once">
                            <i :class="oracleResult.icon" class="text-3xl text-[#7bc5cd] mb-3 block"></i>
                            <div class="text-lg font-bold text-white uppercase mb-1">{{ oracleResult.title }}</div>
                            <div class="text-xs font-mono text-[#7bc5cd]">{{ oracleResult.desc }}</div>
                        </div>
                    </div>
                    <button @click="consultOracle" class="w-full py-3 rounded-xl border border-[#7bc5cd] text-[#7bc5cd] font-bold uppercase hover:bg-[#7bc5cd] hover:text-[#0f1719] transition-all">
                        Analyze My Aura
                    </button>
                </div>

                <div class="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-xl font-black text-white uppercase flex items-center gap-2">
                                <i class="pi pi-key text-[#7bc5cd]"></i> Binary Whisper
                            </h3>
                            <span class="text-[10px] font-mono text-[#7bc5cd]/50 border border-[#7bc5cd]/20 px-2 py-1 rounded">ENC_MOD</span>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-mono font-bold text-[#7bc5cd] uppercase block mb-1">Human Input</label>
                                <input v-model="binaryInput" type="text" placeholder="Type secret message..."
                                    class="w-full bg-[#0f1719]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7bc5cd] focus:outline-none placeholder:text-white/20 font-mono text-sm" />
                            </div>
                            <div>
                                <label class="text-[10px] font-mono font-bold text-[#7bc5cd] uppercase block mb-1">Machine Output</label>
                                <div class="w-full h-24 bg-[#0f1719]/80 border border-white/10 rounded-xl p-4 text-[#7bc5cd] font-mono text-xs break-all overflow-y-auto shadow-inner">
                                    {{ binaryOutput || 'WAITING_FOR_INPUT...' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl flex flex-col justify-between lg:col-span-2">
                    <div>
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-xl font-black text-white uppercase flex items-center gap-2">
                                <i class="pi pi-desktop text-[#7bc5cd]"></i> Simulation Chamber
                            </h3>
                            <button v-if="quizStep !== 'SETUP'" @click="resetQuiz" class="text-[10px] font-mono text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded transition-colors">ABORT_SIM</button>
                            <span v-else class="text-[10px] font-mono text-[#7bc5cd]/50 border border-[#7bc5cd]/20 px-2 py-1 rounded">V2.1</span>
                        </div>

                        <div v-if="quizStep === 'SETUP'" class="space-y-4">
                            <p class="text-[#7bc5cd]/60 text-sm">
                                Initiate a learning simulation. Enter any topic (e.g. "Docker", "Agile", "React State") or specific course (e.g. "DES3053", "DTS3093") to generate a dynamic assessment.
                            </p>
                            <div class="flex gap-4">
                                <input v-model="quizTopic" type="text" placeholder="Enter simulation parameters..."
                                    class="flex-grow bg-[#0f1719]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7bc5cd] focus:outline-none placeholder:text-white/20 font-mono text-sm" />
                                <button @click="runQuiz" :disabled="quizLoading" class="px-6 rounded-xl bg-[#7bc5cd] text-[#0f1719] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center min-w-[120px]">
                                    <i v-if="quizLoading" class="pi pi-spin pi-spinner"></i>
                                    <span v-else>INITIATE</span>
                                </button>
                            </div>
                        </div>

                        <div v-if="quizStep === 'TAKING'" class="space-y-6">
                            <div class="bg-[#0f1719]/50 border border-[#7bc5cd]/20 p-4 rounded-xl text-center mb-4">
                                <h4 class="text-white font-bold uppercase">{{ quizData.quiz_title }}</h4>
                            </div>
                            <div v-for="(q, idx) in quizData.questions" :key="q.id" class="p-4 bg-[#0f1719]/30 border border-white/5 rounded-xl">
                                <div class="text-[#7bc5cd] font-bold text-sm mb-3">Q{{ idx + 1 }}: {{ q.question }}</div>
                                <div class="space-y-2">
                                    <label v-for="opt in q.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
                                        <input type="radio" :name="'q'+q.id" :value="opt" v-model="userAnswers[q.id]" class="accent-[#7bc5cd]">
                                        <span class="text-xs text-[#7bc5cd]/70 group-hover:text-white transition-colors">{{ opt }}</span>
                                    </label>
                                </div>
                            </div>
                            <button @click="submitQuiz" :disabled="quizLoading" class="w-full py-3 rounded-xl bg-[#7bc5cd] text-[#0f1719] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center">
                                <i v-if="quizLoading" class="pi pi-spin pi-spinner mr-2"></i> SUBMIT_DATA
                            </button>
                        </div>

                        <div v-if="quizStep === 'RESULT'" class="space-y-6">
                            <div class="text-center p-6 bg-[#7bc5cd]/10 border border-[#7bc5cd] rounded-xl">
                                <div class="text-5xl font-black text-white mb-2">{{ gradingResult.percentage }}</div>
                                <div class="text-xs font-mono text-[#7bc5cd] uppercase">Performance Rating</div>
                                <div class="mt-4 text-sm text-white italic">"{{ gradingResult.feedback_summary }}"</div>
                            </div>

                            <div class="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                                <div v-for="res in gradingResult.detailed_results" :key="res.id"
                                    class="p-3 border rounded-lg text-xs"
                                    :class="res.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'">
                                    <div class="flex justify-between font-bold mb-1">
                                        <span :class="res.is_correct ? 'text-green-400' : 'text-red-400'">
                                            {{ res.is_correct ? 'CORRECT' : 'INCORRECT' }}
                                        </span>
                                    </div>
                                    <div class="text-[#7bc5cd]/70" v-if="!res.is_correct">
                                        {{ res.explanation }}
                                    </div>
                                </div>
                            </div>

                            <button @click="resetQuiz" class="w-full py-3 rounded-xl border border-[#7bc5cd] text-[#7bc5cd] font-bold uppercase hover:bg-[#7bc5cd] hover:text-[#0f1719] transition-all">
                                RESTART_SIMULATION
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl flex flex-col">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 class="text-xl font-black text-white uppercase flex items-center gap-2">
                            <i class="pi pi-bolt text-[#7bc5cd]"></i> Neural Uplink
                        </h3>
                        <div class="flex gap-2 p-1 bg-[#0f1719]/50 rounded-lg border border-white/10">
                            <button v-for="tool in ['EXPAND', 'SUGGEST', 'ATS']" :key="tool" @click="activeAiTool = tool; aiResult = null; aiInput = ''"
                                class="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
                                :class="activeAiTool === tool ? 'bg-[#7bc5cd] text-[#0f1719]' : 'text-[#7bc5cd]/50 hover:text-[#7bc5cd]'">
                                {{ tool === 'EXPAND' ? 'Skill_Exp' : tool === 'SUGGEST' ? 'Job_Rec' : 'CV_Scan' }}
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-4">
                            <p class="text-[#7bc5cd]/60 text-sm h-10">
                                {{ activeAiTool === 'EXPAND' ? 'Enter a tech stack to reveal its dependency tree.' :
                                   activeAiTool === 'SUGGEST' ? 'Enter a Target Career to see required skills.' :
                                   'Upload your Resume and Job Description for compatibility analysis.' }}
                            </p>

                            <div v-if="activeAiTool === 'ATS'" class="space-y-3">
                                <textarea v-model="aiInput" placeholder="Paste Job Description..." rows="3"
                                    class="w-full bg-[#0f1719]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7bc5cd] focus:outline-none placeholder:text-white/20 font-mono text-sm"></textarea>

                                <div class="relative group">
                                    <input type="file" @change="handleFileUpload" accept=".pdf,.txt" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div class="w-full py-3 border border-dashed border-[#7bc5cd]/30 rounded-xl text-center text-[#7bc5cd] text-xs font-mono group-hover:bg-[#7bc5cd]/10 transition-colors">
                                        {{ atsFile ? atsFile.name : '[UPLOAD_RESUME_FILE]' }}
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <input v-model="aiInput" type="text"
                                    :placeholder="activeAiTool === 'EXPAND' ? 'e.g. Laravel, React...' : 'e.g. DevOps Engineer, Data Scientist...'"
                                    class="w-full bg-[#0f1719]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7bc5cd] focus:outline-none placeholder:text-white/20 font-mono text-sm" />
                            </div>

                            <button @click="runAiTool" :disabled="aiLoading"
                                class="w-full py-3 rounded-xl bg-[#7bc5cd]/10 border border-[#7bc5cd] text-[#7bc5cd] font-bold uppercase hover:bg-[#7bc5cd] hover:text-[#0f1719] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                                <i v-if="aiLoading" class="pi pi-spin pi-spinner"></i>
                                {{ aiLoading ? 'PROCESSING...' : 'EXECUTE_PROTOCOL' }}
                            </button>
                        </div>

                        <div class="bg-[#0f1719]/50 border border-white/10 rounded-xl p-6 min-h-[200px] overflow-y-auto font-mono text-xs">
                            <div v-if="!aiResult && !aiLoading" class="h-full flex flex-col items-center justify-center text-[#7bc5cd]/20">
                                <i class="pi pi-code text-4xl mb-2"></i>
                                <span>AWAITING_DATA_STREAM...</span>
                            </div>

                            <div v-if="aiResult" class="text-[#7bc5cd] space-y-4 animate-fade-in-up">
                                <div v-if="aiResult.error" class="text-red-400">{{ aiResult.error }}</div>

                                <div v-if="activeAiTool === 'EXPAND' && aiResult.related_skills">
                                    <div class="font-bold text-white mb-2">RELATED_NODES:</div>
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        <span v-for="s in aiResult.related_skills" :key="s.name" class="px-2 py-1 bg-[#7bc5cd]/10 rounded border border-[#7bc5cd]/30">{{ s.name }}</span>
                                    </div>
                                    <div class="font-bold text-white mb-2">PROJECT_DIRECTIVE:</div>
                                    <div class="p-3 border border-white/10 rounded bg-white/5">
                                        {{ aiResult.projects?.[0]?.title }}
                                    </div>
                                </div>

                                <div v-if="activeAiTool === 'SUGGEST'">
                                    <div class="font-bold text-white mb-2 uppercase">Required Tech Stack:</div>
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        <span v-for="ts in aiResult.technical_skills" :key="ts" class="px-2 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30">{{ ts }}</span>
                                    </div>

                                    <div class="font-bold text-white mb-2 uppercase">Soft Skills:</div>
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        <span v-for="ss in aiResult.soft_skills" :key="ss" class="px-2 py-1 bg-green-500/10 text-green-300 rounded border border-green-500/30">{{ ss }}</span>
                                    </div>

                                    <div class="font-bold text-white mb-2 uppercase">Tools & Platforms:</div>
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        <span v-for="tool in aiResult.tools_and_platforms" :key="tool" class="px-2 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/30">{{ tool }}</span>
                                    </div>

                                    <div class="p-3 border border-white/10 rounded bg-white/5 italic text-[#7bc5cd]/70">
                                        "{{ aiResult.reasoning }}"
                                    </div>
                                </div>

                                <div v-if="activeAiTool === 'ATS' && aiResult.ats_score !== undefined">
                                    <div class="flex items-center justify-between mb-4">
                                        <span class="text-white font-bold">COMPATIBILITY_SCORE:</span>
                                        <span class="text-xl font-bold" :class="aiResult.ats_score > 70 ? 'text-green-400' : 'text-yellow-400'">{{ aiResult.ats_score }}%</span>
                                    </div>
                                    <div class="mb-2 text-white">MISSING_KEYWORDS:</div>
                                    <div class="flex flex-wrap gap-1">
                                        <span v-for="k in aiResult.missing_keywords" :key="k" class="text-[10px] text-red-400 px-1 border border-red-400/30 rounded">{{ k }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
</template>

<style scoped>
@keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
.animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
.animate-pulse-once { animation: pulse-once 0.5s ease-out; }
@keyframes pulse-once { 0% { transform: scale(0.95); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
.glow-text { text-shadow: 0 0 20px rgba(123, 197, 205, 0.3); }
</style>
