import { IDynamicFormField } from "../components/DynamicForm/DynamicFormModels";

export const post_form_data = async (messageId: string, form_data: any): Promise<Response> => {
    const response = await fetch("/post_form_data", {
        method: "POST",
        body: JSON.stringify({
            message_id: messageId,
            form_data: form_data
        }),
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then((res) => {
            return res
        })
        .catch((err) => {
            console.error("There was an issue posting form data.");
            let errRes: Response = {
                ...new Response,
                ok: false,
                status: 500,
            }
            return errRes;
        })
    return response;
}

export const get_user_form_data = async (): Promise<IDynamicFormField[] | undefined> => {
    try {
        const response = await fetch("/get_user_form_data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })
        const responseJSON = await response.json();
        // If the response has the data.formValues node return that, otherwise return the data node which is a previous version of the form data.
        const formData: IDynamicFormField[] = responseJSON.data?.formValues ? responseJSON.data.formValues : responseJSON.data;
        return formData;
    } catch (error) {
        console.error("There was an issue getting form data.");
        return undefined;
    }
}

