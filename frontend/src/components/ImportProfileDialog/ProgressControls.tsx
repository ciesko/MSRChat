import * as React from 'react';
import { ProgressControlsStyles } from './ProgressControlsStyles';
import { Button } from '@fluentui/react-components';

export interface IProgressControlsProps {
    steps: number;
    currentIndex: number;
    onNextClick?: () => void;
}

export const ProgressControls: React.FunctionComponent<IProgressControlsProps> = (props: React.PropsWithChildren<IProgressControlsProps>) => {
    const styles = ProgressControlsStyles();
    const [currentIndex, setCurrentIndex] = React.useState(props.currentIndex);

    React.useEffect(() => {
        setCurrentIndex(props.currentIndex);
    }, [props.currentIndex]);

    return (
        <div className={styles.container}>

            <Button onClick={props.onNextClick} disabled={currentIndex === props.steps - 1}>Skip</Button>
            <div className={styles.progressRow}>
                {
                    Array.from({ length: props.steps }).map((_, index) => (
                        <div
                            key={index}
                            className={styles.progress}
                            style={{ opacity: index === currentIndex ? 1 : 0.3, width: index === currentIndex ? '16px' : '8px' }}
                        />
                    ))
                }
            </div>
            <Button appearance='primary' onClick={props.onNextClick}>
                {currentIndex === props.steps - 1 ? 'Finish' : 'Next'}
            </Button>
        </div>
    );
};