<script setup>
import { ref } from 'vue'
import api from '@/lib/axios' // Use the instance with credentials!

// Reactive state
const prediction = ref(null)
const loading = ref(false)
const error = ref(null)
const inputData = ref('Hello AI') // Bind this to an input field

const getConnection = async () => {
  loading.value = true
  error.value = null
  prediction.value = null

  try {
    // Use 'api' instead of 'axios' to ensure cookies are sent
    const response = await api.post('/api/flask-conn', {
      data: inputData.value,
    })

    // Assuming Laravel returns { result: "..." } or similar
    prediction.value = response.data
    console.log('Response:', response.data)
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Failed to get prediction. Check console.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Dashboard</h1>

    <div class="prediction-box">
      <h3>Flask Connection Test</h3>

      <div class="input-group">
        <input
          v-model="inputData"
          type="text"
          placeholder="Enter text for AI..."
          :disabled="loading"
        />

        <button @click="getConnection" :disabled="loading">
          {{ loading ? 'Processing...' : 'Check Connection' }}
        </button>
      </div>

      <div v-if="prediction" class="result success">
        <strong>Result:</strong>
        <pre>{{ prediction }}</pre>
      </div>

      <div v-if="error" class="result error">
        {{ error }}
      </div>
    </div>
  </main>
</template>

<style scoped>
.prediction-box {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 500px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 8px;
}

button {
  padding: 8px 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.success {
  background-color: #ffffff;
  border: 1px solid #00ff37;
  color: #00ff37;
}

.error {
  background-color: #ffffff;
  border: 1px solid #ff0000;
  color: #ff0000;
}
</style>
