# Copy as cURL

You can copy any SOAP request as a ready-to-use cURL command for debugging or sharing.

## Usage

1. Expand an operation and click **Try it out**.
2. Click **Copy as cURL** next to the Execute button.
3. The cURL command is copied to your clipboard.

## What's included

The generated cURL command includes:

- The correct `Content-Type` header (`text/xml` for SOAP 1.1, `application/soap+xml` for SOAP 1.2)
- The `SOAPAction` header (SOAP 1.1) or `action` parameter in Content-Type (SOAP 1.2)
- The full request body
- The endpoint URL (respecting any base URL override)

## Example

```sh
curl \
  -H 'Content-Type: text/xml; charset=utf-8' \
  -H 'SOAPAction: "http://example.com/GetLastTradePrice"' \
  -d '<?xml version="1.0" encoding="UTF-8"?>...' \
  'http://example.com/stockquote'
```
