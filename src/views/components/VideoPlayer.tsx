import React, {
  PropsWithChildren,
  useEffect,
  CSSProperties,
  useState,
  useRef,
  ChangeEvent,
} from "react";

export interface VideoPlayerProps {
  video: HTMLVideoElement;
  start?: number;
  end?: number;
  onRangeOver?: (time: number) => any;
  onNext?: () => any;
  onPrevious?: () => any;
}

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    width: "100%",
    height: "2em",
    display: "flex",
  },
  sliderContainer: {
    position: "relative",
    width: "60%",
    height: "100%",
    background: "#fbfbfb",
    borderRadius: 2,
  },
  slider: {
    width: "100%",
    height: "100%",
    backgroundColor: "#afafaf",
    boxShadow: "rgba(0, 0, 0, 0.75) 1px 1px 1px 0px",
    transform: "translate(-2.5px)",
    cursor: "pointer",
  },
};

const VideoPlayer = (props: PropsWithChildren<VideoPlayerProps>) => {
  const { video, start, end, onRangeOver } = props;
  const [currentTime, setCurrentTime] = useState(0);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(video.duration);
  const [isPlaying, setIsPlaying] = useState(!video.paused);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const updateCurrentTime = () => {
    const currentTime = video.currentTime;
    setCurrentTime(currentTime);
  };
  useEffect(() => {
    video.addEventListener("timeupdate", () => {
      console.log(max, video.duration, video.currentTime);
      if ((end || video.duration) < video.currentTime) {
        if (onRangeOver) {
          onRangeOver(video.currentTime);
        }
      }
      updateCurrentTime();
    });
    video.addEventListener("playing", () => {
      setIsPlaying(true);
    });
    video.addEventListener("pause", () => {
      setIsPlaying(false);
    });
  }, [video]);
  useEffect(() => {
    console.log("start end", start, end, min, max);
    updateCurrentTime();
    if (start) {
      setMin(start);
    }
    if (end) {
      setMax(end);
    }
    const onRangeOverChecker = () => {
      console.log(max, video.duration, video.currentTime);
      if ((end || video.duration) < video.currentTime) {
        if (onRangeOver) {
          onRangeOver(video.currentTime);
        }
      }
    };
    video.addEventListener("timeupdate", onRangeOverChecker);
    return () => {
      video.removeEventListener("timeupdate", onRangeOverChecker);
    };
  }, [start, end]);

  const playHandler = () => {
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };
  const rangeChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const newCurrent = +event.target.value;
    setCurrentTime(newCurrent);
    video.currentTime = newCurrent;
  };
  return (
    <div style={styles.wrapper}>
      <button onClick={playHandler}>{isPlaying ? "stop" : "play"}</button>
      <button onClick={props.onPrevious}>previous</button>
      <div style={styles.sliderContainer} ref={sliderContainerRef}>
        <input
          type="range"
          min={min}
          max={max}
          value={currentTime}
          step="0.001"
          onChange={rangeChangeHandler}
          style={styles.slider}
        ></input>
      </div>
      <button onClick={props.onNext}>next</button>
    </div>
  );
};

export default VideoPlayer;
