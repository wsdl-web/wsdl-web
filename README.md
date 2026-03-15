# WSDL Web UI

A browser-based interactive explorer for WSDL web services. Enter a WSDL URL to inspect its services, endpoints, bindings and operations, then invoke them directly from the browser with auto-generated SOAP requests.

Think [Swagger UI](https://github.com/swagger-api/swagger-ui), but for SOAP/WSDL.

**[Try it live](https://wsdl-tools.github.io/wsdl-web-ui)** — no install required.

## Features

- **WSDL 1.1 and 2.0** support with automatic version detection
- **SOAP 1.1 and 1.2** envelope generation and invocation
- **Document and RPC** binding styles
- **Auto-generated SOAP requests** from XSD type definitions, with sample values pre-filled
- **"Try it out" mode** — edit the generated XML, then execute the request and see the response
- **Syntax-highlighted XML** for requests and responses
- **Response metadata** — HTTP status, response time, full response body

## Usage

1. Open the app in your browser.
2. Enter a WSDL URL in the top bar and click **Explore** (or press Enter).
3. The WSDL is fetched and parsed. You'll see the service name, target namespace, and a list of endpoint groups.
4. Expand an endpoint group to see its operations.
5. Click an operation to see its details: endpoint address, SOAPAction, binding style, and a pre-generated SOAP request envelope.
6. Click **Try it out** to make the request editable.
7. Modify the XML if needed, then click **Execute** to send the SOAP request.
8. The response (status code, timing, and body XML) is displayed below.

### CORS

SOAP services typically don't set CORS headers, so requests from the browser may be blocked. If this happens, you can:

- Run a local CORS proxy such as [cors-anywhere](https://github.com/Rob--W/cors-anywhere) and prefix your endpoint URL with the proxy address.
- Use a browser extension that adds CORS headers.
- Serve the app from the same origin as the SOAP service.

The same applies when fetching the WSDL itself — if the WSDL URL doesn't allow cross-origin requests, you'll need to proxy it.

## Building from source

Requires Node.js 18+.

```sh
# Install dependencies
npm install

# Start the development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The production build is output to `dist/`. Serve it with any static file server.

## License

Apache 2.0
