import React, {
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
} from "react";
import SubtitleLoader from "./components/SubtitleLoader";
import Spinner from "./components/Spinner";
import YoutubeVideo from "./components/YoutubeVideo";
import SRT from "../models/srt";

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    position: "relative",
    width: "100%",
    minHeight: "6em",
    padding: "0.5em 1em",
  },
  spinner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const App = (props: PropsWithChildren<unknown>) => {
  const [videoId, setVideoId] = useState<string>();
  const [srt, setSRT] = useState<SRT>();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>();
  const [isAds, setIsAds] = useState(false);

  const updateVideoId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get("v");
    if (!v) return;
    setVideoId(v);
  };
  useEffect(() => {
    updateVideoId();
  }, []);
  const handleSubtitleLoaded = (srt: SRT) => {
    console.log("onSRTLoaded", srt, videoElement);
    setSRT(srt);
    if (videoElement) {
      setIsAds(videoElement.duration < srt.texts[srt.texts.length - 1].start);
    }
  };
  const handleError = (err: Error) => {
    console.error(err);
  };
  const handleLoadStart = () => {
    console.log("onLoadStart", srt, videoElement);
    updateVideoId();
  };
  const handleTimeUpdate = () => {
    // console.log("onTimeUpdate");
  };
  return (
    <div style={styles.wrapper}>
      <YoutubeVideo
        onLoaded={({ video }) => setVideoElement(video)}
        onPause={() => console.log("onPause")}
        onTimeUpdate={handleTimeUpdate}
        onLoadStart={handleLoadStart}
        render={(video) => <h1>video loaded {video.className}</h1>}
      />
      <SubtitleLoader
        videoId={videoId}
        onSRTLoaded={handleSubtitleLoaded}
        onError={handleError}
        render={({ loading, subtitleNotExists }) => (
          <>
            {(loading || isAds) && (
              <div style={styles.spinner}>
                <Spinner />
              </div>
            )}
            {subtitleNotExists && (
              <div>
                <h1>Subtitle Not Exists</h1>
              </div>
            )}
            {!loading && !subtitleNotExists && <h1>hello</h1>}
          </>
        )}
      />
    </div>
  );
};

export default App;
