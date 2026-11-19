/**
 * Service to execute SSE streaming POST requests and parse real-time events.
 *
 * @param {string} url - API endpoint
 * @param {Object} body - Request body
 * @param {Object} handlers - Callbacks for stream events
 * @param {function} handlers.onChunk - Called when text chunk arrives
 * @param {function} handlers.onUserMessage - Called when user message is persisted
 * @param {function} handlers.onRegenerateStarted - Called when regeneration starts
 * @param {function} handlers.onDone - Called when stream completes
 * @param {function} handlers.onError - Called on stream/network error
 * @returns {AbortController} - Controller allowing abortion of the stream
 */
export function streamChatResponse(url, body, {
  onChunk,
  onUserMessage,
  onRegenerateStarted,
  onDone,
  onError,
}) {
  const abortController = new AbortController();

  (async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errorMsg = `Server error ${response.status}`;
        try {
          const json = await response.json();
          if (json.error) errorMsg = json.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newline
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ''; // Keep incomplete part in buffer

        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const eventData = JSON.parse(jsonStr);

                switch (eventData.type) {
                  case 'user_message':
                    onUserMessage?.(eventData.message);
                    break;
                  case 'regenerate_started':
                    onRegenerateStarted?.();
                    break;
                  case 'chunk':
                    onChunk?.(eventData.content);
                    break;
                  case 'done':
                    onDone?.({
                      message: eventData.message,
                      conversation: eventData.conversation,
                    });
                    break;
                  case 'error':
                    onError?.(eventData.error || 'Unknown error received from stream');
                    break;
                  default:
                    break;
                }
              } catch (parseErr) {
                console.warn('Failed to parse SSE JSON payload:', jsonStr, parseErr);
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Chat stream aborted by user.');
      } else {
        onError?.(err.message || 'Stream connection failed');
      }
    }
  })();

  return abortController;
}
