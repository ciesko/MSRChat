import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle } from '@fluentui/react-components';
import * as React from 'react';
import { FormState } from './DynamicForm';

export interface ISubmitDialogProps {
    show: boolean;
    ondialogClose: () => void;
    validationMessage: string;
    onSubmit: () => void;
}

export const SubmitDialog: React.FunctionComponent<ISubmitDialogProps> = (props: React.PropsWithChildren<ISubmitDialogProps>) => {
    const [show, setShow] = React.useState(true);

    React.useEffect(() => {
        console.log('props.show', props.show);
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
                        <Button onClick={props.ondialogClose}>Cancel</Button>
                        <Button appearance='primary' onClick={props.onSubmit}>Submit</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};