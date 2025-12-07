interface BackgroundVideoProps {
    src?: string;
    className?: string;
    loop?: boolean;
    autoPlay?: boolean;
}

const DEFAULT_VIDEO =
    "https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fvideos%2FISS071-E-226528-227449-20240625-Night.mp4?alt=media&token=b1936d11-9e58-471b-b4a7-df92c16653f9";

export default function BackgroundVideo({
    src,
    className = "",
    loop = true,
    autoPlay = true,
}: BackgroundVideoProps) {
    return (
        <video
            className={
                "fixed w-full left-1/2 top-1/2 h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0 " +
                className
            }
            autoPlay={autoPlay}
            loop={loop}
            muted
            playsInline
            style={{ zIndex: -1 }}
            rel="preload"
        >
            <source
                src={src || DEFAULT_VIDEO}
                type="video/mp4"
            />
            Your browser does not support the video tag.
        </video>
    );
}
