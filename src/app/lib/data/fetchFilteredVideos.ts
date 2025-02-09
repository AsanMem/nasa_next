
const ITEMS_PER_PAGE = 12;
export async function fetchFilteredVideos(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const response = await fetch(
            `https://images-api.nasa.gov/search?q=${query}&media_type=video`
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const previews = await response.json();
        const galleryVideos = previews?.collection?.items || [];
      
        const videosWithLinks = await Promise.all(
            galleryVideos.map(async (video :any) => {
                const nasa_id = video?.data?.[0]?.nasa_id;
                if (!nasa_id) return null;
                const assetResponse = await fetch(
                    `https://images-api.nasa.gov/asset/${nasa_id}`
                );
                if (!assetResponse.ok) return null;

                const assetData = await assetResponse.json();
                const videoLinks = assetData?.collection?.items || [];
                const videoFile = videoLinks.find((link:any) =>
                    link.href.endsWith(".mp4")
                );
                return {
                    ...video,
                    videoUrl: videoFile?.href || null,
                };
            })
        );

        const filteredVideos = videosWithLinks.filter((v) => v !== null);
        const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
        const result = {
            videos: filteredVideos.slice(offset, offset + ITEMS_PER_PAGE),
            totalPages: totalPages || 0,
        };

        return result;
    } catch (error) {
        console.error("Response Error:", error);
        return { videos: [], totalPages: 0 };
    }
}

