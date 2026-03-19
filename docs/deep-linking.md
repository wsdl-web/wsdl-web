# Deep Linking

Share URLs that pre-load a WSDL and navigate directly to a specific operation.

## URL format

```
https://wsdl-web.github.io/wsdl-web/?url=<wsdl-url>#<Service>/<Endpoint>/<Operation>
```

## Query parameters

| Parameter | Description |
|-----------|-------------|
| `url`     | WSDL URL to load automatically on page open. Repeat to load multiple WSDLs with a spec switcher (e.g. `?url=a&url=b`). |

## Hash fragments

The hash fragment controls which endpoint group and operation are expanded:

| Fragment | Effect |
|----------|--------|
| `#Service/Endpoint/Operation` | Expands the endpoint group and the specific operation |
| `#Service/Endpoint` | Expands just the endpoint group |

## Examples

Load a WSDL and jump to a specific operation:

```
https://wsdl-web.github.io/wsdl-web/?url=https://example.com/service?wsdl#StockQuoteService/StockQuotePort/GetLastTradePrice
```

Load a WSDL without navigating to a specific operation:

```
https://wsdl-web.github.io/wsdl-web/?url=https://example.com/service?wsdl
```

## Multiple WSDLs

Pass multiple `url` parameters to load several WSDLs with a spec switcher dropdown:

```
https://wsdl-web.github.io/wsdl-web/?url=https://example.com/users?wsdl&url=https://example.com/orders?wsdl
```

The first URL is loaded automatically, and a dropdown appears in the top bar to switch between them.

## Live URL updates

The URL in the address bar updates as you navigate — expanding endpoint groups and operations. You can copy the current URL at any time to share your exact view.
