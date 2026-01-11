<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useCareerStore } from '@/stores/career';
import { storeToRefs } from 'pinia';

// PrimeVue Imports
import Select from 'primevue/select';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const userStore = useUserStore();
const careerStore = useCareerStore();

const { isLoading, error: validationErrors } = storeToRefs(userStore);
const { allCareers } = storeToRefs(careerStore);

const activeTab = ref(0);

// Dialog controls
const deleteDialog = ref(false);
const deletePassword = ref('');
const deleteLoading = ref(false);

const profileForm = ref({
    displayName: '',
    role: '',
    careerId: null,
    bio: '',
    avatar: '', // Stores the URL string
    github: '',
    linkedin: ''
});

const accountForm = ref({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
});

onMounted(() => {
    careerStore.fetchCareers();
});

// Populate Form
watchEffect(() => {
    if (authStore.user) {
        profileForm.value = {
            displayName: authStore.user.name || '',
            role: authStore.user.role || 'Student',
            careerId: authStore.user.career_id || null,
            bio: authStore.user.bio || '',
            // Bind to 'avatar' column, with a UI Avatars fallback
            avatar: authStore.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user.name || 'User')}&background=2c4c52&color=7bc5cd`,
            github: authStore.user.github || '',
            linkedin: authStore.user.linkedin || ''
        };

        accountForm.value.email = authStore.user.email || '';
    }
});

const saveSettings = async () => {
    userStore.error = null;

    try {
        if (activeTab.value === 0) {
            // Construct payload
            const payload = {
                name: profileForm.value.displayName,
                bio: profileForm.value.bio,
                github: profileForm.value.github,
                linkedin: profileForm.value.linkedin,
                avatar: profileForm.value.avatar, // Send URL
                career_id: profileForm.value.careerId,
                _method: 'PUT'
            };

            await userStore.updateProfile(payload);

            toast.add({ severity: 'success', summary: 'System Update', detail: 'Profile configuration synced.', life: 3000 });
        } else {
            await userStore.updatePassword({
                current_password: accountForm.value.currentPassword,
                password: accountForm.value.newPassword,
                password_confirmation: accountForm.value.confirmPassword
            });

            accountForm.value.currentPassword = '';
            accountForm.value.newPassword = '';
            accountForm.value.confirmPassword = '';

            toast.add({ severity: 'success', summary: 'Security Patch', detail: 'Credentials updated successfully.', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Operation Failed', detail: 'Please check your input parameters.', life: 3000 });
    }
};

const confirmDeleteAccount = async () => {
    deleteLoading.value = true;
    try {
        if (authStore.deleteAccount) {
            await authStore.deleteAccount(deletePassword.value);
            deleteDialog.value = false;
            router.push('/auth/login');
            toast.add({ severity: 'info', summary: 'Account Terminated', detail: 'User data purged.', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Incorrect password or system error.', life: 3000 });
    } finally {
        deleteLoading.value = false;
    }
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

            <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7bc5cd] via-[#2c4c52] to-[#7bc5cd]"></div>

                <div v-if="activeTab === 0" class="space-y-6 animate-fade-in">
                    <div class="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-[#2c4c52]/10">
                        <div class="relative group shrink-0">
                            <div class="w-32 h-32 rounded-3xl bg-[#2c4c52] p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden shadow-xl">
                                <img
                                    :key="profileForm.avatar"  :src="profileForm.avatar || defaultAvatar"
                                    @error="$event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.displayName || 'User')}&background=2c4c52&color=7bc5cd`"
                                    class="w-full h-full rounded-2xl object-cover transition-all"
                                />
                            </div>
                            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-[#7bc5cd] rounded-full border-4 border-white flex items-center justify-center text-[#2c4c52]">
                                <i class="pi pi-link text-xs"></i>
                            </div>
                        </div>

                        <div class="flex-1 w-full text-center md:text-left space-y-2">
                            <div>
                                <h4 class="font-black text-sm uppercase tracking-tight mb-1">Identity Visualization</h4>
                                <p class="text-xs text-[#4a7a82] font-mono uppercase">Enter a secure URL for your avatar image.</p>
                            </div>
                            <div class="relative w-full max-w-md">
                                <i class="pi pi-image absolute left-3 top-1/2 -translate-y-1/2 text-[#2c4c52]/50"></i>
                                <InputText v-model="profileForm.avatar" placeholder="https://example.com/my-avatar.png" class="w-full y2k-input !pl-9 !py-2.5 !text-xs" />
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="y2k-label">Display Identity</label>
                            <InputText v-model="profileForm.displayName" class="w-full y2k-input" :class="{'p-invalid': validationErrors?.name}" />
                            <small class="text-red-500 font-mono text-[10px]" v-if="validationErrors?.name">{{ validationErrors.name[0] }}</small>
                        </div>

                        <div class="space-y-2">
                            <label class="y2k-label">System Role</label>
                            <InputText v-model="profileForm.role" class="w-full y2k-input opacity-60 cursor-not-allowed" disabled />
                        </div>

                        <div class="space-y-2">
                            <label class="y2k-label">Target Career</label>
                            <Select
                                v-model="profileForm.careerId"
                                :options="allCareers"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="SELECT TARGET PATH..."
                                class="w-full y2k-dropdown"
                                :class="{'p-invalid': validationErrors?.career_id}"
                            />
                            <small class="text-red-500 font-mono text-[10px]" v-if="validationErrors?.career_id">{{ validationErrors.career_id[0] }}</small>
                        </div>

                        <div class="space-y-2">
                            <label class="y2k-label">GitHub Link</label>
                            <InputText v-model="profileForm.github" class="w-full y2k-input" />
                        </div>

                        <div class="col-span-2 space-y-2">
                            <label class="y2k-label">Bio Transmission</label>
                            <Textarea v-model="profileForm.bio" rows="3" class="w-full y2k-input !rounded-2xl" />
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
                        <InputText v-model="accountForm.email" class="w-full y2k-input" disabled />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#2c4c52]/10 pt-6 mt-2">
                        <div class="space-y-2">
                            <label class="y2k-label">Current Key</label>
                            <Password v-model="accountForm.currentPassword" toggleMask :feedback="false" inputClass="w-full y2k-input" class="w-full" :class="{'p-invalid': validationErrors?.current_password}" />
                            <small class="text-red-500 font-mono text-[10px]" v-if="validationErrors?.current_password">{{ validationErrors.current_password[0] }}</small>
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">New Key</label>
                            <Password v-model="accountForm.newPassword" toggleMask inputClass="w-full y2k-input" class="w-full" :class="{'p-invalid': validationErrors?.password}" />
                            <small class="text-red-500 font-mono text-[10px]" v-if="validationErrors?.password">{{ validationErrors.password[0] }}</small>
                        </div>
                        <div class="space-y-2">
                            <label class="y2k-label">Confirm Key</label>
                            <Password v-model="accountForm.confirmPassword" toggleMask :feedback="false" inputClass="w-full y2k-input" class="w-full" />
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-red-200">
                         <h3 class="text-red-600 font-bold text-xs uppercase tracking-widest mb-4">Danger Zone</h3>
                         <div class="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                            <div>
                                <span class="block font-bold text-sm text-red-700">Delete Account</span>
                                <span class="text-[10px] font-mono text-red-500 uppercase tracking-widest">Permanent Removal</span>
                            </div>
                            <Button label="DELETE" icon="pi pi-trash" severity="danger" class="!text-xs !font-black !px-4" @click="deleteDialog = true" />
                        </div>
                    </div>
                </div>

                <div v-if="activeTab !== 1" class="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2c4c52]/10">
                    <Button label="SAVE_CHANGES" icon="pi pi-check" :loading="isLoading" class="y2k-button-primary !px-8 !py-4" @click="saveSettings" />
                </div>
                <div v-if="activeTab === 1" class="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2c4c52]/10">
                    <Button label="UPDATE SECURITY" icon="pi pi-lock" :loading="isLoading" class="y2k-button-primary !px-8 !py-4" @click="saveSettings" />
                </div>
            </div>
        </div>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm Termination" modal class="y2k-dialog">
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-4">
                    <i class="pi pi-exclamation-triangle text-red-500 text-3xl" />
                    <span class="text-[#2c4c52] text-sm font-medium">This action is irreversible. Please enter your password to confirm account deletion.</span>
                </div>
                <div class="space-y-2 mt-2">
                    <label class="y2k-label">Confirm Password</label>
                    <Password v-model="deletePassword" toggleMask :feedback="false" inputClass="w-full y2k-input" class="w-full" autofocus />
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteDialog = false" />
                    <Button label="CONFIRM DELETION" severity="danger" :loading="deleteLoading" class="!font-bold !text-xs" @click="confirmDeleteAccount" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.y2k-label {
    display: block;
    font-family: monospace;
    font-size: 10px;
    font-weight: 700;
    color: #4a7a82;
    text-transform: uppercase;
    margin-left: 2px;
}

.y2k-input, :deep(.y2k-input) {
    background: rgba(255, 255, 255, 0.7) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
    padding: 0.75rem 1rem !important;
    transition: all 0.2s;
}

.y2k-input:focus, :deep(.y2k-input:focus) {
    border-color: #7bc5cd !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.7) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
}
:deep(.y2k-dropdown:focus) {
    border-color: #7bc5cd !important;
    box-shadow: 0 0 0 2px rgba(123, 197, 205, 0.2) !important;
}

/* Y2K Button Styles */
.y2k-button-primary {
    background: linear-gradient(135deg, #2c4c52 0%, #1a3338 100%) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: #7bc5cd !important;
    font-weight: 900 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 15px rgba(44, 76, 82, 0.3);
    transition: all 0.3s ease;
}

.y2k-button-primary:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(44, 76, 82, 0.4);
}

:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #fdfdfd !important;
    color: #2c4c52;
}

@keyframes fadein {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadein 0.3s ease-out forwards;
}
</style>
