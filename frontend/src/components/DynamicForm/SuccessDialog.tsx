import { Dialog, DialogContent, DialogSurface, DialogTitle, Title3, Link } from '@fluentui/react-components';
import { CheckmarkCircleRegular } from '@fluentui/react-icons';
import * as React from 'react';
import { SuccessDialogStyles } from './SuccessDialogStyles';

export interface ISuccessDialogProps {
    open: boolean;
    onDownloadClick: () => void;
}

export const SuccessDialog: React.FunctionComponent<ISuccessDialogProps> = (props: React.PropsWithChildren<ISuccessDialogProps>) => {
    const styles = SuccessDialogStyles();
    return (
        <Dialog open={props.open} modalType='alert'>
            <DialogSurface>
                <DialogContent className={styles.body}>
                    <CheckmarkCircleRegular className={styles.icon} title='Success' />
                    <Title3 className={styles.messageTitle}>Success!</Title3>
                    <p>Thank you for submitting your profile!</p>
                    <Link as='button' onClick={props.onDownloadClick}>Download your profile</Link>
                </DialogContent>
            </DialogSurface>
        </Dialog>
    );
};