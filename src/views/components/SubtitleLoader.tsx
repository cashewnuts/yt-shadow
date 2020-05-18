import React, { PropsWithChildren, useState, useEffect } from "react";
import { parseStringPromise } from "xml2js";
import SRT from "../../models/srt";

export interface SubtitleLoaderProps {
  videoId?: string;
  onSRTLoaded: (response: SRT) => any;
  onError?: (err: Error) => any;
  render: (renderArg: { loading: boolean; subtitleNotExists: boolean }) => any;
}

const getTimedTextUrl = (lang: string = "en", v: string) => {
  return `http://video.google.com/timedtext?lang=${lang}&v=${v}`;
};

const SubtitleLoader = (props: PropsWithChildren<SubtitleLoaderProps>) => {
  const [loading, setLoading] = useState(true);
  const [subtitleNotExists, setSubtitleNotExists] = useState(false);
  const { videoId } = props;

  useEffect(() => {
    const asyncFn = async () => {
      if (!videoId) {
        return;
      }
      setSubtitleNotExists(false);
      setLoading(true);
      try {
        const url = getTimedTextUrl("en", videoId);
        console.log("transcript url", url);
        const response = await fetch(url);
        const text = await response.text();
        const xml = await parseStringPromise(text);
        setLoading(false);
        if (!xml) {
          setSubtitleNotExists(true);
          return;
        }
        console.log("xml", xml);
        const srt = new SRT(xml);
        props.onSRTLoaded(srt);
      } catch (err) {
        if (props.onError) {
          props.onError(err);
        }
      }
    };
    asyncFn();
  }, [videoId]);

  return <>{props.render({ loading, subtitleNotExists })}</>;
};

export default SubtitleLoader;
