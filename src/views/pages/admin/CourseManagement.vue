<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const expandedRows = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Dialogs & State
const courseDialog = ref(false);
const topicDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);

// State for Editing/Deleting
const currentCourse = ref({});
const currentTopic = ref({});
const activeParentCourse = ref(null); // Tracks which course a topic belongs to
const itemToDelete = ref(null);
const deleteType = ref(null); // 'course' or 'topic'

// --- Mock Data ---
// Transform the course_db data into the UI format
const courses = ref([
  {
    id: '1',
    code: 'DEK3023',
    name: 'Probability and Statistical Data Analysis',
    semester: 'Y2S1',
    department: 'MATH',
    credits: 3,
    topics: [
      { id: 't1-1', name: 'Week 1: Statistics & Variables', skills: ["Statistical Data Analysis", "Probability Modeling"] },
      { id: 't1-2', name: 'Week 2-4: Probability & Experiments', skills: ["Hypothesis Testing", "Data Visualization"] },
      { id: 't1-3', name: 'Week 8-14: Estimation & Regression', skills: ["Python (Pandas)", "Linear Regression"] }
    ]
  },
  {
    id: '2',
    code: 'DEK3033',
    name: 'Numerical Methods For Computing',
    semester: 'Y2S1',
    department: 'MATH',
    credits: 3,
    topics: [
      { id: 't2-1', name: 'Week 1-3: Computational Algorithms', skills: ["Numerical Analysis", "Algorithm Design"] },
      { id: 't2-2', name: 'Week 4-6: Linear Equations', skills: ["MATLAB", "LU Factorization"] },
      { id: 't2-3', name: 'Week 7-12: Calculus & Interpolation', skills: ["Numerical Integration", "Curve Fitting"] }
    ]
  },
  {
    id: '3',
    code: 'DEP3013',
    name: 'Instructional Tech in Courseware Dev',
    semester: 'Y3S1',
    department: 'DES',
    credits: 3,
    topics: [
      { id: 't3-1', name: 'Week 1-4: ISD Models', skills: ["Instructional Design (ADDIE)", "Learning Theories"] },
      { id: 't3-2', name: 'Week 5-7: UI/UX & Storyboarding', skills: ["Figma", "User Interface Design"] },
      { id: 't3-3', name: 'Week 9-14: VR/AR Development', skills: ["Unity", "Educational Software Engineering"] }
    ]
  },
  {
    id: '4',
    code: 'DEQ3063',
    name: 'Software Project Management',
    semester: 'Y3S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't4-1', name: 'Week 1-4: Project Initiation', skills: ["Feasibility Analysis", "Stakeholder Management"] },
      { id: 't4-2', name: 'Week 5-9: Estimation & Planning', skills: ["Agile (Scrum)", "COCOMO II"] },
      { id: 't4-3', name: 'Week 10-14: Scheduling & Risk', skills: ["Gantt Charts", "Risk Management"] }
    ]
  },
  {
    id: '5',
    code: 'DEQ3093',
    name: 'Software Configuration Management',
    semester: 'Y3S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't5-1', name: 'Week 1-3: SCM Concepts', skills: ["Version Control (Git)", "Baseline Management"] },
      { id: 't5-2', name: 'Week 4-8: Change Control', skills: ["CI/CD Pipelines", "Change Request Protocols"] },
      { id: 't5-3', name: 'Week 9-14: Verification & Audit', skills: ["Software Auditing", "Release Management"] }
    ]
  },
  {
    id: '6',
    code: 'DES3043',
    name: 'Software Design',
    semester: 'Y2S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't6-1', name: 'Week 1-4: Architecture Views', skills: ["Software Architecture", "Mobile App Design"] },
      { id: 't6-2', name: 'Week 5-9: Web & API Design', skills: ["Microservices", "RESTful API Design"] },
      { id: 't6-3', name: 'Week 10-14: Detailed Design', skills: ["Design Patterns", "SDD Documentation"] }
    ]
  },
  {
    id: '7',
    code: 'DES3023',
    name: 'Software Requirements & Specs',
    semester: 'Y1S2',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't7-1', name: 'Week 1-4: Elicitation', skills: ["Requirements Engineering", "Stakeholder Interviews"] },
      { id: 't7-2', name: 'Week 5-9: UML Modeling', skills: ["UML (Use Case/Sequence)", "StarUML"] },
      { id: 't7-3', name: 'Week 10-14: SRS Documentation', skills: ["Technical Writing", "Requirements Validation"] }
    ]
  },
  {
    id: '8',
    code: 'DES3073',
    name: 'Software Engineering Project',
    semester: 'Y3S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't8-1', name: 'Week 1-4: Architecture & SRS', skills: ["Full-Stack Dev (Laravel)", "Database Design"] },
      { id: 't8-2', name: 'Week 5-10: Backend/Frontend Dev', skills: ["Defensive Programming", "API Integration"] },
      { id: 't8-3', name: 'Week 11-14: Testing & Migration', skills: ["Regression Testing", "System Deployment"] }
    ]
  },
  {
    id: '9',
    code: 'DES3053',
    name: 'Software Testing and Quality',
    semester: 'Y3S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't9-1', name: 'Week 1-3: Testing Lifecycles', skills: ["SQA", "Component Testing"] },
      { id: 't9-2', name: 'Week 4-9: Dynamic Testing', skills: ["Black-Box Testing", "White-Box Testing"] },
      { id: 't9-3', name: 'Week 10-14: UAT & API Testing', skills: ["User Acceptance Testing", "Postman"] }
    ]
  },
  {
    id: '10',
    code: 'DES3113',
    name: 'Mobile App Design & Development',
    semester: 'Y3S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't10-1', name: 'Week 1-4: Flutter Architecture', skills: ["Flutter & Dart", "Declarative UI"] },
      { id: 't10-2', name: 'Week 5-9: Interaction & Persistence', skills: ["Firebase Firestore", "State Management"] },
      { id: 't10-3', name: 'Week 10-14: Advanced UI & Deploy', skills: ["App Store Deployment", "Push Notifications"] }
    ]
  },
  {
    id: '11',
    code: 'DTN3023',
    name: 'Computer Networks',
    semester: 'Y1S2',
    department: 'ENG',
    credits: 3,
    topics: [
      { id: 't11-1', name: 'Week 1-4: Application Layer', skills: ["TCP/IP", "DNS Protocols"] },
      { id: 't11-2', name: 'Week 5-11: Transport & Network', skills: ["Routing Algorithms", "IPv4 Subnetting"] },
      { id: 't11-3', name: 'Week 12-14: Data Link Layer', skills: ["MAC Addressing", "Packet Analysis"] }
    ]
  },
  {
    id: '12',
    code: 'DTN3043',
    name: 'Operating Systems',
    semester: 'Y2S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't12-1', name: 'Week 1-6: Process Management', skills: ["Thread Management", "Scheduling"] },
      { id: 't12-2', name: 'Week 7-9: Memory Management', skills: ["Paging & Segmentation", "Virtual Memory"] },
      { id: 't12-3', name: 'Week 10-14: Storage & Security', skills: ["RAID Structures", "Access Matrix"] }
    ]
  },
  {
    id: '13',
    code: 'DTS3013',
    name: 'Structured Programming',
    semester: 'Y1S1',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't13-1', name: 'Week 1-4: Syntax & Logic', skills: ["C++ Programming", "Control Structures"] },
      { id: 't13-2', name: 'Week 5-9: Functions & Pointers', skills: ["Memory Management", "Modular Programming"] },
      { id: 't13-3', name: 'Week 10-14: Arrays & Structs', skills: ["Data Structures", "File I/O"] }
    ]
  },
  {
    id: '14',
    code: 'DTS3093',
    name: 'Object Oriented Programming',
    semester: 'Y1S2',
    department: 'CS',
    credits: 3,
    topics: [
      { id: 't14-1', name: 'Week 1-5: OOP Principles', skills: ["Encapsulation", "Java Programming"] },
      { id: 't14-2', name: 'Week 6-11: Class Diagrams', skills: ["UML Modeling", "Java Collections"] },
      { id: 't14-3', name: 'Week 12-14: Advanced OOP', skills: ["Inheritance", "Polymorphism"] }
    ]
  }
]);

