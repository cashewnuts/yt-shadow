import React, { PropsWithChildren, CSSProperties, useState } from "react";
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
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>();
  const handleSubtitleLoaded = (srt: SRT) => {
    // TODO
    console.log(srt);
    // srt.texts.map((t) => console.log(t.done));
  };
  const handleError = (err: Error) => {
    console.error(err);
  };
  return (
    <div style={styles.wrapper}>
      <YoutubeVideo
        onLoaded={({ video }) => setVideoElement(video)}
        onPause={() => console.log("onPause")}
        onTimeUpdate={() => console.log("onTimeUpdate")}
      />
      <SubtitleLoader
        onLoaded={handleSubtitleLoaded}
        onError={handleError}
        render={(subtitleLoading) => (
          <>
            {subtitleLoading && (
              <div style={styles.spinner}>
                <Spinner />
              </div>
            )}
            {!subtitleLoading && <h1>hello</h1>}
          </>
        )}
      />
    </div>
  );
};

export default App;
