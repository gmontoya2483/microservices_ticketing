import {useState} from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";



const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const {doRequest, errors} = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: () => Router.push('/')
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await doRequest()



    }





    return (
        <form onSubmit={handleSubmit}>
            <h1>Sign up</h1>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {errors}
            <button className="btn btn-primary">Sign up</button>
        </form>
    )
}

export default Signup;