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
            <source
                src={`https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fvideos%2FISS071-E-226528-227449-20240625-Night.mp4?alt=media&token=b1936d11-9e58-471b-b4a7-df92c16653f9`}
                type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    )
}


