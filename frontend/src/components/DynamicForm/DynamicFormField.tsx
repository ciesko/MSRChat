import * as React from 'react';
import { DynamicFieldType, IDynamicFormField } from './DynamicFormModels';
import { Field, Input, Select, SpinButton, Textarea, TextareaOnChangeData } from '@fluentui/react-components';

export interface IDynamicFormFieldProps {
    field: IDynamicFormField;
    onChange?: (value: string) => void;
}

export const DynamicFormField: React.FunctionComponent<IDynamicFormFieldProps> = (props: React.PropsWithChildren<IDynamicFormFieldProps>) => {

    const getField = (field: IDynamicFormField) => {
        switch (field.type) {
            case DynamicFieldType.text:
                return (
                    <Field
                        label={field.label}
                        required={field.required}
                    >
                        <Input
                            value={String(field.value) || ''}
                            onChange={(event: React.FormEvent<HTMLDivElement>, data?: any) => {
                                if (props.onChange) {
                                    props.onChange(data?.value as string);
                                }
                            }}
                        />
                    </Field>
                );

            case DynamicFieldType.number:
                return (
                    <Field
                        label={field.label}>
                        <SpinButton
                        />
                    </Field>
                );

            case DynamicFieldType.date:
                return (
                    <input aria-label="date picker" type="date" />
                );

            case DynamicFieldType.select:
                return (
                    <Field
                        label={field.label}
                        required={field.required}
                    >
                        <Select
                            {...props}
                            title={props.field.label}
                            onChange={(event, data) => {
                                if (props.onChange) {
                                    props.onChange(data.value as string);
                                }
                            }
                            }
                        >
                            {field.options?.map((option: string) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Select>
                    </Field>
                );
            case DynamicFieldType.textarea:
                return (
                    <Field
                        label={field.label}
                        required={field.required}
                        style={{ width: '100%' }}
                    >
                        <Textarea
                            value={String(field.value) || ''}
                            onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
                                if (props.onChange) {
                                    props.onChange(data.value);
                                }
                            }}
                            rows={4}
                        />
                    </Field>
                );
            default:
                return <>Field not found...</>;
        }
    }

    return getField(props.field);

};