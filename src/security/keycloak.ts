import Keycloak from 'keycloak-js';
import { useUserStore } from '@/store';

let keycloak: Keycloak;

export function initKeycloak(): Promise<boolean> {
  keycloak = new Keycloak({
    url: 'https://localhost:8442', // Keycloak base URL
    realm: 'data-flow', // Your realm
    clientId: 'public-client' // The SPA client id
  });
  return keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false
  });
}

export function getKeycloak(): Keycloak {
  if (!keycloak) {
    throw new Error('Keycloack not initialized. Call initKeycloack()');
  }
  return keycloak;
}

export function startTokenRefresh(): void {
  const userStore = useUserStore();

  setInterval(() => {
    getKeycloak()
      .updateToken(70)
      .then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
          userStore.refreshFromKeycloak();
        }
      })
      .catch(() => {
        console.warn('Failed to refresh token');
        getKeycloak().logout();
      });
  });
}

export const logout = (): void => {
  if (keycloak) {
    keycloak.logout({ redirectUri: window.location.origin });
  }
};
