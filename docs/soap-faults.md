# SOAP Fault Display

When a SOAP request returns a fault, WSDL Web detects it automatically and renders the fault in a structured, readable format instead of showing raw XML.

## What's displayed

Both SOAP 1.1 and 1.2 fault structures are supported.

### SOAP 1.1

| Field | Source element |
|-------|---------------|
| Fault code | `<faultcode>` |
| Fault string | `<faultstring>` |
| Actor | `<faultactor>` (if present) |
| Detail | `<detail>` (if present) |

### SOAP 1.2

| Field | Source element |
|-------|---------------|
| Code | `<Code><Value>` |
| Reason | `<Reason><Text>` |
| Role | `<Role>` (if present) |
| Node | `<Node>` (if present) |
| Detail | `<Detail>` (if present) |

## Detail view

If the fault includes a `<detail>` element, its contents are shown in a collapsible section with XML syntax highlighting. This is useful for service-specific error information that is nested inside the fault.

## Example

A SOAP 1.1 fault response like:

```xml
<soap:Fault>
  <faultcode>soap:Client</faultcode>
  <faultstring>Invalid ticker symbol</faultstring>
  <detail>
    <error xmlns="http://example.com/errors">
      <code>INVALID_SYMBOL</code>
      <message>The symbol 'XYZ123' was not found.</message>
    </error>
  </detail>
</soap:Fault>
```

is rendered as a colour-coded alert showing the fault code and message, with the detail XML expandable below.
