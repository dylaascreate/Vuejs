<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const courses = ref([]);
const expandedRows = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Dialogs
const courseDialog = ref(false);
const topicDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);

// State
const currentCourse = ref({});
const currentTopic = ref({});
const activeParentCourse = ref(null);
const itemToDelete = ref(null);
const deleteType = ref(null);

// Options
const semesters = ref([
    { label: 'Year 1 - Sem 1', value: 'Y1S1' },
    { label: 'Year 1 - Sem 2', value: 'Y1S2' },
    { label: 'Year 2 - Sem 1', value: 'Y2S1' },
    { label: 'Year 3 - Sem 1', value: 'Y3S1' }
]);

const departments = ref([
    { label: 'Computer Science', value: 'CS' },
    { label: 'Mathematics', value: 'MATH' },
    { label: 'Engineering', value: 'ENG' },
    { label: 'Design', value: 'DES' }
]);

// Initial Data
onMounted(() => {
    courses.value = [
        {
            id: '100',
            code: 'CS101',
            name: 'Intro to Programming',
            semester: 'Y1S1',
            department: 'CS',
            credits: 3,
            topics: [
                { id: 't1', name: 'Week 1: Setup & Variables', skills: ['Python Installation', 'Variables', 'Data Types'] },
                { id: 't2', name: 'Week 2: Control Flow', skills: ['If/Else Logic', 'Loops'] }
            ]
        },
        {
            id: '101',
            code: 'DES3053',
            name: 'Software Testing',
            semester: 'Y3S1',
            department: 'DES',
            credits: 3,
            topics: [
                { id: 't3', name: 'Phase 1: Manual Testing', skills: ['Black Box Testing', 'Test Case Design'] },
                { id: 't4', name: 'Phase 2: Automation', skills: ['Selenium', 'Java', 'JUnit'] }
            ]
        }
    ];
});

// --- Course Actions ---
const openNewCourse = () => {
    currentCourse.value = { topics: [] };
    submitted.value = false;
    courseDialog.value = true;
};

const saveCourse = () => {
    submitted.value = true;
    if (currentCourse.value.name && currentCourse.value.code) {
        if (currentCourse.value.id) {
            const index = courses.value.findIndex(c => c.id === currentCourse.value.id);
            courses.value[index] = currentCourse.value;
            toast.add({ severity: 'success', summary: 'System Update', detail: 'Course Module Updated', life: 3000 });
        } else {
            currentCourse.value.id = createId();
            if(!currentCourse.value.topics) currentCourse.value.topics = [];
            courses.value.push(currentCourse.value);
            toast.add({ severity: 'success', summary: 'New Node', detail: 'Course Module Initialized', life: 3000 });
        }
        courseDialog.value = false;
    }
};

const editCourse = (course) => {
    currentCourse.value = { ...course };
    courseDialog.value = true;
};

// --- Topic Actions ---
const openNewTopic = (parentCourse) => {
    activeParentCourse.value = parentCourse;
    currentTopic.value = { skills: [] };
    submitted.value = false;
    topicDialog.value = true;
};

const editTopic = (topic, parentCourse) => {
    activeParentCourse.value = parentCourse;
    currentTopic.value = { ...topic };
    topicDialog.value = true;
};

const saveTopic = () => {
    submitted.value = true;
    if (currentTopic.value.name) {
        const parentIndex = courses.value.findIndex(c => c.id === activeParentCourse.value.id);
        const parent = courses.value[parentIndex];

        if (currentTopic.value.id) {
            const topicIndex = parent.topics.findIndex(t => t.id === currentTopic.value.id);
            parent.topics[topicIndex] = currentTopic.value;
            toast.add({ severity: 'success', summary: 'Content Updated', detail: 'Syllabus node modified', life: 3000 });
        } else {
            currentTopic.value.id = createId();
            parent.topics.push(currentTopic.value);
            toast.add({ severity: 'success', summary: 'Content Added', detail: 'Syllabus node appended', life: 3000 });
        }
        topicDialog.value = false;
    }
};

// --- Delete Actions ---
const confirmDeleteCourse = (course) => {
    itemToDelete.value = course;
    deleteType.value = 'course';
    deleteDialog.value = true;
};

