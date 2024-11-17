import useRequest from "../../hooks/use-request";
import Router from "next/router";
import {useEffect} from "react";


const Signout = () => {

    const {doRequest} = useRequest({
        method: 'post',
        url: '/api/users/signout',
        body: {},
        onSuccess: () => Router.push('/')
    });

    useEffect(() => {
        doRequest();
    }, []);

    return (
        <div>
            Signing you out...
        </div>
    );

}

export default Signout;