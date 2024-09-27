import { useState } from "react";
import { Send32Regular } from "@fluentui/react-icons";
import { Button, Caption1, Textarea, TextareaOnChangeData } from "@fluentui/react-components";
import { QuestionInputStyles } from "./QuestionInputStyles";
import { ComplianceMessage } from "../ComplianceMessage/ComplianceMessage";
import { Microphone } from "../Microphone/Microphone";
import React from "react";
import { AppStateContext } from "../../state/AppProvider";

interface Props {
    onSend: (question: string, id?: string) => Promise<void>;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
    conversationId?: string;
    speechEnabled: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId, speechEnabled }: Props) => {
    const appStateContext = React.useContext(AppStateContext);
    const Newstyles = QuestionInputStyles();
    const [question, setQuestion] = useState<string>("");
    const [microphoneActive, setMicrophoneActive] = useState<boolean>(false);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    const sendQuestion = async() => {
        appStateContext?.state.audioService?.stopAudioPlayback();
        if (disabled || !question.trim()) {
            return;
        }

        if (conversationId) {
            await onSend(question, conversationId);

        } else {
            await onSend(question);

        }

        if (clearOnSend) {
            setQuestion("");
        }
        focusInput();
    };

    const focusInput = async() => {
        // pause for a split second to allow the input to be focused. 
        await new Promise(r => setTimeout(r, 200));
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const sendQuestionFromMicrophone = (questionText: string) => {
        if (disabled || !questionText.trim()) {
            return;
        }
         const _questionText = question + " " + questionText.trim();
         setQuestion(_questionText);
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (ev: React.ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData): void => {
        setQuestion(data.value || "");
    };

    const sendQuestionDisabled = disabled || !question.trim();

    return (
        <div className={Newstyles.container}>
            <div className={Newstyles.form}>
                <Textarea
                    className={Newstyles.textInput}
                    placeholder={placeholder || "Send a message"}
                    rows={5}
                    value={question}
                    onChange={onQuestionChange}
                    onKeyDown={onEnterPress}
                    disabled={disabled || microphoneActive}
                    ref={inputRef}
                />
                <div className={speechEnabled ? Newstyles.twoButtonContainer : Newstyles.oneButtonContainer }>
                    {speechEnabled &&
                        <Microphone
                            onSpeech={sendQuestionFromMicrophone}
                            onRecordingStart={() => { setMicrophoneActive(true); }}
                            onRecordingEnd={() => { setMicrophoneActive(false); }}
                            disabled={disabled || microphoneActive}
                        />
                    }
                    <Button
                        appearance="transparent"
                        className={Newstyles.sendButton}
                        role="button"
                        tabIndex={0}
                        aria-label="Ask question button"
                        onClick={sendQuestion}
                        onKeyDown={e => e.key === "Enter" || e.key === " " ? sendQuestion() : null}
                        icon={<Send32Regular />}
                        disabled={sendQuestionDisabled || microphoneActive}
                    />
                </div>
            </div>
        </div>
    );
};
