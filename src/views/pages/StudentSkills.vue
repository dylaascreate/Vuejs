<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { storeToRefs } from 'pinia';
import { useSkillStore } from '@/stores/skill';
import Skeleton from 'primevue/skeleton';

// Import the widget
import SkillRadarWidget from '@/components/devnexus/student/SkillRadarWidget.vue';

const toast = useToast();
const confirm = useConfirm();
const skillStore = useSkillStore();

// Access state from store
const { userSkills: skills, skills: systemSkills, loading } = storeToRefs(skillStore);

// [FIXED] Aligned 'Data-AI' with the domainOptions value so filtering works
const categories = ['All', 'Engineering', 'Data-AI', 'Infrastructure', 'Security', 'Product', 'Design'];
const activeDomain = ref('All');
const searchQuery = ref('');

const skillDialog = ref(false);
const skillForm = ref({ name: '', proficiency: 50, domain: 'Engineering' });
const isEditing = ref(false);

// AutoComplete Logic
const filteredSystemSkills = ref([]);

const searchSystemSkills = (event) => {
    const query = event.query.toLowerCase();
    filteredSystemSkills.value = (systemSkills.value || []).filter(s =>
        s.name.toLowerCase().includes(query)
    );
};

// Auto-Detect Domain Watcher
watch(() => skillForm.value.name, (newVal) => {
    let detectedDomain = null;
    if (typeof newVal === 'object' && newVal !== null && newVal.domain) {
        detectedDomain = newVal.domain;
    } else if (typeof newVal === 'string' && newVal.trim() !== '') {
        const match = (systemSkills.value || []).find(s => s.name.toLowerCase() === newVal.toLowerCase());
        if (match && match.domain) detectedDomain = match.domain;
    }
    if (detectedDomain) skillForm.value.domain = detectedDomain;
});

const domainOptions = ref([
    { label: 'Software Engineering & Development', value: 'Engineering' },
    { label: 'Data Science, AI & Machine Learning', value: 'Data-AI' },
    { label: 'Infrastructure, Cloud & DevOps', value: 'Infrastructure' },
    { label: 'Cybersecurity & Information Security', value: 'Security' },
    { label: 'Product, Business & Management', value: 'Product' },
    { label: 'User Experience (UX) & Design', value: 'Design' },
]);

const getDomainLabel = (domainValue) => {
    const option = domainOptions.value.find(opt => opt.value === domainValue);
    return option ? option.label : domainValue;
};

onMounted(() => {
    skillStore.fetchUserMatrix();
    skillStore.fetchSkills();
});

