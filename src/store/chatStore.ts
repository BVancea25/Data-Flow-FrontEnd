import { defineStore } from 'pinia';
import { initChat } from '@/api/chat';
import { IChat, IUser } from '@/api/type';

export type AiChatRole = 'user' | 'ai';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

const defaultAiMessage: AiChatMessage = {
  role: 'ai',
  content: 'Hello! I have access to your budget and transaction history. What would you like to know?'
};

export const useChatStore = defineStore('chat', {
  // ℹ️ arrow function recommended for full type inference
  state: () => ({
    chats: [] as IChat[],
    chatContacts: [] as IUser[],
    profile: null,
    aiMessages: [defaultAiMessage] as AiChatMessage[]
  }),
  actions: {
    setChats(chats) {
      this.chats = chats;
    },
    setChatContacts(contacts) {
      this.chatContacts = contacts;
    },
    setProfile(profile) {
      this.profile = profile;
    },
    addAiMessage(message: AiChatMessage) {
      this.aiMessages.push(message);
      return this.aiMessages.length - 1;
    },
    updateAiMessage(index: number, content: string) {
      if (this.aiMessages[index]) {
        this.aiMessages[index].content = content;
      }
    },
    resetAiMessages() {
      this.aiMessages = [defaultAiMessage];
    },
    async initChat() {
      try {
        const response = await initChat();
        const { data } = response;
        const { chats, contacts } = data;
        this.setChats(chats);
        this.setChatContacts(contacts);
        this.setProfile(this.profile);
        return Promise.resolve(response);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  },
  persist: {
    key: 'dataflow-ai-chat',
    storage: window.sessionStorage,
    paths: ['aiMessages']
  }
});
