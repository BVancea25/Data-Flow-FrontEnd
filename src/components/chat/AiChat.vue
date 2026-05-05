<script setup>
import { ref, nextTick, watch, onMounted } from 'vue';
import api from '@/api/axios';
import { marked } from 'marked';
import { useChatStore } from '@/store/chatStore';

const baseUrl = import.meta.env.VITE_AI_SERVICE_HOST;
const chatStore = useChatStore();

const userInput = ref('');
const isLoading = ref(false);
const isStreaming = ref(false);
const chatWindow = ref(null);

const renderMarkdown = (text) => marked.parse(text);

const scrollToBottom = async () => {
  await nextTick();
  if (chatWindow.value) {
    chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
  }
};

watch(() => chatStore.aiMessages, () => scrollToBottom(), { deep: true });
onMounted(scrollToBottom);

const handleSendMessage = async () => {
  if (!userInput.value.trim()) return;

  const prompt = userInput.value;
  chatStore.addAiMessage({ role: 'user', content: prompt });
  userInput.value = '';
  isLoading.value = true;

  const aiMsgIndex = chatStore.addAiMessage({ role: 'ai', content: '' });

  try {
    await api.post(
      baseUrl + '/api/v1/ai/chat/stream',
      { message: prompt, conversationId: chatStore.conversationId },
      {
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          isStreaming.value = true;
          const rawResponse = progressEvent.event.target.responseText;
          const cleanText = rawResponse
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.replace('data:', ''))
            .join('');
          chatStore.updateAiMessage(aiMsgIndex, cleanText);
        }
      }
    );
  } catch (err) {
    console.error('Chat Error:', err);
    chatStore.updateAiMessage(aiMsgIndex, "I'm having trouble connecting to your data right now.");
  } finally {
    isLoading.value = false;
    isStreaming.value = false;
  }
};
</script>

<template>
  <v-card class="chat-container" elevation="4">
    <!-- Header -->
    <v-card-title class="chat-header">
      <span class="chat-title">DataFlow AI Advisor</span>
      <span class="chat-subtitle">Real-time budget & transaction insights</span>
    </v-card-title>

    <v-divider />

    <!-- Messages -->
    <div ref="chatWindow" class="chat-messages">
      <div
        v-for="(msg, index) in chatStore.aiMessages"
        :key="index"
        :class="['message-row', msg.role === 'user' ? 'message-row--user' : 'message-row--ai']"
      >
        <div :class="['message-bubble', msg.role === 'user' ? 'message-bubble--user' : 'message-bubble--ai']">
          <div v-html="renderMarkdown(msg.content)" class="message-content" />
        </div>
      </div>

      <div v-if="isLoading && !isStreaming" class="message-row message-row--ai">
        <div class="message-bubble message-bubble--ai message-bubble--loading">Consulting your records...</div>
      </div>
    </div>

    <v-divider />

    <!-- Input -->
    <div class="chat-input-area">
      <v-text-field
        v-model="userInput"
        @keyup.enter="handleSendMessage"
        placeholder="How much have I spent on groceries this month?"
        variant="outlined"
        density="compact"
        hide-details
        :disabled="isLoading"
        class="chat-input"
      />
      <v-btn @click="handleSendMessage" :disabled="isLoading || !userInput.trim()" color="primary" elevation="0">
        Send
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #f8f8f8;
}

.chat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
}

.chat-subtitle {
  font-size: 0.8rem;
  color: #888;
  font-weight: 400;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f5f5f5;
}

.message-row {
  display: flex;
}

.message-row--user {
  justify-content: flex-end;
}

.message-row--ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.message-bubble--user {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.message-bubble--ai {
  background-color: white;
  color: #2f2b3d;
  border: 1px solid #e0e0e0;
}

.message-bubble--loading {
  color: #aaa;
  font-style: italic;
}

.message-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.message-content :deep(p) {
  margin-bottom: 0.5rem;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: white;
  align-items: center;
}

.chat-input {
  flex: 1;
}
</style>
