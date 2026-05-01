interface BackgroundVideoProps {
    src?: string;
    poster?: string;
    className?: string;
    loop?: boolean;
    autoPlay?: boolean;
}

const DEFAULT_VIDEO =
    "/media/stack_videos/ISS071-E-226528-227449-20240625-Night.optimized.mp4";
const DEFAULT_POSTER =
    "/media/stack_videos/ISS071-E-226528-227449-20240625-Night.poster.jpg";

export default function BackgroundVideo({
    src,
    poster,
    className = "",
    loop = true,
    autoPlay = true,
}: BackgroundVideoProps) {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
        >
            <video
                className={
                    "absolute inset-0 h-full w-full object-cover " +
                    className
                }
                autoPlay={autoPlay}
                loop={loop}
                muted
                playsInline
                poster={poster || DEFAULT_POSTER}
                preload="metadata"
            >
                <source
                    src={src || DEFAULT_VIDEO}
                    type="video/mp4"
                />
                Your browser does not support the video tag.
            </video>
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] max-h-[45vh]"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 55%, #000 100%)",
                }}
            />
        </div>
    );
}
