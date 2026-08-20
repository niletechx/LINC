import { api, extractErrorMessage, getApiBaseUrl } from './api';

export const aiService = {
  /**
   * Send a chat message to Gemini RAG engine
   */
  async chat(message, conversationId = null) {
    try {
      const response = await api.post('/ai/chat', {
        message,
        conversationId,
      });
      return response.data.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  },

  /**
   * Stream response from Gemini RAG via Server-Sent Events (SSE)
   */
  async streamChat({ message, conversationId, onToken, onDone, onError }) {
    const baseUrl = getApiBaseUrl();
    const token = localStorage.getItem('linc_auth_token');

    try {
      const response = await fetch(`${baseUrl}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, conversationId }),
      });

      if (!response.ok) {
        throw new Error(`Streaming failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (onDone) onDone();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              if (onDone) onDone();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token && onToken) {
                onToken(parsed.token);
              }
            } catch {
              if (dataStr && onToken) {
                onToken(dataStr);
              }
            }
          }
        }
      }
    } catch (err) {
      if (onError) onError(err);
      throw err;
    }
  },
};
