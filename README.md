
# Microservices with Node.js and Next.js

POC of how to create a simple application using the microservices, using Docker, Kubernetes, Skaffold, MongoDB and NATS as EventBus.


## Run in dev mode

1) Edit hosts in Windows:

    ```C:\Windows\System32\drivers\etc\```
    
    file: ```hosts```
    
    Add the following line to forward all requests to the domain to the localhost.
    
    ```127.0.0.1 ticketing.dev```


2) Install the load balancer

    Load balancer service is controlled by [ingress-nginx](https://kubernetes.github.io/ingress-nginx/)
    
    ```> kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0-beta.0/deploy/static/provider/cloud/deploy.yaml```

3) Create a secret for handling the JWT
    ```
    $ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
    ```
     
    >NOTE: if you want to delete the secret
    >```
    >$ kubectl delete secret db-user-pass
    >```

4) To run in dev mode use [Skaffold](https://skaffold.dev/).

    ```skaffold dev```
    
    >NOTE: to close dev run ```CTRL+C```



## GENERAL

### Updating the image used by a Deployment

- Make an update to your code
- Build the image
- Push the image to docker hub  (or the artifactory you prefer)
- Run the command:   
  ```> kubectl rollout restart deployment [depl_name]```

 ### Update common library

if common library changes, you should go to each microservice folder and execute the following command to get the latest version:

```
$ npm i @gabrielhernan_tickets/common@latest
```