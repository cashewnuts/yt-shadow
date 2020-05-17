import React, { PropsWithChildren, useState, useEffect } from "react";
import { parseStringPromise } from "xml2js";
import SRT from "../../models/srt";

export interface SubtitleLoaderProps {
  onLoaded: (response: SRT) => any;
  onError?: (err: Error) => any;
  render: (loading: boolean) => any;
}

const getTimedTextUrl = (lang: string = "en", v: string) => {
  return `http://video.google.com/timedtext?lang=${lang}&v=${v}`;
};

const SubtitleLoader = (props: PropsWithChildren<SubtitleLoaderProps>) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const asyncFn = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const v = urlParams.get("v");
        if (!v) {
          throw new Error("Query string(v) does not exists");
        }
        const url = getTimedTextUrl("en", v);
        console.log(url);
        const response = await fetch(url);
        const text = await response.text();
        const xml = await parseStringPromise(text);
        console.log(xml);
        setLoading(false);
        const srt = new SRT(xml);
        props.onLoaded(srt);
      } catch (err) {
        if (props.onError) {
          props.onError(err);
        }
      }
    };
    asyncFn();
  }, []);

  return <>{props.render(loading)}</>;
};

export default SubtitleLoader;