// Since we defined the data directly in the ref, we can leave onMounted empty or use it to clear filters
onMounted(() => {
    // Data is already reactive in the courses ref above
});

// Options
const semesters = ref([
    { label: 'Year 1 - Sem 1', value: 'Y1S1' },
    { label: 'Year 1 - Sem 2', value: 'Y1S2' },
    { label: 'Year 2 - Sem 1', value: 'Y2S1' },
    { label: 'Year 2 - Sem 2', value: 'Y2S2' },
    { label: 'Year 3 - Sem 1', value: 'Y3S1' }
]);

const departments = ref([
    { label: 'Computer Science', value: 'CS' },
    { label: 'Mathematics', value: 'MATH' },
    { label: 'Design', value: 'DES' },
    { label: 'Engineering', value: 'ENG' }
]);

// Helper Functions
const getDeptColor = (dept) => {
    switch (dept) {
        case 'CS': return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'DES': return 'bg-purple-50 text-purple-600 border-purple-200';
        case 'MATH': return 'bg-green-50 text-green-600 border-green-200';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

const createId = () => Math.floor(Math.random() * 100000).toString();

// ==========================================
//  ACTIONS: Expand / Collapse
// ==========================================
const expandAll = () => {
    const _expandedRows = {};
    courses.value.forEach((c) => (_expandedRows[c.id] = true));
    expandedRows.value = _expandedRows;
    toast.add({ severity: 'info', summary: 'Expanded', detail: 'All rows expanded', life: 1000 });
};

const collapseAll = () => {
    expandedRows.value = {};
    toast.add({ severity: 'info', summary: 'Collapsed', detail: 'All rows collapsed', life: 1000 });
};

// ==========================================
//  ACTIONS: Course CRUD
// ==========================================
const openNewCourse = () => {
    currentCourse.value = {
        department: 'CS',
        semester: 'Y1S1',
        credits: 3,
        topics: [] // Initialize empty topics
    };
    submitted.value = false;
    courseDialog.value = true;
};

const editCourse = (course) => {
    currentCourse.value = { ...course }; // Clone object
    courseDialog.value = true;
};

const saveCourse = () => {
    submitted.value = true;

    if (currentCourse.value.name && currentCourse.value.code) {
        if (currentCourse.value.id) {
            // Update Existing
            const index = courses.value.findIndex(c => c.id === currentCourse.value.id);
            courses.value[index] = currentCourse.value;
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Course updated successfully', life: 3000 });
        } else {
            // Create New
            currentCourse.value.id = createId();
            // Ensure topics array exists
            if (!currentCourse.value.topics) currentCourse.value.topics = [];
            courses.value.push(currentCourse.value);
            toast.add({ severity: 'success', summary: 'Created', detail: 'New course added', life: 3000 });
        }
        courseDialog.value = false;
        currentCourse.value = {};
    }
};

const confirmDeleteCourse = (course) => {
    itemToDelete.value = course;
    deleteType.value = 'course';
    deleteDialog.value = true;
};

// ==========================================
//  ACTIONS: Topic CRUD
// ==========================================
const openNewTopic = (parentCourse) => {
    activeParentCourse.value = parentCourse;
    currentTopic.value = { skills: [] }; // Initialize with empty skills
    topicDialog.value = true;
};

const editTopic = (topic, parentCourse) => {
    activeParentCourse.value = parentCourse;
    // Clone to avoid direct mutation until save
    currentTopic.value = { ...topic, skills: [...(topic.skills || [])] };
    topicDialog.value = true;
};

const saveTopic = () => {
    if (!currentTopic.value.name) return;

    // Find the parent course in the reactive array
    const parentIndex = courses.value.findIndex(c => c.id === activeParentCourse.value.id);
    if (parentIndex === -1) return;

    const parent = courses.value[parentIndex];

    if (currentTopic.value.id) {
        // Update Existing Topic
        const topicIndex = parent.topics.findIndex(t => t.id === currentTopic.value.id);
        if (topicIndex !== -1) {
            parent.topics[topicIndex] = currentTopic.value;
        }
        toast.add({ severity: 'success', summary: 'Content Updated', detail: 'Topic modified.', life: 3000 });
    } else {
        // Create New Topic
        currentTopic.value.id = 't-' + createId();
        // Ensure skills is array
        if (!Array.isArray(currentTopic.value.skills)) currentTopic.value.skills = [];
        parent.topics.push(currentTopic.value);

        // Auto-expand the parent row to show the new topic
        expandedRows.value[parent.id] = true;
        toast.add({ severity: 'success', summary: 'Content Added', detail: 'New topic added to syllabus.', life: 3000 });
    }

    topicDialog.value = false;
    currentTopic.value = {};
};

const confirmDeleteTopic = (topic, parentCourse) => {
    itemToDelete.value = topic;
    activeParentCourse.value = parentCourse;
    deleteType.value = 'topic';
    deleteDialog.value = true;
};

// ==========================================
//  ACTIONS: Unified Delete
// ==========================================
const deleteItem = () => {
    if (deleteType.value === 'course') {
        courses.value = courses.value.filter(c => c.id !== itemToDelete.value.id);
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Course removed from registry.', life: 3000 });
    }
    else if (deleteType.value === 'topic') {
        const parentIndex = courses.value.findIndex(c => c.id === activeParentCourse.value.id);
        if (parentIndex !== -1) {
            courses.value[parentIndex].topics = courses.value[parentIndex].topics.filter(t => t.id !== itemToDelete.value.id);
            toast.add({ severity: 'success', summary: 'Deleted', detail: 'Content outline removed.', life: 3000 });
        }
    }

    deleteDialog.value = false;
    itemToDelete.value = null;
    activeParentCourse.value = null;
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
                <div>
                    <span class="text-[#2c4c52] text-sm block">Are you sure you want to delete this {{ deleteType }}?</span>
                    <span class="text-xs text-[#4a7a82]" v-if="deleteType === 'course'">This will delete all nested topics.</span>
                </div>
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
