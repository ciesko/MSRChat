import { DynamicFieldType, IDynamicFormField } from "./DynamicFormModels";

export const DynamicFormData: IDynamicFormField[] = [
    {
        name: "name",
        label: "Name",
        type: DynamicFieldType.text,
        required: true,
        order: 1,
        value: "John Doe",
    },
    {
        name: "professionalBackground",
        label: "Professional background",
        type: DynamicFieldType.textarea,
        required: true,
        order: 2,
        value: "I have a degree in Computer Science and have been working as a software developer for 5 years.",
    },
    {
        name: "workStylePreferences",
        label: "Work Style Preferences",
        type: DynamicFieldType.textarea,
        required: true,
        order: 3,
        value: "I prefer working in a quiet environment with minimal distractions.",
    },
    {
        name: "socialLifestylePreferences",
        label: "Social and Lifestyle Preferences",
        type: DynamicFieldType.textarea,
        required: true,
        order: 4,
        value: "I enjoy spending time with friends and family, and I like to travel.",
    },
    {
        name: "preferencesAndValues",
        label: "Preferences and Values",
        type: DynamicFieldType.textarea,
        required: true,
        order: 5,
        value: "I value honesty, integrity, and hard work.",
    },
    {
        name: "funFacts",
        label: "Fun Facts",
        type: DynamicFieldType.textarea,
        required: true,
        order: 6,
        value: "I value honesty, integrity, and hard work.",
    },
];