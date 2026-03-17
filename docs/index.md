# WSDL Web

A browser-based interactive explorer for WSDL web services. Enter a WSDL URL to inspect its services, endpoints, bindings and operations, then invoke them directly from the browser with auto-generated SOAP requests.

> Think [Swagger UI](https://github.com/swagger-api/swagger-ui), but for SOAP/WSDL.

## Features

- **WSDL 1.1 and 2.0** support with automatic version detection
- **SOAP 1.1 and 1.2** envelope generation and invocation
- **Document and RPC** binding styles
- **Auto-generated SOAP requests** from XSD type definitions, with sample values pre-filled
- **"Try it out" mode** — edit the generated XML, execute the request, and see the response
- **Syntax-highlighted XML** for requests and responses
- **SOAP Fault display** — structured rendering of fault codes, reasons, and details
- **Response metadata** — HTTP status, response time, full response body
- **Copy as cURL** — copy the SOAP request as a ready-to-use cURL command
- **Inline documentation** — displays `<wsdl:documentation>` from services and operations
- **Custom request headers** — add headers like Authorization, API keys, or WS-Security tokens
- **Base URL override** — redirect requests to a different host (e.g. localhost)
- **Local file support** — browse and load WSDL files from your device
- **Import/include resolution** — recursive fetching and merging of multi-file WSDLs and XSDs
- **Deep linking** — shareable URLs with `?url=` and `#service/endpoint/operation`

## Quick start

See the [Getting started](getting-started.md) guide to load your first WSDL and explore its operations.

## Running WSDL Web

### Online

Visit the [live site](https://wsdl-web.github.io/) — no install required.

### Docker

```sh
docker run -p 8080:80 outofcoffee/wsdl-web
```

Then open [http://localhost:8080](http://localhost:8080) in your browser. See the [Docker guide](docker.md) for more options.

### From source

Requires Node.js 24+.

```sh
npm install
npm run dev
```
