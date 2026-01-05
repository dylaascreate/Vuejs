<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Import Store
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const name = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref(''); // Added confirmation
const terms = ref(false);
const loading = ref(false);
const validationErrors = ref({}); // Local error state

const handleRegister = async () => {
    // Basic Client-side validation
    if (!terms.value) {
        toast.add({ severity: 'error', summary: 'System protocols', detail: 'Please accept the System Protocols.', life: 3000 });
        return;
    }
    if (password.value !== password_confirmation.value) {
        validationErrors.value = { password: ['Security keys do not match.'] };
        return;
    }

    loading.value = true;
    validationErrors.value = {};

    try {
        await authStore.register({
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value
        });

        // On success, redirect to dashboard
        router.push('login');
        toast.add({ severity: 'success', summary: 'Connection established.', detail: 'You can initialize connection now.', life: 3000 });
    } catch (error) {
        if (authStore.errors) {
            validationErrors.value = authStore.errors;
        } else {
            console.error(error);
        }
    } finally {
        loading.value = false;
    }
};

// Custom Star Icon
const StarIcon = {
    template: `
        <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 animate-pulse text-white">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
        </svg>
    `
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-[#e0f2f1] overflow-hidden relative font-sans text-[#2c4c52]">

        <div class="fixed inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>

        <div class="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#7bc5cd] rounded-full blur-[100px] opacity-30 animate-blob"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#a7e2e8] rounded-full blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

        <div class="relative z-10 w-full max-w-md px-4 my-8">

            <div class="text-center mb-8">
               
                <h1 class="text-4xl font-black tracking-tighter text-[#2c4c52] mb-1">
                    NEW <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">IDENTITY</span>
                </h1>
                <p class="font-mono text-sm text-[#4a7a82] tracking-widest">/// INITIALIZE_PROFILE_MODULE</p>
            </div>

            <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(44,76,82,0.15)] relative overflow-hidden group">

                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd]"></div>

                <form @submit.prevent="handleRegister" class="space-y-5">

                    <div class="space-y-2">
                            <i class="pi pi-id-card text-[#2c4c52]" style="z-index: 10;" />
                        <label for="name" class="font-mono text-xs font-bold text-[#2c4c52] uppercase">   Full Designation</label>
                        <span class="p-input-icon-left w-full">
                            <InputText id="name" v-model="name" type="text" placeholder="John Doe" class="y2k-input w-full" :class="{'p-invalid': validationErrors.name}" />
                        </span>
                        <small v-if="validationErrors.name" class="text-red-500 font-bold text-xs">{{ validationErrors.name[0] }}</small>
                    </div>

                    <div class="space-y-2">
                            <i class="pi pi-at text-[#2c4c52]" style="z-index: 10;" />
                        <label for="email" class="font-mono text-xs font-bold text-[#2c4c52] uppercase">   Comms Address</label>
                        <span class="p-input-icon-left w-full">
                            <InputText id="email" v-model="email" type="email" placeholder="user@devnexus.com" class="y2k-input w-full" :class="{'p-invalid': validationErrors.email}" />
                        </span>
                        <small v-if="validationErrors.email" class="text-red-500 font-bold text-xs">{{ validationErrors.email[0] }}</small>
                    </div>

                    <div class="space-y-2">
                            <i class="pi pi-lock text-[#2c4c52]" style="z-index: 10;" />
                        <label for="password" class="font-mono text-xs font-bold text-[#2c4c52] uppercase">   Security Key</label>
                        <span class="p-input-icon-left w-full">
                            <InputText id="password" v-model="password" type="password" placeholder="••••••••••••" class="y2k-input w-full" :class="{'p-invalid': validationErrors.password}" />
                        </span>
                        <small v-if="validationErrors.password" class="text-red-500 font-bold text-xs">{{ validationErrors.password[0] }}</small>
                    </div>

                    <div class="space-y-2">
                            <i class="pi pi-check-circle text-[#2c4c52]" style="z-index: 10;" />
                        <label for="password_confirmation" class="font-mono text-xs font-bold text-[#2c4c52] uppercase">   Verify Security Key</label>
                        <span class="p-input-icon-left w-full">
                            <InputText id="password_confirmation" v-model="password_confirmation" type="password" placeholder="••••••••••••" class="y2k-input w-full" />
                        </span>
                    </div>

                    <div class="flex items-start gap-3 mt-2">
                        <Checkbox id="terms" v-model="terms" :binary="true" class="y2k-checkbox mt-1" />
                        <label for="terms" class="text-sm font-medium text-[#4a7a82] leading-snug cursor-pointer select-none">
                            I accept the <a href="#" class="font-bold text-[#2c4c52] hover:text-[#7bc5cd] border-b border-[#2c4c52]">System Protocols</a> and Privacy Terms.
                        </label>
                    </div>

                    <Button type="submit"
                            label="ESTABLISH CONNECTION"
                            class="y2k-button-primary w-full !py-4 !text-lg !mt-4"
                            :loading="loading" />
                    </form>

                    <div class="text-center pt-4 border-t border-[#2c4c52]/10">
                        <span class="text-sm text-[#4a7a82]">Already registered? </span>
                        <router-link to="/auth/login" class="font-bold text-[#2c4c52] hover:text-[#7bc5cd] transition-colors">
                            Access System
                        </router-link>
                    </div>

                <div class="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#2c4c52]/10 rounded-bl-2xl pointer-events-none"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Reuse Y2K Styles */
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

.y2k-input.p-invalid {
    border-color: #ef4444 !important;
}

.y2k-input::placeholder {
    color: rgba(44, 76, 82, 0.4) !important;
}

/* Checkbox Override */
:deep(.p-checkbox .p-checkbox-box.p-highlight) {
    background: #2c4c52 !important;
    border-color: #2c4c52 !important;
}

/* Primary Button Y2K Style */
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

/* Animations */
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
