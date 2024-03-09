import { Mic24Filled, MicOff24Regular, MicSparkle24Regular } from '@fluentui/react-icons';
import * as React from 'react';
import { AudioConfig, AutoDetectSourceLanguageConfig, ResultReason, SpeechConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import { SpeechAuth, getSpeechAuthToken } from '../../api';
import styles from "./Microphone.module.css";
import { Button, DefaultButton, Icon, IconButton } from '@fluentui/react';
import { AppStateContext } from "../../state/AppProvider";

export interface IMicrophoneProps {
    onSpeech: (text: string) => void;
    onRecordingStart: () => void;
    onRecordingEnd: () => void;
    disabled: boolean;
}


let speechToken: SpeechAuth | undefined = undefined;

export const Microphone: React.FunctionComponent<IMicrophoneProps> = (props: React.PropsWithChildren<IMicrophoneProps>) => {
    const appStateContext = React.useContext(AppStateContext);
    const [microphoneActive, setmicrophoneActive] = React.useState<boolean>(false);
    const [microphoneDisabled, setmicrophoneDisabled] = React.useState<boolean>(props.disabled);

    React.useEffect(() => {
        setmicrophoneDisabled(props.disabled);
    }, [props.disabled]);

    const getTextFromSpeech = async (): Promise<void> => {
        setmicrophoneActive(true);
        setmicrophoneDisabled(true);
        props.onRecordingStart();

        if (appStateContext?.state.audioService?.recognizer) {
            try {
                appStateContext?.state.audioService.refreshSpeechToken();
                appStateContext?.state.audioService.recognizer.recognizeOnceAsync(result => {
                    if (result.reason === ResultReason.RecognizedSpeech) {
                        props.onSpeech(result.text);
                        props.onRecordingEnd();
                        setmicrophoneActive(false);
                        setmicrophoneDisabled(false);
                    } else {
                        console.error('Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
                        props.onRecordingEnd();
                        setmicrophoneActive(false);
                        setmicrophoneDisabled(false);
                    }
                }
                );
            } catch (error) {
                console.error('Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
                props.onRecordingEnd();
                setmicrophoneActive(false);
                setmicrophoneDisabled(false);
            }
        }
    };

    const onMicrophoneClick = async () => {
        if(microphoneDisabled){
            return;
        }
        getTextFromSpeech();
    };

    return (
        <>
            {microphoneActive ?
                <MicOff24Regular 
                    role="button"
                    title = "Start recording"
                    className={styles.micIconRecording}
                    width={100} 
                    onClick={onMicrophoneClick}
                   />
                : <MicSparkle24Regular
                    role="button"
                    className={styles.microphone}
                    width={100} 
                    onClick={onMicrophoneClick}
                    />
            }
        </>
    );
};