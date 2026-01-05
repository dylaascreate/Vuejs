<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

// 1. Unified Form State (from your snippet)
const form = ref({
    email: '',
    password: ''
});

// 2. UI States (kept from design)
const checked = ref(false);
const loading = ref(false);

// 3. The Real Login Logic
const handleLogin = async () => {
    loading.value = true; // Start spinner
    try {
        // Call the store action
        await auth.login(form.value.email, form.value.password);

        // Redirect to Dashboard (Ensure route name is 'dashboard' in router/index.js)
        router.push({ name: 'dashboard' });
        toast.add({ severity: 'success', summary: 'Welcome', detail: 'Login successful', life: 3000 });

    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Access Denied',
            detail: 'Invalid email or password.',
            life: 3000 // Disappears after 3 seconds
        });
    } finally {
        loading.value = false; // Stop spinner
    }
};

// === TESTING UTILITIES (REMOVE BEFORE PRODUCTION) ===
const autofillStudent = () => {
    form.value.email = 'student@devnexus.ts';
    form.value.password = 'password';
};

const autofillAdmin = () => {
    form.value.email = 'admin@devnexus.ts';
    form.value.password = 'admin';
};

// Optional: auto login after autofill
// const autofillStudent = async () => {
//     form.value.email = 'student@devnexus.com';
//     form.value.password = 'password123';
//     await handleLogin();
// };
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-[#e0f2f1] overflow-hidden relative font-sans text-[#2c4c52]">

        <div class="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#7bc5cd] rounded-full blur-[100px] opacity-30 animate-blob"></div>
        <div class="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#a7e2e8] rounded-full blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

        <div class="relative z-10 w-full max-w-md px-4">

            <div class="text-center mb-8">

                <h1 class="text-4xl font-black tracking-tighter text-[#2c4c52] mb-1">
                    SYSTEM <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">ACCESS</span>
                </h1>
                <p class="font-mono text-sm text-[#4a7a82] tracking-widest">/// DEVNEXUS_AUTH_PROTOCOL</p>
            </div>
            <div class="mb-6 flex gap-3 justify-center">
    <Button
        label="Student"
        type="button"
        class="y2k-button-secondary"
        @click="autofillStudent"
    />
    <Button
        label="Admin"
        type="button"
        class="y2k-button-secondary"
        @click="autofillAdmin"
    />
</div>

            <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(44,76,82,0.15)] relative overflow-hidden group">

                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd]"></div>

                <form @submit.prevent="handleLogin" class="space-y-6">

                    <div class="space-y-2">
                        <i class="pi pi-at text-[#2c4c52]" style="z-index: 10;" />
                        <label for="email" class="font-mono text-xs font-bold text-[#2c4c52] uppercase">  User Identity</label>
                        <span class="p-input-icon-left w-full">
                            <InputText id="email" v-model="form.email" type="text" placeholder="username@devnexus.com" class="y2k-input w-full" />
                        </span>
                    </div>

                    <div class="space-y-2">
                        <i class="pi pi-lock text-[#2c4c52]" style="z-index: 10;" />
                        <label for="password" class="font-mono text-xs font-bold text-[#2c4c52] uppercase">  Security Key</label>
                        <span class="p-input-icon-left w-full">
                            <InputText id="password" v-model="form.password" type="password" placeholder="••••••••••••" class="y2k-input w-full" />
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Checkbox id="rememberme" v-model="checked" :binary="true" class="y2k-checkbox" />
                            <label for="rememberme" class="text-sm font-medium cursor-pointer select-none">Stay Connected</label>
                        </div>
                        <a href="/auth/reset-password" class="text-sm font-bold text-[#2c4c52] hover:text-[#7bc5cd] cursor-pointer transition-colors border-b border-transparent hover:border-[#7bc5cd]">
                            Reset Key?
                        </a>
                    </div>

                    <Button label="INITIALIZE SESSION"
                            type="submit"
                            class="y2k-button-primary w-full !py-4 !text-lg"
                            :loading="loading" />

                </form>
                <div class="text-center pt-4 border-t border-[#2c4c52]/10 space-y-3 mt-6">
                    <div>
                        <span class="text-sm text-[#4a7a82]">New to the system? </span>
                        <router-link to="/auth/register" class="font-bold text-[#2c4c52] hover:text-[#7bc5cd] transition-colors">
                            Create Identity
                        </router-link>
                    </div>

                    <router-link to="/landing">
                        <button class="text-xs font-mono font-bold text-[#2c4c52]/50 hover:text-[#2c4c52] transition-colors flex items-center justify-center gap-2 mx-auto mt-4 group">
                            <i class="pi pi-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            RETURN TO HOME
                        </button>
                    </router-link>
                </div>

                <div class="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#2c4c52]/10 rounded-br-2xl pointer-events-none"></div>
            </div>

            <!-- <div class="mt-8 text-center">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="font-mono text-xs text-[#2c4c52]/60">SERVERS OPERATIONAL</span>
                </div>
            </div> -->
        </div>
    </div>
</template>

<style scoped>
.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    border-radius: 12px !important;
    padding-left: 3rem !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}

.y2k-input:focus {
    background: #ffffff !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 4px rgba(123, 197, 205, 0.2) !important;
}

.y2k-input::placeholder {
    color: rgba(44, 76, 82, 0.4) !important;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
    background: #2c4c52 !important;
    border-color: #2c4c52 !important;
}

.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 10px 20px -5px rgba(44, 76, 82, 0.4);
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(44, 76, 82, 0.5);
    filter: brightness(1.1);
}

@keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
    animation: blob 7s infinite;
}
.animation-delay-2000 {
    animation-delay: 2s;
}
</style>
