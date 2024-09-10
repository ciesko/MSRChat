import * as React from 'react';
import { DynamicFieldType, IDynamicFormField } from './DynamicFormModels';
import { Field, Input, Select, SpinButton, Textarea, TextareaOnChangeData } from '@fluentui/react-components';
import { set } from 'lodash';

export interface IDynamicFormFieldProps {
    field: IDynamicFormField;
    disabled?: boolean;
    onChange?: (value: string) => void;
}

export const DynamicFormField: React.FunctionComponent<IDynamicFormFieldProps> = (props: React.PropsWithChildren<IDynamicFormFieldProps>) => {
    const [value, setValue] = React.useState<string | number | boolean | Date | string[] | undefined>(props.field.value);
    React.useEffect(() => {
        setValue(props.field.value);
    }, [props.field.value]);
    
    const getField = (field: IDynamicFormField) => {
        switch (field.type) {
            case DynamicFieldType.text:
                return (
                    <Field
                        label={field.label}
                        required={field.required}
                    >
                        <Input
                            value={String(value) || ''}
                            onChange={(event: React.FormEvent<HTMLDivElement>, data?: any) => {
                                if (props.onChange) {
                                    props.onChange(data?.value as string);
                                    setValue(data?.value);
                                }
                            }}
                            disabled={props.disabled}
                            placeholder={field.placeholder}
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
                                    setValue(data.value);
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
                            value={String(value) || ''}
                            onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>, data: TextareaOnChangeData) => {
                                if (props.onChange) {
                                    props.onChange(data.value);
                                    setValue(data.value);
                                }
                            }}
                            rows={4}
                            disabled={props.disabled}
                            placeholder={field.placeholder}
                        />
                    </Field>
                );
            default:
                return <>Field not found...</>;
        }
    }

    return getField(props.field);

};