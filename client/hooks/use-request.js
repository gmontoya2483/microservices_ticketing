import {useState} from "react";
import axios from "axios";


function useRequest({url, method, body, onSuccess}) {

    const [errors, setErrors] = useState(null);


    const doRequest = async () => {

        try {
            setErrors(null);
            const response = await axios[method](url, body);
            if (onSuccess) {
                onSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger mt-3">
                    <h4>Ooops...</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map((error) => (
                            <li key={error.message}>
                                <strong>{error.field ? error.field : 'message'}: </strong>
                                <span>{error.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
    }


    return {doRequest, errors};
}


export default useRequest