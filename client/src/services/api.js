const API_BASE = '/api';

/**
 * Handle HTTP response parsing and error throwing
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const conversationApi = {
  /**
   * List all conversations
   */
  async list() {
    const res = await fetch(`${API_BASE}/conversations`);
    const json = await handleResponse(res);
    return json.data || [];
  },

  /**
   * Get single conversation with its messages
   */
  async get(id) {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    const json = await handleResponse(res);
    return json.data;
  },

  /**
   * Create a new conversation
   */
  async create({ title = 'New Chat', tone = 'Professional' } = {}) {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, tone }),
    });
    const json = await handleResponse(res);
    return json.data;
  },

  /**
   * Delete conversation and all its messages
   */
  async delete(id) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  /**
   * Update conversation title or tone
   */
  async update(id, updates) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await handleResponse(res);
    return json.data;
  },
};
