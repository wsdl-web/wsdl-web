# Import and Include Resolution

Many enterprise WSDL files split their definitions across multiple documents using `<wsdl:import>`, `<wsdl:include>`, `<xsd:import>`, and `<xsd:include>`. WSDL Web resolves these automatically.

## What's resolved

| Element | Scope |
|---------|-------|
| `<wsdl:import>` | WSDL 1.1 and 2.0 — imports services, bindings, and port types from another WSDL |
| `<wsdl:include>` | WSDL 2.0 — includes definitions from another WSDL in the same namespace |
| `<xsd:import>` | Imports type definitions from an external XSD schema |
| `<xsd:include>` | Includes type definitions from an XSD in the same namespace |

## How it works

1. When a WSDL is loaded, WSDL Web scans for import and include elements.
2. Referenced documents are fetched and parsed.
3. Their contents (services, bindings, interfaces, and types) are merged into the main document.
4. The process repeats recursively for nested imports, up to 10 levels deep.

Circular imports are detected and skipped. If a referenced document fails to load (e.g. network error or missing file), the import is skipped gracefully and the rest of the WSDL is still usable.

## CORS considerations

Imported documents are fetched from the browser, so the same [CORS considerations](getting-started.md#cors) apply. If an imported schema is hosted on a different origin without CORS headers, it won't be resolved. In that case, consider using a CORS proxy or serving all files from the same origin.
