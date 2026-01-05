<script setup>
import { ref, nextTick } from 'vue';
import api from '../lib/axios';

const isOpen = ref(false);
const messages = ref([
    { role: 'ai', text: 'Hello! I am AI Chat Helper. What can I help you today?' }
]);
const userInput = ref('');
const chatContainer = ref(null);

const toggleChat = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) scrollToBottom();
};

const sendMessage = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message immediately
    messages.value.push({ role: 'user', text: text });
    userInput.value = ''; // Clear input
    scrollToBottom();

    // 2. Add temporary "Thinking..." message
    // We store the index so we can update this exact message later
    const loadingMessageIndex = messages.value.push({ 
        role: 'ai', 
        text: 'Thinking...', 
        isLoading: true 
    }) - 1;
    scrollToBottom();

    try {
        // 3. Make API Call to Laravel Backend
        // Ensure your Laravel route is defined as Route::post('/chat/send', ...)
        const response = await api.post('api/chat/send', {
            message: text
        });

        // 4. Update the placeholder message with real response
        if (response.data && response.data.success) {
            messages.value[loadingMessageIndex] = { 
                role: 'ai', 
                text: response.data.reply 
            };
        } else {
            messages.value[loadingMessageIndex] = { 
                role: 'ai', 
                text: "I'm having trouble connecting to the server. Please try again." 
            };
        }

    } catch (error) {
        console.error("Chat Error:", error);
        messages.value[loadingMessageIndex] = { 
            role: 'ai', 
            text: "Sorry, I am currently unavailable. Please try again later." 
        };
    }

    // 5. Scroll to bottom after the response updates
    await nextTick();
    scrollToBottom();
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};
</script>

<template>
    <div class="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end gap-4">

        <transition name="slide-fade">
            <div v-if="isOpen" 
                 class="w-[350px] h-[500px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_20px_60px_-15px_rgba(44,76,82,0.3)] overflow-hidden">
                
                <div class="p-4 bg-[#2c4c52] flex justify-between items-center text-white">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#7bc5cd] flex items-center justify-center text-[#2c4c52] shadow-sm">
                            <i class="pi pi-sparkles text-lg font-bold"></i>
                        </div>
                        
                        <div class="flex flex-col justify-center">
                            
                            <div class="flex items-center gap-1.5 opacity-80 -mt-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                <span class="text-[10px] font-mono uppercase font-bold tracking-wider">Online</span>
                            </div>
                            <div class="text-[20px] font-bold text-sm leading-tight">AI Chat Helper</div>
                        </div>
                    </div>
                    
                    <Button icon="pi pi-times" text rounded class="!text-white/60 hover:!text-[#2c4c52] !w-8 !h-8" @click="toggleChat" />
                </div>

                <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/50">
                    <div v-for="(msg, i) in messages" :key="i" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                        
                        <div class="max-w-[80%] p-3 text-sm shadow-sm"
                             :class="msg.role === 'user' 
                                ? 'bg-[#2c4c52] text-white rounded-2xl rounded-tr-none' 
                                : 'bg-white border border-white/50 text-[#2c4c52] rounded-2xl rounded-tl-none'">
                            {{ msg.text }}
                        </div>

                    </div>
                </div>

                <div class="p-3 bg-white/80 border-t border-[#2c4c52]/10 backdrop-blur-md">
                    <div class="relative">
                        <input v-model="userInput" 
                               type="text" 
                               placeholder="Ask about roadmaps..." 
                               class="w-full pl-4 pr-12 py-3 rounded-xl bg-[#2c4c52]/5 border border-[#2c4c52]/10 focus:outline-none focus:border-[#7bc5cd] focus:bg-white transition-colors text-sm text-[#2c4c52] font-medium placeholder:text-[#2c4c52]/40"
                               @keydown.enter="sendMessage" />
                        
                        <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#2c4c52] hover:bg-[#7bc5cd] hover:text-white transition-colors"
                                @click="sendMessage">
                            <i class="pi pi-send text-xs"></i>
                        </button>
                    </div>
                    <div class="text-[9px] text-center text-[#2c4c52]/40 mt-2 font-mono uppercase">
                        Model named: "DevNexus-AI-Helper v1.0"
                    </div>
                </div>
            </div>
        </transition>

        <button 
            @click="toggleChat"
            class="group relative w-14 h-14 rounded-full bg-[#2c4c52] shadow-[0_10px_30px_-10px_rgba(44,76,82,0.5)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 z-50 overflow-hidden border border-[#7bc5cd]/30">
            
            <div class="absolute inset-0 bg-[#7bc5cd] opacity-0 group-hover:opacity-20 blur-lg transition-opacity"></div>
            
            <i class="pi text-xl transition-all duration-300 absolute"
               :class="isOpen ? 'pi-chevron-down rotate-0 opacity-100' : 'pi-chevron-down rotate-180 opacity-0'"></i>
            
            <i class="pi pi-sparkles text-xl transition-all duration-300 absolute"
               :class="isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'"></i>

            
        </button>

    </div>
</template>

<style scoped>
/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #2c4c5230;
    border-radius: 10px;
}
</style>