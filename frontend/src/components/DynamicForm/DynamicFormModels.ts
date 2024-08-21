export enum DynamicFieldType {
    text = "text",
    number = "number",
    date = "date",
    select = "select",
    checkbox = "checkbox",
    radio = "radio",
    textarea = "textarea",
};

export interface IDynamicFormField {
    name: string;
    label: string;
    type: DynamicFieldType;
    options?: string[];
    required?: boolean;
    value?: string | number | boolean | Date | string[];
    order?: number;
};