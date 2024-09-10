import { IDynamicFormField } from "./DynamicFormModels";

export const DynamicFormParser = (answer: string): { trimmedAnswer: string, formData: IDynamicFormField[] } => {
    // formDataString will be the content between the instance of --Start State-- and --End State--
    const formDataString = answer.substring(answer.indexOf("--START STATE--") + "--START STATE--".length, answer.indexOf("--END STATE--"));

    // formDataJson will be the JSON object parsed from formDataString use a try
    let answerObjectJson: any;
    try {
        answerObjectJson = JSON.parse(formDataString);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        throw new Error("Failed to parse JSON");
    }
    // Create a new array of IDynamicFormField objects from formdataJson
    const formData: IDynamicFormField[] = answerObjectJson.formData?.map((field: any) => {
        return {
            name: field.name,
            label: field.label,
            type: field.type,
            options: field.options,
            required: field.required,
            value: field.value,
            order: field.order,
            placeholder: field.placeholder
        };
    }
    );
    // trimmed answer is the answer with removal of everything between --Start State-- and --End State-- the placeholder for the form data
    const trimmedAnswer = answer.substring(0, answer.indexOf("--START STATE--")) + answer.substring(answer.indexOf("--END STATE--") + "--END STATE--".length);

    return { trimmedAnswer, formData };
}
