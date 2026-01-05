<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const form = ref({
    token: '',
    email: '',
    password: '',
    password_confirmation: ''
});

const isLoading = ref(false);

onMounted(() => {
    // 1. Capture token and email from the URL query parameters (sent by Laravel)
    form.value.token = route.query.token || route.params.token;
    form.value.email = route.query.email || '';
});

const handleReset = async () => {
    if (form.value.password !== form.value.password_confirmation) {
        toast.add({ severity: 'error', summary: 'Mismatch', detail: 'Passwords do not match.', life: 3000 });
        return;
    }

    isLoading.value = true;

    try {
        await axios.post('/api/reset-password', form.value);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Password has been reset! Redirecting...', life: 3000 });

        setTimeout(() => {
            router.push('/auth/login');
        }, 2000);

    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to reset password.';
        toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="relative min-h-screen font-sans text-[#2c4c52] flex items-center justify-center overflow-hidden">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7bc5cd]/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        <div class="relative z-10 w-full max-w-md p-6">
            <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden">

                <div class="text-center mb-8">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-4">
                        <i class="pi pi-lock text-xs"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">SECURE_RECOVERY</span>
                    </div>
                    <h1 class="text-xl font-black text-[#2c4c52] uppercase tracking-tighter">Reset key</h1>
                    <p class="text-sm text-[#4a7a82] mt-2 font-medium">Enter your new credentials below.</p>
                </div>

                <form @submit.prevent="handleReset" class="space-y-5">

                    <div class="space-y-1">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase ml-1">Email Address</label>
                        <InputText v-model="form.email" type="email" class="y2k-input w-full opacity-70" readonly />
                    </div>

                    <div class="space-y-1">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase ml-1">New Password</label>
                        <Password v-model="form.password"
                                  toggleMask
                                  :feedback="true"
                                  inputClass="y2k-input w-full"
                                  class="w-full"
                                  placeholder="••••••••" />
                    </div>

                    <div class="space-y-1">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase ml-1">Confirm Password</label>
                        <InputText v-model="form.password_confirmation" type="password" class="y2k-input w-full" placeholder="••••••••" />
                    </div>

                    <Button label="UPDATE PASSWORD"
                            type="submit"
                            :loading="isLoading"
                            class="y2k-button-primary w-full mt-2" />
                </form>

                <div class="mt-6 text-center">
                    <router-link to="/auth/login" class="text-xs font-bold text-[#2c4c52]/60 hover:text-[#2c4c52] uppercase tracking-wide transition-colors">
                        <i class="pi pi-arrow-left mr-1"></i> Return to Login
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Copied from your Roadmap.vue to ensure consistency */
.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 12px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
    padding: 0.75rem 1rem !important;
}
.y2k-input:focus {
    background: #ffffff !important;
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 4px rgba(123, 197, 205, 0.2) !important;
}

:deep(.p-password-input) {
    width: 100%;
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 12px !important;
    color: #2c4c52 !important;
    padding: 0.75rem 1rem !important;
}

.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 12px !important;
    padding: 1rem !important;
    letter-spacing: 0.05em;
    transition: all 0.2s;
}
.y2k-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(44, 76, 82, 0.3);
}
</style>
