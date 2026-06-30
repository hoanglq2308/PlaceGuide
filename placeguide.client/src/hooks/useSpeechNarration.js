import { useCallback, useEffect, useRef, useState } from 'react';
import { getSpeechLocale } from '../i18n/languageConfig';

export function useSpeechNarration({ language, onStatus } = {}) {
    const utteranceRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const stopNarration = useCallback(() => {
        window.speechSynthesis?.cancel();
        utteranceRef.current = null;
        setIsSpeaking(false);
    }, []);

    const speakNarration = useCallback(
        (text, options = {}) => {
            const {
                missingMessage = 'Chưa có nội dung thuyết minh.',
                unsupportedMessage = 'Trình duyệt không hỗ trợ đọc thuyết minh.',
                rate = 0.95,
            } = options;

            if (!window.speechSynthesis) {
                onStatus?.({
                    message: unsupportedMessage,
                    type: 'warning',
                });
                return false;
            }

            if (!text?.trim()) {
                onStatus?.({
                    message: missingMessage,
                    type: 'warning',
                });
                return false;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text.trim());
            utterance.lang = getSpeechLocale(language);
            utterance.rate = rate;
            utteranceRef.current = utterance;

            const clearCurrentUtterance = () => {
                window.setTimeout(() => {
                    if (utteranceRef.current !== utterance) {
                        return;
                    }

                    if (
                        window.speechSynthesis.speaking ||
                        window.speechSynthesis.pending
                    ) {
                        return;
                    }

                    utteranceRef.current = null;
                    setIsSpeaking(false);
                }, 250);
            };

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = clearCurrentUtterance;
            utterance.onerror = clearCurrentUtterance;

            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
            return true;
        },
        [language, onStatus]
    );

    useEffect(() => stopNarration, [stopNarration]);

    return {
        isSpeaking,
        speakNarration,
        stopNarration,
    };
}
