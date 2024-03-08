import { useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { Send32Regular, SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
import { Microphone } from "../Microphone/Microphone";

interface Props {
    onSend: (question: string, id?: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
    conversationId?: string;
    speechEnabled: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId, speechEnabled }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const [microphoneActive, setMicrophoneActive] = useState<boolean>(false);


    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        if(conversationId){
            onSend(question, conversationId);
        }else{
            onSend(question);
        }

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const sendQuestionFromMicrophone = (questionText: string) => {
        if (disabled || !questionText.trim()) {
            return;
        }
        
        if (microphoneActive) {
            return;
        }

         setQuestion(questionText);
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setQuestion(newValue || "");
    };

    const sendQuestionDisabled = disabled || !question.trim();
    console.log('send question disabled ', sendQuestionDisabled)

    return (
        <Stack horizontal className={styles.questionInputContainer}>
            <TextField
                className={styles.questionInputTextArea}
                placeholder={placeholder}
                multiline
                resizable={false}
                borderless
                value={question}
                onChange={onQuestionChange}
                onKeyDown={onEnterPress}
                disabled={disabled || microphoneActive}
            />
            <div className={speechEnabled ? styles.twoButtonContainer :  styles.questionInputSendButtonContainer} >
                <div>
                {speechEnabled &&
                    <Microphone
                        onSpeech={sendQuestionFromMicrophone}
                        onRecordingStart={() => { setMicrophoneActive(true); }}
                        onRecordingEnd={() => { setMicrophoneActive(false); }}
                        disabled={disabled || microphoneActive}
                    />
                }
                <Send32Regular
                    role="button" 
                    tabIndex={0}
                    aria-label="Ask question button"
                    onClick={sendQuestion}
                    onKeyDown={(e: any) => e.key === "Enter" || e.key === " " ? sendQuestion() : null}
                    
                />
                </div>
                { sendQuestionDisabled ? 
                    <img src={Send} className={styles.questionInputSendButtonDisabled}/>
                    :
                    <img src={Send} className={styles.questionInputSendButton}/>
                }
            </div>
            <div className={styles.questionInputBottomBorder} />
        </Stack>
    );
};
