import React, {
  PropsWithChildren,
  useEffect,
  CSSProperties,
  useState,
} from "react";

export interface VideoPlayerProps {
  video: HTMLVideoElement;
  start?: number;
  end?: number;
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    width: "100%",
    height: "2em",
  },
  sliderContainer: {
    position: "relative",
    width: "60%",
    height: "100%",
  },
  slider: {
    position: "absolute",
    top: 0,
    left: "30%",
    width: "5px",
    height: "100%",
    backgroundColor: "black",
    transform: "translate(-2.5px)",
  },
};

const VideoPlayer = (props: PropsWithChildren<VideoPlayerProps>) => {
  const { video, start, end } = props;
  const [timeParcent, setTimePercent] = useState(0);
  const updateTImeParcent = () => {
    const currentTime = video.currentTime;
    const startTime = start || 0;
    const endTime = end || video.duration;
    console.log(currentTime, start, startTime, end, endTime);
    const ratio = (currentTime - startTime) / endTime;
    console.log(ratio, ratio * 100);
    setTimePercent(ratio * 100);
  };
  useEffect(() => {
    video.addEventListener("timeupdate", () => {
      updateTImeParcent();
    });
    const test = {
      ...styles,
    };
  }, [video]);
  useEffect(() => {
    updateTImeParcent();
  }, [start, end]);
  return (
    <div style={styles.wrapper}>
      <div style={styles.sliderContainer}>
        <div style={{ ...styles.slider, ...{ left: `${timeParcent}%` } }}></div>
      </div>
    </div>
  );
};

export default VideoPlayer;
