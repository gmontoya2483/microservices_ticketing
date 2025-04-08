import axios from "axios";


const buildClient = ({ req }) => {

    if(typeof window === 'undefined') {

        // Server
        return axios.create({
            // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            baseURL: process.env.BASE_URL,
            headers: req.headers,
        })


    } else {
        // Browser
        return axios.create({
            baseURL: '/'
        })
    }

}


export default buildClient;