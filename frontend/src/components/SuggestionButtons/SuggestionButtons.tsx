import * as React from 'react';
import { SuggestionButtonStyles } from './SuggestionButtonStyles';
import { Button, Subtitle2 } from '@fluentui/react-components';
import { useEffect, useState } from 'react';

export interface ISuggestionButtonsProps {
    onButtonClick: (questionText: string) => void;
}

const questions = [
    `What were the main themes and topics discussed during the AI Cultures workshop?`,
    `Summarize the insights and conclusions drawn from the Evaluating Models workshop.`,
    `What were the most discussed challenges during the Multi-Agent AI workshop?`,
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
                            <Button appearance='secondary' className={styles.button} size={'medium'} key={index} onClick={() => props.onButtonClick(questionText)}>{questionText}</Button>
                        )
                    })
                }
            </div>
        </div>
    );
};