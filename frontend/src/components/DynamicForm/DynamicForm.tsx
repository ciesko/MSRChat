import * as React from 'react';
import { DynamicFormStyles } from './DynamicFormStyles';
import { IDynamicFormField } from './DynamicFormModels';
import { DynamicFormField } from './DynamicFormField';
import { Button, Card, CardFooter, Title3 } from '@fluentui/react-components';


export interface IDynamicFormProps {
  formTitle: string;
  fields: IDynamicFormField[];
}

export const DynamicForm: React.FunctionComponent<IDynamicFormProps> = (props: React.PropsWithChildren<IDynamicFormProps>) => {
  const styles = DynamicFormStyles();

  const onFieldChange = (value: string, field: IDynamicFormField) => {

    field.value = value;
  };

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
          <Button>Clear all</Button>
          <Button appearance='primary'>Submit</Button>
        </div>
    </Card>
  );
};