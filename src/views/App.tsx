import React, {
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
  useRef,
} from "react";
import SubtitleLoader from "./components/SubtitleLoader";
import Spinner from "./components/Spinner";
import YoutubeVideo from "./components/YoutubeVideo";
import SRT from "../models/srt";
import VideoPlayer from "./components/VideoPlayer";

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
  const srtRef = useRef<SRT>();
  const videoRef = useRef<HTMLVideoElement>();
  const [isAds, setIsAds] = useState(false);
  const [scriptRange, setScriptRange] = useState<{
    start: number;
    end: number;
  }>();

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
    console.log("onSRTLoaded", srt, videoRef);
    srtRef.current = srt;
    if (videoRef.current) {
      setIsAds(
        videoRef.current.duration < srt.texts[srt.texts.length - 1].start
      );
    }
  };
  const handleError = (err: Error) => {
    console.error(err);
  };
  const handleLoadStart = () => {
    console.log("onLoadStart", srtRef.current, videoRef);
    updateVideoId();
  };
  const handleTimeUpdate = () => {
    console.log("onTimeUpdate", videoRef, srtRef);
    if (!videoRef.current || !srtRef.current) return;
    const { currentTime } = videoRef.current;
    const { texts } = srtRef.current;
    const matchedText = texts.find(
      (t) => t.start <= currentTime && currentTime <= t.start + t.dur
    );
    console.log("matchedText", matchedText);
    if (matchedText) {
      setScriptRange({
        start: matchedText.start,
        end: matchedText.start + matchedText.dur,
      });
    }
  };
  return (
    <div style={styles.wrapper}>
      <YoutubeVideo
        onLoaded={({ video }) => (videoRef.current = video)}
        onPause={() => console.log("onPause")}
        onTimeUpdate={handleTimeUpdate}
        onLoadStart={handleLoadStart}
        render={(video) => (
          <VideoPlayer
            video={video}
            start={scriptRange?.start}
            end={scriptRange?.end}
          />
        )}
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
