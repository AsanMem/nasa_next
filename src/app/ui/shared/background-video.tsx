export default function BackgroundVideo() {


    return (
        <video
            className="fixed w-full left-1/2 top-1/2 h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0"
            autoPlay
            loop
            muted
            playsInline

            style={{ "zIndex": -1 }}
        >
            <source src="/media/videos/ISS071-E-167095-168712-20240602-Night.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    )
}





