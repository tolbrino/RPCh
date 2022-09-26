# hopr-rpc-relay

A demo application of an RPC node that sends traffic into the HOPR network and then relays requests to an RPC provider.
Not meant to be used in production.

## Environment Variables

| variable                    | description                                         |
| :-------------------------- | :-------------------------------------------------- |
| ENTRY_PORT                  | the port in which the client will send RPC requests |
| HOPRD_API_ENDPOINT          | api endpoint of HOPRd                               |
| HOPRD_API_TOKEN             | api token of HOPRd                                  |
| RESPONSE_TIMEOUT (optional) | how many ms before we stop waiting for a response   |
