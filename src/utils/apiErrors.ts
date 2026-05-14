import axios from 'axios';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Please check your connection and try again.';

interface ApiErrorBody {
  message?: unknown;
}

export function getApiErrorMessage(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return NETWORK_ERROR_MESSAGE;
    }

    const data = error.response.data as ApiErrorBody | string | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
