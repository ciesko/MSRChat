import * as React from 'react';
import { SuggestionButtonStyles } from './SuggestionButtonStyles';
import { Button } from '@fluentui/react-components';

export interface ISuggestionButtonsProps {
    onButtonClick: (questionText: string) => void;
}

const questions = [
    `Detail MSR's latest contributions to small language models, including Phi-3.`,
    `What were the main objectives and outcomes of Project Green? How did the workshops and research efforts within this initiative interconnect?`,
    `What are some examples of MSR’s recent technical advances in Research for Industry?`,
]

export const SuggestionButtons: React.FunctionComponent<ISuggestionButtonsProps> = (props: React.PropsWithChildren<ISuggestionButtonsProps>) => {
    const styles = SuggestionButtonStyles();
    return (
        <div className={styles.container}>
            <span className={styles.prompt}><i>Get started with an example question below or create your own.</i></span>
            <div className={styles.questionsContainer}>
                {
                    questions.map((questionText, index) => {
                        return (
                            <Button appearance='secondary' className={styles.button} size='medium' key={index} onClick={() => props.onButtonClick(questionText)}>{questionText}</Button>
                        )
                    })
                }
            </div>
        </div>
    );
};