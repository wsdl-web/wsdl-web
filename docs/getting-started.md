# Getting Started

## Loading a WSDL

There are three ways to load a WSDL:

1. **From a URL** — paste a WSDL URL into the search bar and click **Explore** (or press Enter).
2. **From a local file** — click **Browse** to select a `.wsdl` or `.xml` file from your device.
3. **From a deep link** — open a URL with `?url=<wsdl-url>` to load a WSDL automatically. Add `#Service/Endpoint/Operation` to jump straight to a specific operation. Example: `https://wsdl-web.github.io/wsdl-web/?url=https://example.com/service?wsdl#MyService/MyPort/GetData`

## Exploring services

Once loaded, the app displays:

- **Service name** and WSDL version badge
- **Target namespace**
- **Base URL** — override the endpoint host if needed (e.g. to point at localhost)

Operations are grouped by endpoint. Click an endpoint group to expand it, then click an operation to see its details.

## Operation details

Each operation shows:

- **Endpoint** — the URL requests will be sent to
- **SOAPAction** — the SOAP action header value
- **Binding** — SOAP version and style (document or RPC)
- **Request** — a pre-generated SOAP envelope with sample values from the XSD schema

## Sending requests

1. Click **Try it out** to make the request XML editable.
2. Modify the XML if needed.
3. Click **Execute** to send the SOAP request.
4. The response is displayed below with the HTTP status, timing, and full response body.

## Overriding the base URL

The WSDL defines endpoint addresses, but you can override the base URL to redirect requests to a different host. Enter a base URL (e.g. `http://localhost:8080`) in the **Base URL** field — the path from the WSDL endpoint is preserved.

## CORS

SOAP services typically don't set CORS headers, so requests from the browser may be blocked. If this happens, you can:

- Run a local CORS proxy such as [cors-anywhere](https://github.com/Rob--W/cors-anywhere) and prefix your endpoint URL with the proxy address.
- Use a browser extension that adds CORS headers.
- Serve the app from the same origin as the SOAP service.

The same applies when fetching the WSDL itself — if the WSDL URL doesn't allow cross-origin requests, you'll need to proxy it.