# Feature Roadmap — WSDL Web UI

WSDL Web UI currently covers the core loop: parse WSDL, display services/operations, generate sample SOAP envelopes, execute requests, and show responses. This roadmap identifies features to add, while staying relevant to the SOAP/WSDL domain.

---

## Priority 1 — High impact, fills obvious gaps

### ~~1. Deep linking (URL hash routing)~~ ✅
Support `?url=...` to pre-load a WSDL and `#service/endpoint/operation` to auto-expand to a specific operation. Essential for sharing and bookmarking.

### 2. WSDL `<documentation>` extraction and display
Parse `<wsdl:documentation>` elements on services, port types, and operations. Show them inline — service-level docs in the header, operation-level docs in the detail view.

### 3. Custom request headers (including WS-Security)
Add a headers panel — global or per-operation — where users can add key/value pairs included in requests. Covers Basic Auth, API keys, and WS-Security tokens.

### 4. SOAP Fault parsing and display
Detect `<soap:Fault>` in responses and render them distinctly — showing faultcode, faultstring, and detail in a structured, readable format.

### 5. WSDL `<import>` and `<include>` resolution
Recursive fetching and merging of imported WSDLs and XSD files. Required for many enterprise services that split schemas across multiple files.

---

## Priority 2 — Strong UX improvements

### 6. Operation search/filter
A search input above the operation list that filters by operation name or SOAPAction.

### 7. Copy request as cURL
Generate a copyable cURL command with the correct Content-Type, SOAPAction header, and request body. Useful for debugging and sharing.

### 8. Response pretty-printing and collapsible XML tree
Toggle between raw XML and a collapsible tree view (expand/collapse elements).

### 9. Request history
Per-operation history of recent requests/responses (in-memory or localStorage). View previous attempts, compare responses, and re-send a past request.

### 10. Schema/types browser
A collapsible "Types" panel showing all XSD complex types, simple types, and elements. Each type shows its fields, restrictions, and which operations reference it.

---

## Priority 3 — Polish and power-user features

### 11. Multiple WSDL support (spec switcher)
Load multiple WSDLs and switch between them from a dropdown in the top bar.

### 12. Export to Postman/Insomnia collection
Generate a Postman collection JSON from the parsed WSDL, with one request per operation pre-configured.

### 13. Expand/collapse all toggle
Buttons to expand or collapse all endpoint groups and operations at once.

### ~~14. URL query parameter loading (`?url=...`)~~ ✅
Auto-load a WSDL when opened with `?url=https://example.com/service?wsdl`. *(Implemented as part of deep linking.)*

### 15. Keyboard shortcuts
`/` to focus URL input, `Escape` to collapse, arrow keys to navigate operations.

### 16. Dark/light theme toggle
Theme toggle with system preference detection. CSS variables are already structured to support this.
