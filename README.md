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

## DevKit

The DevKit is a Docker Compose based approach of having a complete hoprd network
and HOPR RPC Relays running locally which is useful for development.

To achieve that the DevKit relies on HOPR Pluto, a pre-built HOPR network which
has 5 nodes running fully interconnected. On top of that each node has a HOPR
RPC Relay instance running alongside it and is configured to use that particular
node. A developer can then use the HOPR RPC Relay Entry API as normal and have
it being relayed locally fully-functional.

### Run DevKit

As a shorthand one can run the DevKit by executing:

```
make devkit-run
```

This will create and launch all required Docker containers. After a few minutes
the pluto container will print out access information for the hoprd nodes.

The HOPR RPC Relay instances can be reached individually over the following
endpoints once launced:

```
http://localhost:9001
http://localhost:9002
http://localhost:9003
http://localhost:9004
http://localhost:9005
```
