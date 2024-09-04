import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Button, Spinner, Subtitle2, Title2, Title3 } from '@fluentui/react-components';
import * as React from 'react';
import { LoadingDialogStyles } from './LoadingDialogStyles';

export interface ILoadingDialogProps { 
    open: boolean;
    title: string;
    subTitle?: string;
}

export const LoadingDialog: React.FunctionComponent<ILoadingDialogProps> = (props: React.PropsWithChildren<ILoadingDialogProps>) => {
    const styles = LoadingDialogStyles();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    return (
        <>
            <Dialog
                // this controls the dialog open state
                modalType="alert"
                open={open}
                onOpenChange={(event, data) => {
                    // it is the users responsibility to react accordingly to the open state change
                    setOpen(data.open);
                }}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogContent className={styles.content}>
                            <div className={styles.titleRow}>
                                <Spinner /><Title3>{props.title}</Title3>
                            </div>
                                <Subtitle2>{props.subTitle}</Subtitle2>
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
};