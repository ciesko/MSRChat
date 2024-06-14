import * as React from 'react';
import { SuggestionButtonStyles } from './SuggestionButtonStyles';
import { Button } from '@fluentui/react-components';

export interface ISuggestionButtonsProps {
    onButtonClick: (questionText: string) => void;
}

const questions = [
    `How do I configure PIM on my subscription?`,
    `Can you tell me how to setup managed identity with my storage account?`,
    `How do I setup a separate profile for SC-ALT account on Edge browser?`,
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