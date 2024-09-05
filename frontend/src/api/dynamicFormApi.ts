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