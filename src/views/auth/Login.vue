<script setup>
import { ref } from 'vue';
import api from '@/lib/axios'; // Import your configured instance
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const form = ref({
    email: '',
    password: ''
});

const handleLogin = async () => {
    try {
        await auth.login(form.value.email, form.value.password);
        // If successful, redirect to dashboard
        router.push({ name: 'api/dashboard' });
    } catch (error) {
        alert("Login failed!");
    }
};
</script>

<template>
    <form @submit.prevent="handleLogin">
        <input v-model="form.email" type="email" placeholder="Email" />
        
        <input v-model="form.password" type="password" placeholder="Password" />
        
        <button type="submit">Login</button>
    </form>
</template>