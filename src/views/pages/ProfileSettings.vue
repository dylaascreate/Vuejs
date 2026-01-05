<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);
const activeTab = ref(0); // 0 = Profile, 1 = Account

// Combined Form Data
const profileForm = ref({
    displayName: 'Sophie Anderson',
    targetCareer: 'Frontend Architect',
    bio: 'Synthesizing neural interfaces and glassmorphic design systems.',
    profileImage: 'https://imagine-public.x.ai/imagine-public/images/fbd4b811-df27-49d0-b122-fd18c0cb0cc6.png?cache=1&dl=1',
    github: 'github.com/alexnexus',
    linkedin: 'linkedin.com/in/alexnexus'
});

const accountForm = ref({
    email: 'alex.nexus@devnexus.io',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true
});

/**
 * Handles the image selection and generates a local preview
 */
const onFileSelect = (event) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        profileForm.value.profileImage = e.target.result;
    };
    reader.readAsDataURL(file);
    toast.add({
        severity: 'info',
        summary: 'File Detected',
        detail: 'Image payload prepared for sync.',
        life: 2000
    });
};

/**
 * Simulates saving the settings to a backend
 */
const saveSettings = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        toast.add({
            severity: 'success',
            summary: 'Protocol Updated',
            detail: activeTab.value === 0 ? 'Profile nodes synced.' : 'Security credentials rewritten.',
            life: 3000
        });
    }, 1200);
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="relative z-10 max-w-4xl mx-auto p-4">

            <div class="mb-8">
                <h2 class="text-3xl font-black uppercase tracking-tighter">System Settings</h2>
                <p class="font-mono text-[10px] text-[#7bc5cd] font-bold uppercase tracking-widest">Configuration_Module_v2.1</p>
            </div>

            <div class="flex bg-[#2c4c52]/5 p-1 rounded-2xl mb-8 border border-[#2c4c52]/10 max-w-sm">
                <button @click="activeTab = 0"
                    :class="['flex-1 py-3 rounded-xl font-bold text-xs transition-all uppercase tracking-widest',
                             activeTab === 0 ? 'bg-[#2c4c52] text-[#7bc5cd] shadow-lg' : 'text-[#2c4c52]/60 hover:text-[#2c4c52]']">
                    <i class="pi pi-user mr-2"></i> Profile
                </button>
                <button @click="activeTab = 1"
                    :class="['flex-1 py-3 rounded-xl font-bold text-xs transition-all uppercase tracking-widest',
                             activeTab === 1 ? 'bg-[#2c4c52] text-[#7bc5cd] shadow-lg' : 'text-[#2c4c52]/60 hover:text-[#2c4c52]']">
                    <i class="pi pi-lock mr-2"></i> Account
                </button>
            </div>

            <div class="card p-8 shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd]"></div>

                <div v-if="activeTab === 0" class="space-y-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-[#2c4c52]/10">
                        <div class="relative group">
                            <div class="w-32 h-32 rounded-3xl bg-[#2c4c52] p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden shadow-xl">
                                <img :src="profileForm.profileImage" class="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                            </div>
                            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-[#7bc5cd] rounded-full border-4 border-white flex items-center justify-center text-[#2c4c52]">
                                <i class="pi pi-camera text-xs"></i>
                            </div>
                        </div>
                        <div class="flex-1 text-center md:text-left">
                            <h4 class="font-black text-sm uppercase tracking-tight mb-1">Identity Visualization</h4>
                            <p class="text-xs text-[#4a7a82] mb-4 font-mono uppercase">Format: JPG, PNG | Max: 2MB</p>
                            <FileUpload mode="basic" chooseLabel="UPLOAD_IMAGE" class="y2k-upload-btn" @select="onFileSelect" :auto="true" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="y2k-label">Display Identity</label>
                            <InputText v-model="profileForm.displayName" class="w-full y2k-input" />
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">Career Target</label>
                            <InputText v-model="profileForm.targetCareer" class="w-full y2k-input" />
                        </div>
                        <div class="col-span-2 space-y-2">
                            <label class="y2k-label">Bio Transmission</label>
                            <Textarea v-model="profileForm.bio" rows="3" class="w-full y2k-input !rounded-2xl" />
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">GitHub Link</label>
                            <InputText v-model="profileForm.github" class="w-full y2k-input" />
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">LinkedIn Link</label>
                            <InputText v-model="profileForm.linkedin" class="w-full y2k-input" />
                        </div>
                    </div>
                </div>

                <div v-else class="space-y-6 animate-fade-in">
                    <div class="space-y-2">
                        <label class="y2k-label">Email Uplink</label>
                        <InputText v-model="accountForm.email" class="w-full y2k-input" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#2c4c52]/10 pt-6 mt-2">
                        <div class="space-y-2">
                            <label class="y2k-label">Current Key</label>
                            <Password v-model="accountForm.currentPassword" toggleMask :feedback="false" inputClass="w-full y2k-input" class="w-full" />
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">New Key</label>
                            <Password v-model="accountForm.newPassword" toggleMask inputClass="w-full y2k-input" class="w-full" />
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">Confirm Key</label>
                            <Password v-model="accountForm.confirmPassword" toggleMask :feedback="false" inputClass="w-full y2k-input" class="w-full" />
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-[#2c4c52]/5 rounded-xl border border-[#2c4c52]/10">
                        <div>
                            <span class="block font-bold text-sm">Two-Factor Authentication</span>
                            <span class="text-[10px] font-mono opacity-60 uppercase tracking-widest">High-Security Protocol</span>
                        </div>
                        <InputSwitch v-model="accountForm.twoFactor" />
                    </div>
                </div>

                <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2c4c52]/10">
                    <Button label="SAVE_CHANGES" icon="pi pi-check" :loading="loading" class="y2k-button-primary !px-8 !py-4" @click="saveSettings" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.y2k-label {
    display: block;
    font-family: monospace;
    font-size: 10px;
    font-weight: 700;
    /* Use dynamic text color variable */
    color: var(--text-color-secondary);
    text-transform: uppercase;
}

.y2k-input {
    /* Use dynamic surface variables */
    background: var(--surface-50) !important;
    border: 1px solid var(--surface-border) !important;
    color: var(--text-color) !important;
}

.y2k-input:focus {
    border-color: var(--primary-color) !important;
}
</style>
