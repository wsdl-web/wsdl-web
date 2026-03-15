export class XmlParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'XmlParseError'
  }
}

export function parseXml(text: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')
  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new XmlParseError(`Failed to parse XML: ${errorNode.textContent}`)
  }
  return doc
}
