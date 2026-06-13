
const ITEMS_PER_PAGE = 12;

type NasaAssetResponse = {
    collection?: {
        items?: NasaAssetItem[];
    };
};

type NasaAssetItem = {
    href?: string;
};

function isImageAssetUrl(url?: string) {
    return Boolean(url && /\.(?:jpe?g|png|webp|tif|tiff)(?:$|\?)/i.test(url));
}

function pickBestOriginalAssetUrl(items: NasaAssetItem[] = []) {
    const imageUrls = items
        .map((item) => item.href)
        .filter(isImageAssetUrl) as string[];

    return (
        imageUrls.find((url) => /~orig\./i.test(url)) ??
        imageUrls.find((url) => /~large\./i.test(url)) ??
        imageUrls.find((url) => /~medium\./i.test(url)) ??
        imageUrls[0]
    );
}

async function fetchOriginalImageAssetUrl(nasaId?: string, fallbackUrl?: string) {
    if (!nasaId) return fallbackUrl;

    try {
        const response = await fetch(
            `https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`,
            {
                next: {
                    revalidate: 43200,
                },
            },
        );

        if (!response.ok) return fallbackUrl;

        const data = (await response.json()) as NasaAssetResponse;
        return pickBestOriginalAssetUrl(data.collection?.items) ?? fallbackUrl;
    } catch (error) {
        console.error("NASA asset metadata fetch failed:", error);
        return fallbackUrl;
    }
}

export async function fetchFilteredImages(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const searchParams = new URLSearchParams({
        media_type: "image",
        q: query,
    });

    try {
        const response =  await fetch(
            `https://images-api.nasa.gov/search?${searchParams.toString()}`,
            {
                next: {
                    revalidate: 43200,
                },
            },
        );
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }

        const previews = await response.json();
        
        const gallery = previews.collection.items;

        const totalPages = Math.ceil(Number(gallery.length) / ITEMS_PER_PAGE);
        const pageItems = gallery.slice(offset, offset + ITEMS_PER_PAGE) || [];
        const galleryWithOriginalUrls = await Promise.all(
            pageItems.map(async (item: any) => {
                const previewUrl = item?.links?.find((link: any) => link?.render === "image")?.href ?? item?.links?.[0]?.href;
                const nasaId = item?.data?.[0]?.nasa_id;

                return {
                    ...item,
                    originalAssetUrl: await fetchOriginalImageAssetUrl(nasaId, previewUrl),
                };
            }),
        );

        const result = {
            gallery: galleryWithOriginalUrls,
            totalPages: totalPages  || 0 ,
        };

        return result;
    } catch (error) {
        console.error("Response Error:", error);
    }
}
