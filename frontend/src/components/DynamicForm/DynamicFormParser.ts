import { IDynamicFormField } from "./DynamicFormModels";

export const DynamicFormParser = (answer: string): { trimmedAnswer: string, formData: IDynamicFormField[] | undefined } => {
    // find the index of --Start State-- and --End State-- and if they exist then extract the form data to a JSON object
    let formDataString = "";
    const startStateIndex = answer.indexOf("--START STATE--");
    const endStateIndex = answer.indexOf("--END STATE--", startStateIndex + "--START STATE--".length);

    if (startStateIndex !== -1 && endStateIndex !== -1) {
        formDataString = answer.substring(startStateIndex + "--START STATE--".length, endStateIndex);
    }

    // formDataJson will be the JSON object parsed from formDataString use a try
    let answerObjectJson: any;
    let formData: IDynamicFormField[] | undefined;
    try {
        answerObjectJson = JSON.parse(formDataString);
        if (answerObjectJson) {
            formData = answerObjectJson.formData?.map((field: any) => {
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
        }
    } catch (e) {
        console.error("Failed to parse JSON", e);
        answerObjectJson = undefined;
    }

    // trimmed answer is the answer with removal of everything between --Start State-- and --End State-- the placeholder for the form data if start and end states are found
    let trimmedAnswer = answer;
    if (startStateIndex !== -1 && endStateIndex !== -1) {
        trimmedAnswer = answer.substring(0, startStateIndex) + answer.substring(endStateIndex + "--END STATE--".length);
    }
    return { trimmedAnswer, formData };
}
