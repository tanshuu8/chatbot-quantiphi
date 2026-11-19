import { useState, useCallback } from 'react';

/**
 * Custom hook to copy text to the clipboard with feedback state.
 *
 * @param {number} duration - Milliseconds to keep copied state true (default 2000ms)
 * @returns {{ copied: boolean, copyToClipboard: (text: string) => Promise<boolean> }}
 */
export function useClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text) => {
      if (!text) return false;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for non-secure or older contexts
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), duration);
        return true;
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        setCopied(false);
        return false;
      }
    },
    [duration]
  );

  return { copied, copyToClipboard };
}
