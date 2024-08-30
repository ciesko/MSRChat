import * as React from 'react';
import { DynamicFormStyles } from './DynamicFormStyles';
import { IDynamicFormField } from './DynamicFormModels';
import { DynamicFormField } from './DynamicFormField';
import { Button, Card, Title3 } from '@fluentui/react-components';


export interface IDynamicFormProps {
  formTitle: string;
  fields: IDynamicFormField[];
  onClearAllClick?: () => void;
}

export const DynamicForm: React.FunctionComponent<IDynamicFormProps> = (props: React.PropsWithChildren<IDynamicFormProps>) => {
  const styles = DynamicFormStyles();

  const onFieldChange = (value: string, field: IDynamicFormField) => {
    field.value = value;
  };

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

  return (
    <Card className={styles.container}>
      <Title3>{props.formTitle}</Title3>
      {
        props.fields
          .sort((a, b) => (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0)
          .map((field: IDynamicFormField) => (
            <DynamicFormField
              key={field.name}
              field={field}
              onChange={(value: string) => onFieldChange(value, field)}
            />
          ))
      }
      <div className={styles.footerActionRow}>
        <Button onClick={props.onClearAllClick}>Clear all</Button>
        <Button appearance='primary' onClick={onSubmitClick}>Submit</Button>
      </div>
    </Card>
  );
};