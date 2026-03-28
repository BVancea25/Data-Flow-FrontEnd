<script setup lang="ts">
import Snackbar from './components/Snackbar.vue';
import { ref } from 'vue';
import AiChat from './components/chat/AiChat.vue';

const isChatOpen = ref(false);
</script>

<template>
  <v-app>
    <VLocaleProvider>
      <v-main>
        <RouterView />
      </v-main>
      <Snackbar />
    </VLocaleProvider>
  </v-app>

  <Teleport to="body">
    <div class="chat-launcher">
      <transition name="slide-up">
        <div v-if="isChatOpen" class="chat-window">
          <AiChat />
        </div>
      </transition>

      <button @click="isChatOpen = !isChatOpen" class="chat-toggle-btn">
        <span class="text-2xl">{{ isChatOpen ? '✖' : '💬' }}</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.chat-launcher {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-window {
  margin-bottom: 16px;
  width: 400px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.chat-toggle-btn {
  width: 56px;
  height: 56px;
  background-color: #1867c0; /* Vuetify primary blue */
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.chat-toggle-btn:hover {
  background-color: #1557a0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
