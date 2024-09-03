import { Avatar, Card, Subtitle1 } from '@fluentui/react-components';
import * as React from 'react';
import { AvatarCardStyles } from './AvatarCardStyles';

export interface IAvatarCardProps {
    imageUrl: string;
    title: string;
    subtitle: string;
    onClick?: () => void;
}

export const AvatarCard: React.FunctionComponent<IAvatarCardProps> = (props: React.PropsWithChildren<IAvatarCardProps>) => {
    const styles = AvatarCardStyles();
    return (
        <Card className={styles.card}>
            <Avatar
                name={props.title}
                size={96}
                image={{
                    src: props.imageUrl,
                }}
            />
            <Subtitle1>{props.title}</Subtitle1>
            <p>{props.subtitle}</p>
        </Card>
    );
};