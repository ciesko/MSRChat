import * as React from 'react';
import { DynamicFormStyles } from './DynamicFormStyles';
import { IDynamicFormField } from './DynamicFormModels';
import { DynamicFormField } from './DynamicFormField';
import { Button, Caption1, Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Link, MessageBar, MessageBarBody, MessageBarTitle, Subtitle1, Subtitle2, Title3 } from '@fluentui/react-components';
import { post_form_data } from '../../api/dynamicFormApi';
import _ from 'lodash';


export interface IDynamicFormProps {
  formTitle: string;
  fields: IDynamicFormField[];
  onClearAllClick?: () => void;
}

export enum FormState {
  Loading,
  Edit,
  Success,
  Error
}

export const DynamicForm: React.FunctionComponent<IDynamicFormProps> = (props: React.PropsWithChildren<IDynamicFormProps>) => {
  const styles = DynamicFormStyles();
  const [fields, setFields] = React.useState<IDynamicFormField[]>(props.fields);
  const [formState, setFormState] = React.useState<FormState>(FormState.Edit);

  const onFieldChange = (value: string, field: IDynamicFormField) => {
    const updatedFields = fields.map((_field) => {
      if (_field.name === field.name) {
        return { ..._field, value: value };
      }
      return _field;
    });
    setFields(updatedFields);
  };

  const formIsValid = (_fields: IDynamicFormField[]) => {
    return _fields.filter((field) => field.required && (field.value === undefined || field.value === '')).length === 0;
  }

  const submitForm = async () => {
    setFormState(FormState.Loading);
    try {
      const _response = await post_form_data('messageId', fields);
      if (_response.ok) {
        setFormState(FormState.Success);
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
          <Subtitle1>{props.formTitle}</Subtitle1>
          <Caption1><i>AI generated content may be incorrect</i></Caption1>
        </div>
        <p>
          This form will dynamically update based on the chat to the left and any data you import. You can also make edits directly. When you are happy with the content click save.
        </p>
        {
          fields
            .sort((a, b) => (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0)
            .map((field: IDynamicFormField) => (
              <DynamicFormField
                key={field.name}
                field={field}
                onChange={(value: string) => onFieldChange(value, field)}
                disabled={formState === FormState.Loading || formState === FormState.Success}
              />
            ))
        }
        {
          !formIsValid(fields) && (
            <div className={styles.validationMessage}>
              *Please fill in all required fields
            </div>
          )
        }
        {
          fields.length > 0 && (
            <div className={styles.footerActionRow}>
              {
                formState === FormState.Error && (
                  <MessageBar intent='error'>
                    <MessageBarBody>
                      There was an error submitting your{" "}<Link as='button' onClick={downloadProfile}>profile</Link>.
                    </MessageBarBody>
                  </MessageBar>
                )
              }
              {
                formState === FormState.Success && (
                  <MessageBar intent='success'>
                    <MessageBarBody>
                      Your{" "}<Link as='button' onClick={downloadProfile}>profile</Link>{" "}was submitted successfully.
                    </MessageBarBody>
                  </MessageBar>
                )
              }
              <Dialog modalType='alert'>
                <DialogTrigger disableButtonEnhancement>
                  <Button disabled={!formIsValid(fields) || formState === FormState.Success}>Clear all</Button>
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
              <Button appearance='primary' onClick={submitForm} disabled={!formIsValid(fields) || formState === FormState.Success || formState === FormState.Loading } >Submit</Button>
            </div>
          )
        }
      </Card>
    </>
  );
};