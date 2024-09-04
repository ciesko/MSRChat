import * as React from 'react';
import { DynamicFormStyles } from './DynamicFormStyles';
import { IDynamicFormField } from './DynamicFormModels';
import { DynamicFormField } from './DynamicFormField';
import { Button, Caption1, Card, Subtitle1, Subtitle2, Title3 } from '@fluentui/react-components';


export interface IDynamicFormProps {
  formTitle: string;
  fields: IDynamicFormField[];
  onClearAllClick?: () => void;
}

export const DynamicForm: React.FunctionComponent<IDynamicFormProps> = (props: React.PropsWithChildren<IDynamicFormProps>) => {
  const styles = DynamicFormStyles();
  const [fields, setFields] = React.useState<IDynamicFormField[]>(props.fields);

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

  const onSubmitClick = () => {
    const fields = props.fields.map((field) => `${field.label}: ${field.value}`).join('\n\n\n');
    const blob = new Blob([fields], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement
      ('a');
    a.href
      = url;
    let fileName = String(props.fields.find((field) => field.name === 'fullName')?.value) || 'userprofile';
    fileName = fileName.replace(/[^a-zA-Z0-9]/g, '') + 'Profile.txt';
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  React.useEffect(() => {
    setFields(props.fields);
  }, [props.fields]);

  return (
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
            <Button onClick={props.onClearAllClick}>Clear all</Button>
            <Button appearance='primary' onClick={onSubmitClick} disabled={!formIsValid(fields)}>Submit</Button>
          </div>
        )
      }
    </Card>
  );
};