export async function loadBackgroundImage(backgroundImage) {
    if (!backgroundImage)
        return null;
    if (typeof backgroundImage === 'string') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                console.warn('Failed to load background image:', backgroundImage);
                reject();
            };
            img.crossOrigin = 'anonymous'; // Enable CORS for external images
            img.src = backgroundImage;
        });
    }
    if (backgroundImage instanceof HTMLImageElement) {
        return backgroundImage;
    }
    return null;
}
