# SOAP and WSDL Version Support

WSDL Web supports both major versions of WSDL and SOAP, with automatic detection.

## WSDL versions

| Version | Namespace | Status |
|---------|-----------|--------|
| WSDL 1.1 | `http://schemas.xmlsoap.org/wsdl/` | Supported |
| WSDL 2.0 | `http://www.w3.org/ns/wsdl` | Supported |

The version is detected automatically from the root element's namespace. A version badge is shown in the service header.

## SOAP versions

| Version | Content-Type | SOAPAction |
|---------|-------------|------------|
| SOAP 1.1 | `text/xml; charset=utf-8` | Sent as a separate `SOAPAction` HTTP header |
| SOAP 1.2 | `application/soap+xml; charset=utf-8; action="..."` | Included as `action` parameter in `Content-Type` |

The SOAP version is determined from the binding in the WSDL. The correct envelope namespace, Content-Type, and SOAPAction handling are applied automatically.

## Binding styles

| Style | Description |
|-------|-------------|
| Document | The message parts appear directly under the SOAP `<Body>` element. This is the most common style. |
| RPC | The message parts are wrapped in an element named after the operation under the SOAP `<Body>`. |

The binding style is shown in the operation detail view alongside the SOAP version (e.g. "SOAP 1.1 / Document").

## XSD type support

WSDL Web parses XSD type definitions from the `<types>` section and uses them to generate sample request envelopes with placeholder values. Complex types, nested elements, and cardinality constraints (`minOccurs`/`maxOccurs`) are respected when building the sample XML.
