## Forwarding nats ports:


### Server

```
$ kubectl port-forward {nats pod name} 4222:4222
```


### Monitor
```
$ kubectl port-forward {nats pod name} 8222:8222
```