const filteredSkills = computed(() => {
    let result = skills.value || [];
    if (activeDomain.value !== 'All') result = result.filter(s => s.domain === activeDomain.value);
    if (searchQuery.value) result = result.filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
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

const openNew = () => {
    isEditing.value = false;
    skillForm.value = { name: '', proficiency: 50, domain: 'Engineering' };
    skillDialog.value = true;
};

const editSkill = (skill) => {
    isEditing.value = true;
    skillForm.value = { ...skill };
    skillDialog.value = true;
};

const saveSkill = async () => {
    let nameToSave = '';
    if (typeof skillForm.value.name === 'object' && skillForm.value.name !== null) {
        nameToSave = skillForm.value.name.name;
    } else {
        nameToSave = skillForm.value.name;
    }

    if (!nameToSave || nameToSave.trim() === '') return;

    try {
        const payload = {
            name: nameToSave,
            proficiency: skillForm.value.proficiency,
            domain: skillForm.value.domain
        };
        const idToUpdate = (isEditing.value && skillForm.value.id) ? skillForm.value.id : 'new';
        await skillStore.updateUserSkill(idToUpdate, payload);
        toast.add({ severity: 'success', summary: isEditing.value ? 'Matrix Updated' : 'New Capability', detail: isEditing.value ? 'Skill parameters adjusted.' : `Added ${nameToSave} to profile.`, life: 3000 });
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
    if (proficiency >= 80) return '#4ade80';
    if (proficiency >= 50) return '#7bc5cd';
    return '#facc15';
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">
        <div class="absolute inset-0 z-0 pointer-events-none opacity-10" style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 30px 30px;"></div>
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
                    <template v-if="loading">
                        <Skeleton width="120px" height="4rem" borderRadius="1.5rem"></Skeleton>
                        <Skeleton width="120px" height="4rem" borderRadius="1.5rem"></Skeleton>
                    </template>
                    <template v-else>
                        <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 px-5 rounded-2xl text-center shadow-sm">
                            <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Total Skills</div>
                            <div class="text-2xl font-black text-[#2c4c52]">{{ skills.length }}</div>
                        </div>
                        <div class="bg-white/40 backdrop-blur-md border border-white/60 p-3 px-5 rounded-2xl text-center shadow-sm">
                            <div class="text-[10px] font-mono font-bold text-[#4a7a82] uppercase">Avg. Mastery</div>
                            <div class="text-2xl font-black text-[#2c4c52]">{{ totalMastery }}%</div>
                        </div>
                    </template>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <SkillRadarWidget />

                <div class="bg-[#2c4c52] text-[#e0f2f1] p-6 rounded-3xl shadow-lg relative">
                    <div class="absolute top-0 right-0 p-4 opacity-10"><i class="pi pi-star-fill text-6xl"></i></div>
                    <h4 class="font-black !text-white text-lg uppercase mb-6 flex items-center gap-2 relative z-10">
                        <i class="pi pi-crown text-[#7bc5cd]"></i> Elite Skills
                    </h4>
                    <div class="space-y-4 relative z-10">
                        <template v-if="loading">
                            <div v-for="n in 3" :key="n" class="flex items-center gap-3">
                                <Skeleton shape="circle" size="2rem"></Skeleton>
                                <div class="flex-1">
                                    <Skeleton width="60%" height="0.8rem" class="mb-2"></Skeleton>
                                    <Skeleton width="100%" height="0.4rem"></Skeleton>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div v-for="(skill, index) in topSkills" :key="skill.id" class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-[#7bc5cd] text-[#2c4c52] flex items-center justify-center font-bold">{{ index + 1 }}</div>
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
                        </template>
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
                        <template v-if="loading">
                            <Skeleton width="6rem" height="2rem" v-for="n in 4" :key="n"></Skeleton>
                        </template>
                        <template v-else>
                            <button v-for="cat in categories" :key="cat"
                                @click="activeDomain = cat"
                                class="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 uppercase tracking-wide"
                                :class="activeDomain === cat ? 'bg-[#2c4c52] text-[#7bc5cd] shadow-sm' : 'text-[#4a7a82] hover:bg-white/50'">
                                {{ cat }}
                            </button>
                        </template>
                    </div>
                    <template v-if="loading">
                        <Skeleton width="12rem" height="2.5rem"></Skeleton>
                    </template>
                    <template v-else>
                        <IconField>
                            <InputIcon><i class="pi pi-search" /></InputIcon>
                            <InputText v-model="searchQuery" placeholder="Search Skills..." class="y2k-input !py-2 !text-xs !w-48" />
                        </IconField>
                    </template>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <template v-if="loading">
                        <div v-for="n in 6" :key="n" class="bg-white/40 border border-white rounded-2xl p-6 flex flex-col gap-4">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center gap-3">
                                    <Skeleton size="2.5rem" borderRadius="12px"></Skeleton>
                                    <div class="space-y-2">
                                        <Skeleton width="100px" height="1rem"></Skeleton>
                                        <Skeleton width="60px" height="0.6rem"></Skeleton>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-2 mt-auto">
                                <div class="flex justify-between">
                                    <Skeleton width="40px" height="0.6rem"></Skeleton>
                                    <Skeleton width="30px" height="1rem"></Skeleton>
                                </div>
                                <Skeleton width="100%" height="0.5rem" borderRadius="10px"></Skeleton>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div v-for="skill in filteredSkills" :key="skill.id"
                             class="group bg-white/60 backdrop-blur-md border border-white rounded-2xl p-4 hover:shadow-[0_10px_30px_-10px_rgba(44,76,82,0.1)] transition-all hover:-translate-y-1 relative flex flex-col">

                            <div class="flex justify-between items-start mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-[#e0f2f1] rounded-xl text-[#2c4c52]"><i class="pi pi-code"></i></div>
                                    <div>
                                        <h3 class="font-bold text-[#2c4c52] text-lg leading-none">{{ skill.name }}</h3>
                                        <span class="text-[10px] font-mono text-[#4a7a82] uppercase">{{ getDomainLabel(skill.domain) }}</span>
                                    </div>
                                </div>
                                <Button icon="pi pi-ellipsis-h" text rounded class="!text-[#2c4c52]/50 hover:!text-[#2c4c52]" @click="editSkill(skill)" />
                            </div>

                            <div class="mt-auto">
                                <div class="flex justify-between items-end mb-1">
                                    <span class="text-[10px] font-mono font-bold bg-[#2c4c52]/5 px-1.5 py-0.5 rounded" :style="{ color: getProColor(skill.proficiency) }">
                                        {{ getProLabel(skill.proficiency) }}
                                    </span>
                                    <span class="font-black text-lg text-[#2c4c52]">{{ skill.proficiency }}%</span>
                                </div>
                                <div class="h-2 w-full bg-[#2c4c52]/10 rounded-full overflow-hidden mb-2">
                                    <div class="h-full rounded-full transition-all duration-1000 ease-out" :style="{ width: `${skill.proficiency}%`, backgroundColor: getProColor(skill.proficiency) }"></div>
                                </div>
                            </div>
                        </div>

                        <div v-if="filteredSkills.length === 0" class="col-span-full py-10 text-center border-2 border-dashed border-[#2c4c52]/10 rounded-3xl">
                            <span class="text-[#2c4c52]/40 font-mono text-sm">NO_DATA_FOUND</span>
                        </div>
                    </template>
                </div>
        </div>
        </div>

        <Dialog v-model:visible="skillDialog" :style="{ width: '450px' }" modal class="y2k-dialog" :showHeader="false">
            <div class="flex justify-between items-center p-6 border-b border-[#2c4c52]/10 bg-[#fdfdfd]">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-[#2c4c52]/10 flex items-center justify-center text-[#2c4c52]">
                        <i class="pi" :class="isEditing ? 'pi-sliders-h' : 'pi-bolt'"></i>
                    </div>
                    <div>
                        <span class="block font-black text-[#2c4c52] uppercase text-lg leading-none tracking-tight">
                            {{ isEditing ? 'Calibrate Matrix' : 'New Acquisition' }}
                        </span>
                        <span class="font-mono text-[10px] font-bold text-[#7bc5cd] uppercase tracking-widest">
                            SYSTEM_OVERRIDE
                        </span>
                    </div>
                </div>
                <Button icon="pi pi-times" text rounded class="!text-[#2c4c52]/50 hover:!text-[#2c4c52]" @click="skillDialog = false" />
            </div>

            <div class="flex flex-col gap-6 p-6 bg-[#fdfdfd]">

                <div class="space-y-2">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1 flex items-center gap-2">
                        <i class="pi pi-tag text-[10px]"></i> Technology / Skill
                    </label>
                    <AutoComplete
                        v-model="skillForm.name"
                        :suggestions="filteredSystemSkills"
                        @complete="searchSystemSkills"
                        optionLabel="name"
                        placeholder="Browse Database..."
                        class="y2k-dropdown w-full"
                        inputClass="y2k-input w-full"
                        panelClass="y2k-panel"
                        :dropdown="true"
                    />
                </div>

                <div class="space-y-2">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1 flex items-center gap-2">
                        <i class="pi pi-sitemap text-[10px]"></i> Domain Category
                    </label>
                    <Select
                        v-model="skillForm.domain"
                        :options="domainOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="SELECT SECTOR..."
                        class="w-full y2k-dropdown"
                        :pt="{
                            root: { class: 'flex align-items-center' },
                            label: { class: 'font-bold text-sm text-[#2c4c52]' }
                        }"
                    />
                </div>

                <div class="bg-[#2c4c52]/5 rounded-xl p-4 border border-[#2c4c52]/10">
                    <div class="flex justify-between items-end mb-4">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase flex items-center gap-2">
                            <i class="pi pi-chart-bar text-[10px]"></i> Proficiency
                        </label>
                        <span class="font-black text-[#2c4c52] text-2xl">{{ skillForm.proficiency }}%</span>
                    </div>

                    <Slider v-model="skillForm.proficiency" class="y2k-slider mb-2" :step="5" />

                    <div class="flex justify-between text-[9px] font-mono font-bold text-[#4a7a82]/60 uppercase tracking-wider">
                        <span>Novice</span>
                        <span>Competent</span>
                        <span>Expert</span>
                        <span>Master</span>
                    </div>
                </div>
            </div>

            <div class="flex gap-3 justify-end p-6 border-t border-[#2c4c52]/10 bg-[#f8fafc]">
                <Button label="ABORT" icon="pi pi-times" text class="!text-[#2c4c52] !font-bold !text-xs !uppercase" @click="skillDialog = false" />
                <Button :label="isEditing ? 'UPDATE MATRIX' : 'INITIATE'" icon="pi pi-check" class="y2k-button-primary !text-xs !py-3 !px-6" @click="saveSkill" />
            </div>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>

    </div>
</template>
