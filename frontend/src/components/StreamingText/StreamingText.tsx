import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import supersub from 'remark-supersub';
import { StreamingTextStyles } from './StreamingTextStyles';

export interface IStreamingTextProps {
    markdownFormatText: string;
}

export const StreamingText: React.FunctionComponent<IStreamingTextProps> = (props: React.PropsWithChildren<IStreamingTextProps>) => {
    const styles = StreamingTextStyles();
    const speed = 50;
    const [displayedText, setDisplayedText] = useState('');
    const currentIndexRef = useRef(0);
    const textRef = useRef(props.markdownFormatText);
  
    useEffect(() => {
      textRef.current = props.markdownFormatText;
    }, [props.markdownFormatText]);
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        if (currentIndexRef.current < textRef.current.length) {
          setDisplayedText((prev) => prev + textRef.current[currentIndexRef.current]);
          currentIndexRef.current++;
        }
      }, speed);
  
      return () => clearInterval(intervalId);
    }, [speed]);
    return (
        <>
            <ReactMarkdown
                linkTarget="_blank"
                remarkPlugins={[remarkGfm, supersub]}
                children={displayedText}
                className={styles.answerText}
            />
        </>
    );
};