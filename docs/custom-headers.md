# Custom Headers

Add custom HTTP headers to SOAP requests — useful for authentication, API keys, or WS-Security tokens.

## Adding headers

1. In the **Custom Headers** panel (below the base URL field), click **Add**.
2. Enter a header name and value.
3. The header is included in all subsequent SOAP requests.

You can add multiple headers. Each header has a checkbox to enable or disable it without removing it.

## Use cases

| Header | Purpose |
|--------|---------|
| `Authorization` | Bearer tokens or Basic authentication |
| `X-API-Key` | API key authentication |
| `WS-Security` | WS-Security tokens |
| `X-Request-Id` | Request tracing |

## Behaviour

- Headers apply globally to all operations for the current WSDL.
- Disabled headers (unchecked) are not sent with requests.
- Headers are included in [Copy as cURL](copy-as-curl.md) output.
- The badge next to "Custom Headers" shows how many headers are currently enabled.
