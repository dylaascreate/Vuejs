<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { storeToRefs } from 'pinia';
import { useSkillStore } from '@/stores/skill'; // Import the store

// Import the widget
import SkillRadarWidget from '@/components/devnexus/student/SkillRadarWidget.vue';

const toast = useToast();
const confirm = useConfirm();
const skillStore = useSkillStore();

// Access state from store
const { userSkills: skills, loading } = storeToRefs(skillStore);

const categories = ['All', 'Frontend', 'Backend', 'Design', 'Tools'];
const activeDomain = ref('All');
const searchQuery = ref('');

const skillDialog = ref(false);
const skillForm = ref({ name: '', proficiency: 50, domain: 'Frontend' });
const isEditing = ref(false);

const domainOptions = ['Frontend', 'Backend', 'Design', 'Tools', 'Soft Skills'];

// --- Lifecycle ---
onMounted(() => {
    skillStore.fetchUserMatrix();
});

// --- Computed ---
const filteredSkills = computed(() => {
    let result = skills.value || [];

    if (activeDomain.value !== 'All') {
        result = result.filter(s => s.domain === activeDomain.value);
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(query));
    }

    // Sort by proficiency Descending
    return result.sort((a, b) => b.proficiency - a.proficiency);
});

const topSkills = computed(() => {
    return [...(skills.value || [])].sort((a, b) => b.proficiency - a.proficiency).slice(0, 3);
});

const totalMastery = computed(() => {
    const list = skills.value || [];
    if (list.length === 0) return 0;
    const total = list.reduce((acc, curr) => acc + curr.proficiency, 0);
    return Math.round(total / list.length);
});

// --- Actions ---
const openNew = () => {
    isEditing.value = false;
    skillForm.value = { name: '', proficiency: 50, domain: 'Frontend' };
    skillDialog.value = true;
};

const editSkill = (skill) => {
    isEditing.value = true;
    skillForm.value = { ...skill };
    skillDialog.value = true;
};

const saveSkill = async () => {
    // Basic validation
    if (!skillForm.value.name) return;

    try {
        // FIX: Map the correct properties from skillForm
        const payload = {
            name: skillForm.value.name,
            proficiency: skillForm.value.proficiency, // Was 'level' (undefined)
            domain: skillForm.value.domain            // Was 'category' (undefined)
        };

        // If we are editing an existing skill, use its ID.
        // If we are adding a NEW skill, pass 'new' (or null, handled by store).
        const idToUpdate = (isEditing.value && skillForm.value.id) ? skillForm.value.id : 'new';

        await skillStore.updateUserSkill(idToUpdate, payload);

        toast.add({
            severity: 'success',
            summary: isEditing.value ? 'Matrix Updated' : 'New Node',
            detail: 'Skill parameters adjusted.',
            life: 3000
        });

        skillDialog.value = false;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save skill.', life: 3000 });
    }
};

