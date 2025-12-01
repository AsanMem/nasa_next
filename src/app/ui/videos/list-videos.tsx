import Pagination from '../shared/pagination';
import CardVideo from './card-video';

type VideoItem = {
  data: Array<{
    title?: string;
    description?: string;
    keywords?: string[];
  }>;
  links?: Array<{
    href?: string;
  }>;
  videoUrl?: string | null;
};

interface ListVideosProps {
  videos: VideoItem[];
  totalPages: number;
  query: string;
}

export default function ListVideos({ videos, totalPages, query }: ListVideosProps) {
  if (!query.trim()) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/60 ring-1 ring-white/10">
        Enter a query above to explore NASA video highlights, or jump into another section.
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 text-center text-white/60 ring-1 ring-white/10">
        No NASA videos match this search yet. Try refining your keywords.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video, i) => {
          const data = video?.data?.[0];
          const preview = video?.links?.[0]?.href;
          return (
            <CardVideo
              key={(data?.title ?? "nasa-video") + i}
              videoPreview={preview ?? ""}
              videoPlay={video?.videoUrl ?? ""}
              title={data?.title ?? "NASA video"}
              description={data?.description ?? ""}
              keywords={data?.keywords}
            />
          );
        })}
      </div>
      {totalPages > 1 ? (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      ) : null}
    </div>
  );
}
