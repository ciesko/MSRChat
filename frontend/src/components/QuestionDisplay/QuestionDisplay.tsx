import * as React from 'react';
import { Body1, Card } from '@fluentui/react-components';
import { QuestionDisplayStyles } from './QuestionDisplayStyles';

export interface IQuestionDisplayProps {
    content: string;
}

export const QuestionDisplay: React.FunctionComponent<IQuestionDisplayProps> = (props: React.PropsWithChildren<IQuestionDisplayProps>) => {
    const styles = QuestionDisplayStyles();
    const parseContent = (content: string) => {
        // Anything after the string, including the string, "** Start Current Form State" remove from content 
        const startIndex = content.indexOf('** Start Current Form State');
        if (startIndex > -1) {
            content = content.substring(0, startIndex);
        }
        return content;
    }
    return (
        <Card
            tabIndex={0}
            className={styles.card}
        >
            <Body1 align="end">{parseContent(props.content)}</Body1>
        </Card>
    );
};
