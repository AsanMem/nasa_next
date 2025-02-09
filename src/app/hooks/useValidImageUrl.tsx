import { useState, useEffect } from "react";

function useValidImageUrl(url?: string, fallbackUrl?: string): string {
    const [validUrl, setValidUrl] = useState(fallbackUrl);

    useEffect(() => {
        if (!url) {
            setValidUrl(fallbackUrl);
            return;
        }

        const img = new Image();
        img.src = url;

        img.onload = () => {
            setValidUrl(url);
        };

        img.onerror = () => {
            setValidUrl(fallbackUrl);
        };
    }, [url, fallbackUrl]);

    return validUrl as string;
}

export default useValidImageUrl;