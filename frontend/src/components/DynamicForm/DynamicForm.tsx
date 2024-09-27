import * as React from 'react';
import { DynamicFormStyles } from './DynamicFormStyles';
import { IDynamicFormField } from './DynamicFormModels';
import { DynamicFormField } from './DynamicFormField';
import { Button, Caption1, Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Link, MessageBar, MessageBarBody, Subtitle2, Title3 } from '@fluentui/react-components';
import { post_form_data } from '../../api/dynamicFormApi';
import { SubmitDialog } from './SubmitDialog';
import { CheckmarkCircleRegular } from '@fluentui/react-icons';
import { AppStateContext } from '../../state/AppProvider';
import { useContext } from 'react';

export interface IDynamicFormProps {
  formTitle: string;
  fields: IDynamicFormField[];
  onClearAllClick?: () => void;
  onFieldChange: (fields: IDynamicFormField[]) => void;
  onSuccessfulSubmit?: () => void;
}

export enum FormState {
  Loading,
  Edit,
  Success,
  Error
}

const generateValidationMessage = (fields: IDynamicFormField[]): string => {
  // Empty fields will be any undefined, empty string
  const emptyFields = fields.filter((field) => (field.value === undefined || field.value === ''));
  if (emptyFields.length === 0) {
    return 'Nice work! Your profile is ready to be submitted.';
  } else if (emptyFields.length === 1) {
    return `Filling in more information in the ${emptyFields[0].label} will help improve the accuracy of the AI generated content.`;
  } else if (emptyFields.length === 2) {
    return `Filling in more information in the ${emptyFields.map((field) => field.label).join(' and ')} will help improve the accuracy of the AI generated content.`;
  } else if (emptyFields.length === 3) {
    return `Filling in more information in the ${emptyFields.map((field) => field.label).join(', ')} will help improve the accuracy of the AI generated content.`;
  } else if (emptyFields.length > 3) {
    return `Filling in more information in the ${emptyFields.map((field) => field.label).join(', ')} will help improve the accuracy of the AI generated content.`;
  }
  return '';
}

export const DynamicForm: React.FunctionComponent<IDynamicFormProps> = (props: React.PropsWithChildren<IDynamicFormProps>) => {
  const styles = DynamicFormStyles();
  const appStateContext = useContext(AppStateContext);
  const [fields, setFields] = React.useState<IDynamicFormField[]>(props.fields);
  const [formState, setFormState] = React.useState<FormState>(FormState.Edit);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);

  const onFieldChange = (value: string, field: IDynamicFormField) => {
    const updatedFields = fields.map((_field) => {
      if (_field.name === field.name) {
        return { ..._field, value: value };
      }
      return _field;
    });
    setFields(updatedFields);
    props.onFieldChange(updatedFields);
  };

  const formIsValid = (_fields: IDynamicFormField[]) => {
    return _fields.filter((field) => field.required && (field.value === undefined || field.value === '')).length === 0;
  }

  const submitForm = async () => {
    setShowSubmitDialog(false);
    const fieldsAndChat = {
      chatLog: appStateContext?.state?.currentChat,
      formValues: fields
    };

    setFormState(FormState.Loading);
    try {
      const _response = await post_form_data('messageId', fieldsAndChat);
      if (_response.ok) {
        setFormState(FormState.Success);
        props.onSuccessfulSubmit?.();
      } else {
        setFormState(FormState.Error);
      }
    } catch (error) {
      setFormState(FormState.Error);
    }
  }

  const downloadProfile = () => {
    // Create a .txt file of the profile download it
    const profile = fields.map((field) => `${field.label}: ${field.value}`).join('\n\n');
    const blob = new Blob([profile], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyProfile.txt';
    a.click();
  }

  React.useEffect(() => {
    setFields(props.fields);
  }, [props.fields]);

  return (
    <>
      <Card className={styles.container}>
        <div className={styles.titleRow}>
          <Subtitle2>{props.formTitle}</Subtitle2>
          <Caption1><i>AI generated content may be incorrect</i></Caption1>
        </div>
        {
          formState !== FormState.Success && (
            <p>
              This form will dynamically update based on the chat to the left and any data you import. You can also make edits directly. When you are happy with the content click submit.
            </p>
          )
        }
        {
          formState === FormState.Success && (
            <div className={styles.successContainer}>
              <CheckmarkCircleRegular className={styles.icon} title='Success' />
              <Title3 className={styles.messageTitle}>Success!</Title3>
              <Subtitle2>Thank you for submitting your profile!</Subtitle2>
              <p><Link as='button' onClick={downloadProfile}>Click here</Link> to download a copy.</p>
            </div>
          )
        }
        {
          formState !== FormState.Success &&
          <div className={styles.formFieldsContainer}>
            {
              fields
                .sort((a, b) => (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0)
                .map((field: IDynamicFormField) => (
                  <DynamicFormField
                    key={field.name}
                    field={field}
                    onChange={(value: string) => onFieldChange(value, field)}
                    disabled={formState === FormState.Loading}
                  />
                ))
            }
          </div>
        }
        {
          !formIsValid(fields) && (
            <div className={styles.validationMessage}>
              *Please fill in all required fields
            </div>
          )
        }
        {
          fields.length > 0 && formState !== FormState.Success && (
            <div className={styles.footerActionRow}>
              {
                formState === FormState.Error && (
                  <MessageBar intent='error'>
                    <MessageBarBody>
                      Error submitting your{" "}<Link as='button' onClick={downloadProfile}>profile</Link>.
                    </MessageBarBody>
                  </MessageBar>
                )
              }
              <Dialog modalType='alert'>
                <DialogTrigger disableButtonEnhancement>
                  <Button disabled={!formIsValid(fields)}>Clear all</Button>
                </DialogTrigger>
                <DialogSurface>
                  <DialogBody>
                    <DialogTitle>Clear all</DialogTitle>
                    <DialogContent>This will delete all data and chat history. Do you want to continue?</DialogContent>
                    <DialogActions>
                      <DialogTrigger disableButtonEnhancement>
                        <Button appearance="secondary">Cancel</Button>
                      </DialogTrigger>
                      <DialogTrigger disableButtonEnhancement>
                        <Button appearance='primary' onClick={props.onClearAllClick}>Continue</Button>
                      </DialogTrigger>
                    </DialogActions>
                  </DialogBody>
                </DialogSurface>
              </Dialog>
              <Button appearance='primary' onClick={() => setShowSubmitDialog(true)} disabled={!formIsValid(fields) || formState === FormState.Loading} >Submit</Button>
            </div>
          )
        }
        <SubmitDialog
          show={showSubmitDialog}
          ondialogClose={() => setShowSubmitDialog(false)}
          onSubmit={submitForm}
          validationMessage={generateValidationMessage(fields)}
        />
      </Card>
    </>
  );
};