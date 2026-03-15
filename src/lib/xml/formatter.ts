export function prettyPrintXml(xml: string, indentSize = 2): string {
  const indent = ' '.repeat(indentSize)
  let depth = 0
  let result = ''

  // Normalize and split into tokens
  const formatted = xml
    .replace(/(>)\s*(<)/g, '$1\n$2')
    .split('\n')

  for (const rawLine of formatted) {
    const line = rawLine.trim()
    if (!line) continue

    // Closing tag or self-closing at start
    if (line.startsWith('</')) {
      depth = Math.max(0, depth - 1)
    }

    result += indent.repeat(depth) + line + '\n'

    // Opening tag (not self-closing, not closing)
    if (line.startsWith('<') && !line.startsWith('</') && !line.startsWith('<?') && !line.endsWith('/>') && !line.includes('</')) {
      depth++
    }
  }

  return result.trimEnd()
}
