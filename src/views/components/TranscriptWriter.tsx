import React, { PropsWithChildren } from "react";
import { SRTText } from "../../models/srt";

export interface TranscriptWriterProps {
  text: SRTText;
}

const TranscriptWriter = (props: PropsWithChildren<TranscriptWriterProps>) => {
  const { text } = props;
  return <div>{text && <p>{text.text}</p>}</div>;
};

export default TranscriptWriter;
