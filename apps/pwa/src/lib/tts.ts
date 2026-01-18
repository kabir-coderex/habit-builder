/**
 * A simple Text-to-Speech (TTS) helper using the Web Speech API.
 */

/**
 * Speaks the given text using the browser's speech synthesis.
 *
 * @param text The text to be spoken.
 * @param lang The BCP 47 language code for the voice (e.g., 'en-US', 'en-GB').
 * @returns A promise that resolves when the speech has finished, or rejects on error.
 */
export const speak = (text: string, lang: string = 'en-US'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return reject(new Error('Speech synthesis not supported in this browser.'));
    }

    // Cancel any currently speaking utterances to prevent overlap
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Optional: Find a specific voice if available
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * A utility to get the synthesis voices, which can sometimes be loaded asynchronously.
 * @returns A promise that resolves with an array of available voices.
 */
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};
