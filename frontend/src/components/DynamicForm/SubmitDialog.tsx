import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Spinner } from '@fluentui/react-components';
import * as React from 'react';

export interface ISubmitDialogProps {
    show: boolean;
    ondialogClose: () => void;
    validationMessage: string;
    onSubmit: () => void;
}

export const SubmitDialog: React.FunctionComponent<ISubmitDialogProps> = (props: React.PropsWithChildren<ISubmitDialogProps>) => {
    const [show, setShow] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const onSubmit = () => {
        setLoading(true);
        props.onSubmit();
    };

    React.useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    return (
        <Dialog open={show} modalType='alert'>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Are you sure you want to submit?</DialogTitle>
                    <DialogContent>
                        <p>{props.validationMessage}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={props.ondialogClose} disabled={loading}>Cancel</Button>
                        {
                            !loading ? 
                            <Button appearance='primary' onClick={onSubmit}>Submit</Button>
                            :
                            <Spinner />
                        } 
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};