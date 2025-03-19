import {useEffect, useState} from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow =  ({order, currentUser}) => {

    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess:() => Router.push('/orders')

    })

    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000)

        return () => {
           clearInterval(timerId);
        };
    }, []);


    if(timeLeft < 0) {
        return (

            <div>Order Expired</div>

        );
    }


    return (
        <div>
            <p>{timeLeft} seconds until order expires</p>
            {errors}
            <StripeCheckout
                token={({id})=>doRequest({token: id})}
                stripeKey="pk_test_51Qug3MQLeDz2nS1zqafvxGoSiqnM1VXDX3nIIozacTVK33VEXkPnihkqHcV0QvYPRuhSYYypRgixk56W4lUVIxpn00rxbVQKzW"
                amount={order.ticket.price * 100}
                email={currentUser.email}

            />
        </div>
    );

};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);

    return {order: data};

}

export default OrderShow;