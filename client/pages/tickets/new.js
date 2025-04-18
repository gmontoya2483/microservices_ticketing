import {useState} from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const NewTicket = () =>{

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {title, price},
        onSuccess: async (ticket)=>{
            console.log(ticket)
            await Router.push('/');

        }
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        await doRequest();

    }

    const onBlur = () => {

        const value = parseFloat(price);
        if(isNaN(value)) {
            setPrice('');
            return;
        }

        setPrice(value.toFixed(2));

    }


    return (
        <div>
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input
                        className="form-control"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onBlur={onBlur}
                    />
                </div>
                {errors}
                <button className='btn btn-primary'>Submit</button>

            </form>
        </div>
    );

};

export default NewTicket;