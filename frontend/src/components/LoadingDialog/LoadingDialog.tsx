import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, DialogTrigger, Button, Spinner, Subtitle2 } from '@fluentui/react-components';
import * as React from 'react';
import { LoadingDialogStyles } from './LoadingDialogStyles';

export interface ILoadingDialogProps { 
    open: boolean;
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
                        <DialogTitle>
                            <div className={styles.titleRow}>
                                <Spinner />Importing data
                            </div>
                        </DialogTitle>
                        <DialogContent>
                            <div>

                                <Subtitle2>This may take a while.</Subtitle2>
                            </div>
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
};