import { useState, useEffect } from "react";

export function useValidImageUrl(primaryUrl?: string, secondaryUrl?: string): string {
    const [validUrl, setValidUrl] = useState('');

    useEffect(() => {
        const tryLoadImage = (url: string, onSuccess: () => void, onError: () => void) => {
            const img = new Image();
            img.src = url;

            img.onload = () => {
                onSuccess();
            };

            img.onerror = () => {
                onError();
            };
        };

        if (!primaryUrl && !secondaryUrl) {
            return;
        }

        tryLoadImage(
            primaryUrl!,
            () => setValidUrl(primaryUrl!),
            () => {

                if (secondaryUrl) {
                    tryLoadImage(
                        secondaryUrl,
                        () => setValidUrl(secondaryUrl),
                        () => setValidUrl("")
                    );
                } else {
                    setValidUrl("");
                }
            }
        );
    }, [primaryUrl, secondaryUrl]);

    return validUrl as string;
}