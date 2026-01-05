<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// --- Explicit Imports ---
import Button from 'primevue/button';
import Chips from 'primevue/chips';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';

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
const activeParentCourse = ref(null); // Tracks which course we are adding content to
const itemToDelete = ref(null);
const deleteType = ref(null); // 'course' or 'topic'

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

// 1. Initial Data
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
            // Update
            const index = courses.value.findIndex(c => c.id === currentCourse.value.id);
            courses.value[index] = currentCourse.value;
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Course Updated', life: 3000 });
        } else {
            // Create
            currentCourse.value.id = createId();
            if(!currentCourse.value.topics) currentCourse.value.topics = [];
            courses.value.push(currentCourse.value);
            toast.add({ severity: 'success', summary: 'Created', detail: 'New Course Added', life: 3000 });
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
    activeParentCourse.value = parentCourse; // Keep track of parent
    currentTopic.value = { ...topic };
    topicDialog.value = true;
};

const saveTopic = () => {
    submitted.value = true;
    if (currentTopic.value.name) {
        // Find the actual parent object in the main array to update
        const parentIndex = courses.value.findIndex(c => c.id === activeParentCourse.value.id);
        const parent = courses.value[parentIndex];

        if (currentTopic.value.id) {
            // Update Existing Topic
            const topicIndex = parent.topics.findIndex(t => t.id === currentTopic.value.id);
            parent.topics[topicIndex] = currentTopic.value;
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Content Updated', life: 3000 });
        } else {
            // Create New Topic
            currentTopic.value.id = createId();
            parent.topics.push(currentTopic.value);
            toast.add({ severity: 'success', summary: 'Added', detail: 'Content Outline Added', life: 3000 });
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
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Course Removed', life: 3000 });
    } else {
        const parentIndex = courses.value.findIndex(c => c.id === activeParentCourse.value.id);
        courses.value[parentIndex].topics = courses.value[parentIndex].topics.filter(t => t.id !== itemToDelete.value.id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Content Removed', life: 3000 });
    }
    deleteDialog.value = false;
};

// --- Helpers ---
const createId = () => Math.floor(Math.random() * 10000).toString();
const getDeptColor = (dept) => {
    switch (dept) {
        case 'CS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
        case 'DES': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
        default: return 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300';
    }
};

// Expand/Collapse All
const expandAll = () => {
    expandedRows.value = courses.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
    expandedRows.value = null;
};
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <div>
                    <h4 class="m-0 font-bold text-xl">Course Management</h4>
                    <span class="text-sm text-muted-color">Manage Courses > Expand to view Content & Skills</span>
                </div>
            </template>
            <template #end>
                <div class="flex gap-2">
                    <Button label="Expand All" icon="pi pi-angle-double-down" text @click="expandAll" />
                    <Button label="Collapse All" icon="pi pi-angle-double-up" text @click="collapseAll" />
                    <Button label="New Course" icon="pi pi-plus" severity="primary" @click="openNewCourse" />
                </div>
            </template>
        </Toolbar>

        <DataTable v-model:expandedRows="expandedRows" :value="courses" dataKey="id" :filters="filters">
            <template #header>
                <div class="flex justify-end">
                    <IconField>
                        <InputIcon><i class="pi pi-search" /></InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search Courses..." />
                    </IconField>
                </div>
            </template>

            <Column expander style="width: 3rem" />

            <Column field="code" header="Code" sortable style="width: 100px; font-weight: bold;"></Column>
            <Column field="name" header="Course Name" sortable></Column>

            <Column field="semester" header="Semester" sortable style="width: 150px">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.semester" severity="info" />
                </template>
            </Column>

            <Column field="department" header="Dept" sortable style="width: 100px">
                <template #body="slotProps">
                    <span :class="['px-2 py-1 rounded text-xs font-bold', getDeptColor(slotProps.data.department)]">
                        {{ slotProps.data.department }}
                    </span>
                </template>
            </Column>

            <Column field="credits" header="Credits" style="width: 80px" class="text-center"></Column>

            <Column header="Actions" style="width: 140px; text-align: center">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" text rounded severity="info" @click="editCourse(slotProps.data)" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteCourse(slotProps.data)" />
                </template>
            </Column>

            <template #expansion="slotProps">
                <div class="p-4 bg-surface-50 dark:bg-surface-900 border-l-4 border-primary rounded-r-lg">
                    <div class="flex justify-between items-center mb-3">
                        <h5 class="font-bold m-0 text-primary">Content Outline for {{ slotProps.data.name }}</h5>
                        <Button label="Add Content" icon="pi pi-plus" size="small" severity="success" outlined @click="openNewTopic(slotProps.data)" />
                    </div>

                    <DataTable :value="slotProps.data.topics" size="small" stripedRows>
                        <template #empty>No content outlines added yet.</template>

                        <Column field="name" header="Topic / Week Name" style="width: 30%"></Column>

                        <Column field="skills" header="Associated Skills">
                            <template #body="subProps">
                                <div class="flex flex-wrap gap-1">
                                    <span v-for="skill in subProps.data.skills" :key="skill"
                                          class="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-2 py-1 rounded text-xs font-medium text-surface-600 dark:text-surface-300 shadow-sm">
                                        <i class="pi pi-bolt text-yellow-500 text-xs mr-1"></i>{{ skill }}
                                    </span>
                                </div>
                            </template>
                        </Column>

                        <Column style="width: 4rem; text-align: right">
                            <template #body="subProps">
                                <div class="flex gap-1 justify-end">
                                    <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" @click="editTopic(subProps.data, slotProps.data)" />
                                    <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteTopic(subProps.data, slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </template>
        </DataTable>

        <Dialog v-model:visible="courseDialog" :style="{ width: '500px' }" header="Course Details" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4 pt-4">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-1">
                         <label class="font-bold block mb-2">Code</label>
                         <InputText v-model.trim="currentCourse.code" required="true" placeholder="CS101" />
                    </div>
                    <div class="col-span-2">
                        <label class="font-bold block mb-2">Course Name</label>
                        <InputText v-model.trim="currentCourse.name" required="true" />
                        <small class="text-red-500" v-if="submitted && !currentCourse.name">Required.</small>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="font-bold block mb-2">Semester</label>
                        <Dropdown v-model="currentCourse.semester" :options="semesters" optionLabel="label" optionValue="value" />
                    </div>
                    <div>
                         <label class="font-bold block mb-2">Department</label>
                         <Dropdown v-model="currentCourse.department" :options="departments" optionLabel="label" optionValue="value" />
                    </div>
                </div>
                <div>
                    <label class="font-bold block mb-2">Credits</label>
                    <InputNumber v-model="currentCourse.credits" :min="1" :max="6" showButtons />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="courseDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveCourse" />
            </template>
        </Dialog>

        <Dialog v-model:visible="topicDialog" :style="{ width: '450px' }" header="Content Outline" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4 pt-4">
                <div>
                    <label class="font-bold block mb-2">Outline Name</label>
                    <InputText v-model.trim="currentTopic.name" placeholder="e.g. Week 1: Introduction" required="true" />
                    <small class="text-red-500" v-if="submitted && !currentTopic.name">Required.</small>
                </div>
                <div>
                    <label class="font-bold block mb-2">Skills</label>
                    <Chips v-model="currentTopic.skills" separator="," placeholder="Type skill & enter" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="topicDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveTopic" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '400px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                <span>Are you sure you want to delete this?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteItem" />
            </template>
        </Dialog>
    </div>
</template>