const confirmDeleteTopic = (topic, parentCourse) => {
    itemToDelete.value = topic;
    activeParentCourse.value = parentCourse;
    deleteType.value = 'topic';
    deleteDialog.value = true;
};

const deleteItem = () => {
    if (deleteType.value === 'course') {
        courses.value = courses.value.filter(c => c.id !== itemToDelete.value.id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Course removed from registry', life: 3000 });
    } else {
        const parentIndex = courses.value.findIndex(c => c.id === activeParentCourse.value.id);
        courses.value[parentIndex].topics = courses.value[parentIndex].topics.filter(t => t.id !== itemToDelete.value.id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Content node removed', life: 3000 });
    }
    deleteDialog.value = false;
};

const createId = () => Math.floor(Math.random() * 10000).toString();

const getDeptColor = (dept) => {
    switch (dept) {
        case 'CS': return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'DES': return 'bg-purple-50 text-purple-600 border-purple-200';
        case 'MATH': return 'bg-green-50 text-green-600 border-green-200';
        case 'ENG': return 'bg-orange-50 text-orange-600 border-orange-200';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

const expandAll = () => {
    expandedRows.value = courses.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
    expandedRows.value = null;
};
</script>

<template>
    <div class="relative min-h-[85vh] font-sans text-[#2c4c52]">

        <div class="absolute inset-0 z-0 pointer-events-none opacity-20"
             style="background-image: linear-gradient(#7bc5cd 1px, transparent 1px), linear-gradient(90deg, #7bc5cd 1px, transparent 1px); background-size: 40px 40px;">
        </div>
        <div class="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#7bc5cd] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-12 gap-8 p-4">

            <div class="col-span-12 flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2c4c52]/5 border border-[#2c4c52]/10 mb-2">
                        <i class="pi pi-book text-xs text-[#2c4c52]"></i>
                        <span class="font-mono text-xs font-bold text-[#2c4c52]/70 tracking-widest uppercase">ACADEMIC_REGISTRY_V1</span>
                    </div>
                    <h2 class="text-3xl font-black text-[#2c4c52] uppercase tracking-tighter">Course Management</h2>
                </div>

                <div class="flex gap-2">
                    <Button label="EXPAND_ALL" icon="pi pi-angle-double-down" class="y2k-button-secondary !hidden md:!flex" @click="expandAll" />
                    <Button label="COLLAPSE_ALL" icon="pi pi-angle-double-up" class="y2k-button-secondary !hidden md:!flex" @click="collapseAll" />
                    <Button label="NEW_COURSE" icon="pi pi-plus" class="y2k-button-primary" @click="openNewCourse" />
                </div>
            </div>

            <div class="col-span-12">
                <div class="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm overflow-hidden">

                    <DataTable v-model:expandedRows="expandedRows" :value="courses" dataKey="id" :filters="filters"
                               class="y2k-table" responsiveLayout="scroll">

                        <template #header>
                            <div class="flex justify-end mb-2">
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search text-[#2c4c52]/50" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="SEARCH CATALOG..." class="y2k-input !py-2 !text-xs !pl-8 !w-64" />
                                </IconField>
                            </div>
                        </template>

                        <Column expander style="width: 3rem" />

                        <Column field="code" header="CODE" sortable style="min-width: 6rem">
                            <template #body="slotProps">
                                <span class="font-mono text-xs font-bold bg-[#2c4c52] text-[#7bc5cd] px-2 py-1 rounded">
                                    {{ slotProps.data.code }}
                                </span>
                            </template>
                        </Column>

                        <Column field="name" header="COURSE_TITLE" sortable style="min-width: 14rem">
                            <template #body="slotProps">
                                <span class="font-bold text-[#2c4c52]">{{ slotProps.data.name }}</span>
                            </template>
                        </Column>

                        <Column field="semester" header="TIMELINE" sortable style="width: 10rem">
                            <template #body="slotProps">
                                <span class="font-mono text-[10px] text-[#4a7a82] font-bold uppercase border border-[#2c4c52]/20 px-2 py-1 rounded">
                                    {{ slotProps.data.semester }}
                                </span>
                            </template>
                        </Column>

                        <Column field="department" header="DEPT" sortable style="width: 8rem">
                            <template #body="slotProps">
                                <span :class="['px-2 py-1 rounded text-[10px] font-bold uppercase border', getDeptColor(slotProps.data.department)]">
                                    {{ slotProps.data.department }}
                                </span>
                            </template>
                        </Column>

                        <Column field="credits" header="CR" style="width: 4rem" class="text-center">
                            <template #body="slotProps">
                                <span class="font-bold text-[#2c4c52]">{{ slotProps.data.credits }}</span>
                            </template>
                        </Column>

                        <Column header="OPS" style="width: 8rem; text-align: center">
                            <template #body="slotProps">
                                <div class="flex gap-1 justify-center">
                                    <Button icon="pi pi-pencil" text rounded class="!text-[#2c4c52] !w-8 !h-8 hover:bg-[#2c4c52]/10"
                                            @click="editCourse(slotProps.data)" />
                                    <Button icon="pi pi-trash" text rounded class="!text-red-500 !w-8 !h-8 hover:bg-red-50"
                                            @click="confirmDeleteCourse(slotProps.data)" />
                                </div>
                            </template>
                        </Column>

                        <template #expansion="slotProps">
                            <div class="p-4 bg-[#2c4c52]/5 border-l-4 border-[#7bc5cd] rounded-r-xl ml-4 my-2">
                                <div class="flex justify-between items-center mb-3">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-list text-[#2c4c52]"></i>
                                        <h5 class="font-black m-0 text-[#2c4c52] uppercase text-sm">Syllabus Outline: {{ slotProps.data.code }}</h5>
                                    </div>
                                    <Button label="ADD_CONTENT" icon="pi pi-plus" class="y2k-button-secondary !text-[10px] !py-1 !px-2"
                                            @click="openNewTopic(slotProps.data)" />
                                </div>

                                <DataTable :value="slotProps.data.topics" class="y2k-table-nested" stripedRows>
                                    <template #empty>
                                        <span class="text-xs font-mono text-[#4a7a82]">NO CONTENT OUTLINES DEFINED.</span>
                                    </template>

                                    <Column field="name" header="TOPIC_WEEK" style="width: 30%">
                                        <template #body="subProps">
                                            <span class="font-bold text-xs text-[#2c4c52]">{{ subProps.data.name }}</span>
                                        </template>
                                    </Column>

                                    <Column field="skills" header="TARGET_SKILLS">
                                        <template #body="subProps">
                                            <div class="flex flex-wrap gap-1">
                                                <span v-for="skill in subProps.data.skills" :key="skill"
                                                      class="bg-white border border-[#2c4c52]/20 px-2 py-0.5 rounded text-[10px] font-bold text-[#2c4c52] flex items-center gap-1">
                                                    <i class="pi pi-bolt text-[#7bc5cd] text-[8px]"></i>{{ skill }}
                                                </span>
                                            </div>
                                        </template>
                                    </Column>

                                    <Column style="width: 4rem; text-align: right">
                                        <template #body="subProps">
                                            <div class="flex gap-1 justify-end">
                                                <Button icon="pi pi-pencil" text rounded class="!text-[#2c4c52] !w-6 !h-6 !p-0"
                                                        @click="editTopic(subProps.data, slotProps.data)" />
                                                <Button icon="pi pi-trash" text rounded class="!text-red-500 !w-6 !h-6 !p-0"
                                                        @click="confirmDeleteTopic(subProps.data, slotProps.data)" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="courseDialog" :style="{ width: '500px' }" modal class="y2k-dialog">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-book text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase text-lg">Course Configuration</span>
                </div>
            </template>

            <div class="flex flex-col gap-5 pt-4">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-1 space-y-1">
                         <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Code</label>
                         <InputText v-model.trim="currentCourse.code" required="true" placeholder="CS101" class="w-full y2k-input" />
                    </div>
                    <div class="col-span-2 space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Course Name</label>
                        <InputText v-model.trim="currentCourse.name" required="true" class="w-full y2k-input"
                                   :class="{ '!border-red-500': submitted && !currentCourse.name }" />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Semester</label>
                        <Select v-model="currentCourse.semester" :options="semesters" optionLabel="label" optionValue="value" class="w-full y2k-dropdown" />
                    </div>
                    <div class="space-y-1">
                         <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Department</label>
                         <Select v-model="currentCourse.department" :options="departments" optionLabel="label" optionValue="value" class="w-full y2k-dropdown" />
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Credits</label>
                    <InputNumber v-model="currentCourse.credits" :min="1" :max="6" showButtons class="w-full" inputClass="y2k-input" />
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="courseDialog = false" />
                    <Button label="SAVE MODULE" class="y2k-button-primary !text-xs !py-2" @click="saveCourse" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="topicDialog" :style="{ width: '450px' }" modal class="y2k-dialog">
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-list text-[#2c4c52]"></i>
                    <span class="font-black text-[#2c4c52] uppercase text-lg">Content Outline</span>
                </div>
            </template>
            <div class="flex flex-col gap-5 pt-4">
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Outline Name</label>
                    <InputText v-model.trim="currentTopic.name" placeholder="e.g. Week 1: Introduction" required="true" class="w-full y2k-input" />
                </div>
                <div class="space-y-1">
                    <label class="font-mono text-[10px] font-bold text-[#4a7a82] uppercase ml-1">Mapped Skills</label>
                    <Chips v-model="currentTopic.skills" separator="," placeholder="Type skill & enter" class="w-full"
                           :pt="{
                               input: { class: 'y2k-input' },
                               token: { class: 'bg-[#2c4c52] text-[#7bc5cd] font-bold' }
                           }" />
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4 border-t border-[#2c4c52]/10">
                    <Button label="CANCEL" text class="!text-[#2c4c52] !font-bold !text-xs" @click="topicDialog = false" />
                    <Button label="SAVE CONTENT" class="y2k-button-primary !text-xs !py-2" @click="saveTopic" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '400px' }" modal class="y2k-dialog">
            <template #header>
                <span class="font-black text-[#2c4c52] uppercase text-lg">Confirm Removal</span>
            </template>
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                <span class="text-[#2c4c52] text-sm">Are you sure you want to delete this node?</span>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end pt-4">
                    <Button label="ABORT" text class="!text-[#2c4c52] !font-bold !text-xs" @click="deleteDialog = false" />
                    <Button label="CONFIRM DELETION" severity="danger" class="!font-bold !text-xs" @click="deleteItem" />
                </div>
            </template>
        </Dialog>
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
    box-shadow: 0 4px 15px rgba(44, 76, 82, 0.3);
}
.y2k-button-primary:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.y2k-button-secondary {
    background: transparent !important;
    border: 2px solid rgba(44, 76, 82, 0.1) !important;
    color: #2c4c52 !important;
    font-weight: 800 !important;
    border-radius: 9999px !important;
    text-transform: uppercase;
    font-size: 0.75rem !important;
}

.y2k-input, :deep(.y2k-input) {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
    color: #2c4c52 !important;
    font-weight: 600 !important;
}

:deep(.y2k-dropdown) {
    background: rgba(255, 255, 255, 0.6) !important;
    border: 1px solid rgba(44, 76, 82, 0.15) !important;
    border-radius: 8px !important;
}

/* DataTable Customization */
:deep(.y2k-table .p-datatable-header) {
    background: transparent;
    border: none;
    padding: 0;
}
:deep(.y2k-table .p-datatable-thead > tr > th) {
    background: transparent;
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 900;
    color: #4a7a82;
    border-bottom: 2px solid rgba(44, 76, 82, 0.1);
    padding: 1rem;
}
:deep(.y2k-table .p-datatable-tbody > tr) {
    background: transparent;
}
:deep(.y2k-table .p-datatable-tbody > tr:hover) {
    background: rgba(44, 76, 82, 0.02);
}
:deep(.y2k-table .p-datatable-tbody > tr > td) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
    padding: 1rem;
}

/* Nested Table Styling */
:deep(.y2k-table-nested .p-datatable-thead > tr > th) {
    font-size: 0.65rem;
    color: #2c4c52;
    padding: 0.5rem;
}
:deep(.y2k-table-nested .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
    border-bottom: 1px dashed rgba(44, 76, 82, 0.1);
}

/* Dialogs */
:deep(.y2k-dialog .p-dialog-header),
:deep(.y2k-dialog .p-dialog-content),
:deep(.y2k-dialog .p-dialog-footer) {
    background: #fdfdfd !important;
    color: #2c4c52;
}
:deep(.y2k-dialog .p-dialog-header) {
    border-bottom: 1px solid rgba(44, 76, 82, 0.05);
}
</style>
