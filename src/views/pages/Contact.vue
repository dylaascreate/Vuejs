<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import emailjs from '@emailjs/browser';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const loading = ref(false);

// Form Data
const form = ref({
    name: '',
    email: '',
    subject: '',
    message: ''
});

// Load config from .env file
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// New State for Inline Validation
const emailError = ref('');

const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const submit = () => {
    // 1. Basic Validation
    if (!form.value.name || !form.value.email || !form.value.message) {
        toast.add({
            severity: 'warn',
            summary: 'Missing Data',
            detail: 'Please complete all required fields.',
            life: 3000
        });
        return;
    }

    // 2. Validate Email Format (Inline Alert)
    if (!isValidEmail(form.value.email)) {
        emailError.value = 'ERROR: INVALID EMAIL PROTOCOL (e.g., user@domain.com)';
        return; // Stop execution here
    }

    loading.value = true;

    // 3. Prepare Data for EmailJS
    const templateParams = {
        from_name: form.value.name,
        from_email: form.value.email,
        subject: form.value.subject || 'No Subject',
        message: form.value.message
    };

    // 4. Send Email
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            toast.add({
                severity: 'success',
                summary: 'Transmission Successful',
                detail: 'Message successfully relayed to admin.',
                life: 4000
            });

            // Reset form
            form.value = { name: '', email: '', subject: '', message: '' };
        })
        .catch((error) => {
            console.error('FAILED...', error);
            toast.add({
                severity: 'error',
                summary: 'Transmission Failed',
                detail: 'Network uplink failed. Please try again.',
                life: 4000
            });
        })
        .finally(() => {
            loading.value = false;
        });
};
</script>

<template>
    <div class="relative min-h-screen font-sans text-[#2c4c52] overflow-hidden flex flex-col">

        <Toast position="top-right" />
        <div class="fixed inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-20 z-0 pointer-events-none animate-pulse"></div>
        <div class="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#a7e2e8] rounded-full blur-[120px] opacity-20 z-0 pointer-events-none"></div>

        <div class="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 bg-gradient-to-tr from-[#7bc5cd] to-white rounded flex items-center justify-center shadow-lg border border-white/50">
                    <component :is="StarIcon" class="text-white w-6 h-6" />
                </div>
                <span class="text-2xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-[#2c4c52] to-[#5d9ca4]">
                    DEVNEXUS
                </span>
            </div>
            <Button label="RETURN_HOME" icon="pi pi-arrow-left" class="p-button-text !font-mono !font-bold !text-[#2c4c52]" @click="router.push('/landing')" />
        </div>

        <div class="relative z-10 flex-1 flex items-center justify-center p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full items-center">

                <div class="space-y-8">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-4">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest">COMMS_OPEN</span>
                        </div>
                        <h1 class="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#2c4c52] mb-4">
                            Initialize <br />
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#7bc5cd] to-[#5d9ca4]">Contact</span>
                        </h1>
                        <p class="text-lg text-[#4a7a82] font-medium max-w-md">
                            Have a query about the protocol? Signal our team and we will respond within 24 cycles.
                        </p>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4 p-4 bg-white/40 border border-white/60 rounded-2xl">
                            <div class="w-10 h-10 rounded-full bg-[#2c4c52] flex items-center justify-center text-[#7bc5cd]">
                                <i class="pi pi-envelope text-lg"></i>
                            </div>
                            <div>
                                <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Email Uplink</div>
                                <div class="text-lg font-bold text-[#2c4c52]">hello@devnexus.com</div>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 p-4 bg-white/40 border border-white/60 rounded-2xl">
                            <div class="w-10 h-10 rounded-full bg-[#2c4c52] flex items-center justify-center text-[#7bc5cd]">
                                <i class="pi pi-map-marker text-lg"></i>
                            </div>
                            <div>
                                <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Base Station</div>
                                <div class="text-lg font-bold text-[#2c4c52]">Cyberjaya, Malaysia</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card p-8 shadow-[0_20px_60px_-15px_rgba(44,76,82,0.15)]">
                    <h3 class="font-black text-xl text-[#2c4c52] uppercase mb-6 flex items-center gap-2">
                        <i class="pi pi-send text-[#7bc5cd]"></i> Transmit Message
                    </h3>

                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Identity (Name)</label>
                                <InputText v-model="form.name" class="w-full" placeholder="John Doe" />
                            </div>

                            <div class="space-y-2">
                                <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Return Address (Email)</label>

                                <InputText
                                    v-model="form.email"
                                    class="w-full transition-colors"
                                    :class="{ '!border-red-500 !bg-red-50': emailError }"
                                    placeholder="email@domain.com"
                                    @input="emailError = ''"
                                />

                                <small v-if="emailError" class="block font-mono text-[10px] font-bold text-red-500 animate-pulse mt-1">
                                    <i class="pi pi-exclamation-triangle mr-1"></i> {{ emailError }}
                                </small>
                            </div>
                            </div>

                        <div class="space-y-2">
                            <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Subject Line</label>
                            <InputText v-model="form.subject" class="w-full" placeholder="Inquiry about..." />
                        </div>

                        <div class="space-y-2">
                            <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Data Payload (Message)</label>
                            <Textarea v-model="form.message" rows="5" class="w-full !rounded-2xl" placeholder="Type your message here..." />
                        </div>

                        <Button label="INITIATE_TRANSMISSION"
                            class="y2k-button-primary w-full !py-4 !text-lg"
                            icon="pi pi-arrow-up-right"
                            :loading="loading"
                            @click="submit" />
                    </div>
                </div>
            </div>
        </div>

        <div class="relative z-10 py-6 text-center font-mono text-xs font-bold text-[#2c4c52]/40">
            /// END_OF_LINE
        </div>
    </div>
</template>
