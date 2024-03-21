import * as React from 'react';
import { SuggestionButtonStyles } from './SuggestionButtonStyles';
import { Button, Subtitle2 } from '@fluentui/react-components';

export interface ISuggestionButtonsProps {
    onButtonClick: (questionText: string) => void;
}

const questions = [
    `Can you summarize discussions about AI Platform 3.0?`,
    `What were some main takeaways from the AI & Society workshops?`,
    `Which emerging technologies were prominent across mutiple workshops?`,
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
                            <Button appearance='secondary' className={styles.button} size='large' key={index} onClick={() => props.onButtonClick(questionText)}>{questionText}</Button>
                        )
                    })
                }
            </div>
        </div>
    );
};