const deleteSkill = (skill) => {
    confirm.require({
        message: `Remove ${skill.name} from your profile?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await skillStore.removeUserSkill(skill.id);
                toast.add({ severity: 'success', summary: 'Deleted', detail: 'Skill removed.', life: 3000 });
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove skill.', life: 3000 });
            }
        }
    });
};

const getProLabel = (proficiency) => {
    if (proficiency >= 90) return 'MASTER';
    if (proficiency >= 75) return 'EXPERT';
    if (proficiency >= 50) return 'ADVANCED';
    if (proficiency >= 25) return 'INTERMEDIATE';
    return 'NOVICE';
};

const getProColor = (proficiency) => {
    if (proficiency >= 80) return '#4ade80'; // Green
    if (proficiency >= 50) return '#7bc5cd'; // Teal
    return '#facc15'; // Yellow
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-10"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;">
        </div>
        <div class="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4 max-w-7xl mx-auto">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-end gap-6 mb-2">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-chart-bar text-xs"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">SKILL_MATRIX_V3</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">My Capabilities</h2>
                </div>

                <div class="flex gap-4">
                     <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 px-5 rounded-2xl text-center shadow-sm">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Total Skills</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ skills.length }}</div>
                    </div>
                    <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 px-5 rounded-2xl text-center shadow-sm">
                        <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Avg. Mastery</div>
                        <div class="text-2xl font-black text-[#2c4c52]">{{ totalMastery }}%</div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">

                <SkillRadarWidget />

                <div class="bg-[#2c4c52] text-[#e0f2f1] p-6 rounded-3xl shadow-lg relative">
                    <div class="absolute top-0 right-0 p-4 opacity-10">
                        <i class="pi pi-star-fill text-6xl"></i>
                    </div>
                    <h4 class="font-black !text-white text-lg uppercase mb-6 flex items-center gap-2 relative z-10">
                        <i class="pi pi-crown text-[#7bc5cd]"></i> Elite Skills
                    </h4>

                    <div class="space-y-4 relative z-10">
                        <div v-for="(skill, index) in topSkills" :key="skill.id" class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-[#7bc5cd] text-[#2c4c52] flex items-center justify-center font-bold">
                                {{ index + 1 }}
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between text-xs font-bold mb-1">
                                    <span>{{ skill.name }}</span>
                                    <span class="text-[#7bc5cd]">{{ skill.proficiency }}%</span>
                                </div>
                                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div class="h-full bg-[#7bc5cd] rounded-full" :style="{ width: `${skill.proficiency}%` }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#7bc5cd]/20 flex items-center justify-center text-[#2c4c52]">
                        <i class="pi pi-plus text-xl font-bold"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-[#2c4c52]">Expand Matrix</h4>
                        <p class="text-xs text-[#4a7a82]">Add new technologies to your profile.</p>
                    </div>
                    <Button label="ADD SKILL" class="y2k-button-primary w-full !text-xs !mt-2" @click="openNew" />
                </div>
            </div>

            <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">

                <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/30 p-2 rounded-2xl border border-white/40">
                    <div class="flex flex-wrap gap-1">
                         <button v-for="cat in categories" :key="cat"
                            @click="activeDomain = cat"
                            class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 uppercase tracking-wide"
                            :class="activeDomain === cat ? 'bg-[#2c4c52] text-[#7bc5cd] shadow-sm' : 'text-[#4a7a82] hover:bg-white/50'">
                            {{ cat }}
                        </button>
                    </div>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="searchQuery" placeholder="Search Skills..." class="y2k-input !py-2 !text-xs !w-48" />
                    </IconField>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="skill in filteredSkills" :key="skill.id"
                         class="group bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4 hover:shadow-[0_10px_30px_-10px_rgba(44,76,82,0.1)] transition-all hover:-translate-y-1 relative flex flex-col">

                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-[#e0f2f1] rounded-xl text-[#2c4c52]">
                                    <i class="pi pi-code"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-[#2c4c52] text-lg leading-none">{{ skill.name }}</h3>
                                    <span class="text-[10px] font-mono text-[#4a7a82] uppercase">{{ skill.domain }}</span>
                                </div>
                            </div>
                            <Button icon="pi pi-ellipsis-h" text rounded class="!text-[#2c4c52]/50 hover:!text-[#2c4c52]" @click="editSkill(skill)" />
                        </div>

                        <div class="mt-auto">
                            <div class="flex justify-between items-end mb-1">
                                <span class="text-[10px] font-mono font-bold bg-[#2c4c52]/5 px-1.5 py-0.5 rounded"
                                      :style="{ color: getProColor(skill.proficiency) }">
                                    {{ getProLabel(skill.proficiency) }}
                                </span>
                                <span class="font-black text-lg text-[#2c4c52]">{{ skill.proficiency }}%</span>
                            </div>
                            <div class="h-2 w-full bg-[#2c4c52]/10 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                                     :style="{ width: `${skill.proficiency}%`, backgroundColor: getProColor(skill.proficiency) }">
                                </div>
                            </div>
                        </div>

                        <div v-if="skill.verified" class="absolute top-2 right-12" v-tooltip.top="'Verified Skill'">
                            <i class="pi pi-check-circle text-green-500 text-sm bg-white rounded-full"></i>
                        </div>

                    </div>

                    <div v-if="filteredSkills.length === 0" class="col-span-full py-10 text-center border-2 border-dashed border-[#2c4c52]/10 rounded-3xl">
                        <span class="text-[#2c4c52]/40 font-mono text-sm">NO_DATA_FOUND</span>
                    </div>
                </div>
            </div>

        </div>

        <Dialog v-model:visible="skillDialog" modal :header="isEditing ? 'Adjust Parameters' : 'New Capability'" :style="{ width: '400px' }" class="y2k-dialog">
            <div class="flex flex-col gap-4 pt-4">
                <div class="space-y-1">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Skill Name</label>
                    <InputText v-model="skillForm.name" placeholder="e.g. React Native" class="y2k-input w-full" autofocus />
                </div>

                <div class="space-y-1">
                    <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">domain</label>
                    <Select v-model="skillForm.domain" :options="domainOptions" class="y2k-dropdown w-full !text-xs" />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between">
                        <label class="font-mono text-xs font-bold text-[#2c4c52] uppercase">Proficiency</label>
                        <span class="font-bold text-[#7bc5cd]">{{ skillForm.proficiency }}%</span>
                    </div>
                    <Slider v-model="skillForm.proficiency" class="w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center w-full pt-4 border-t border-[#2c4c52]/10 mt-2">
                    <Button v-if="isEditing" icon="pi pi-trash" text rounded severity="danger" @click="deleteSkill(skillForm)" />
                    <div v-else></div>
                    <div class="flex gap-2">
                         <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="skillDialog = false" />
                         <Button label="SAVE" class="y2k-button-primary !text-xs" @click="saveSkill" />
                    </div>
                </div>
            </template>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<style scoped>
/* Y2K Utilities */
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

.y2k-input {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}

:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.2) !important;
    border-radius: 8px !important;
}

:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #ffffff !important;
    border-color: #2c4c52 !important;
    color: #2c4c52;
}

/* Slider Customization */
:deep(.p-slider) {
    background: #e0f2f1;
}
:deep(.p-slider .p-slider-range) {
    background: #2c4c52;
}
:deep(.p-slider .p-slider-handle) {
    background: #7bc5cd;
    border: 2px solid #2c4c52;
}
</style>
