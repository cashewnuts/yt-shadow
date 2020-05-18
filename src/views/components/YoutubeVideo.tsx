import React, {
  PropsWithChildren,
  useEffect,
  DOMAttributes,
  useState,
} from "react";
import { getElementAsync } from "../../helpers/dependency-helper";

export interface YoutubeVideoProps {
  onLoaded?: (args: { video: HTMLVideoElement }) => void;
  render: (video: HTMLVideoElement) => any;
}

const YoutubeVideo = (
  props: PropsWithChildren<DOMAttributes<HTMLVideoElement> & YoutubeVideoProps>
) => {
  const [video, setVideo] = useState<HTMLVideoElement>();
  useEffect(() => {
    const asyncFn = async () => {
      const ytVideo: HTMLVideoElement = await getElementAsync({
        query: "video[src*='blob:https://www.youtube.com']",
      });
      console.log("video tag", ytVideo, props);
      if (props.onLoaded) {
        props.onLoaded({ video: ytVideo });
      }
      setVideo(ytVideo);
      Object.keys(props).forEach((p) => {
        if (p.startsWith("on")) {
          ytVideo.addEventListener(
            p.substr(2).toLowerCase(),
            (props as any)[p]
          );
        }
      });
    };
    asyncFn();
  });
  return <>{props.render && video && props.render(video)}</>;
};

export default YoutubeVideo;
