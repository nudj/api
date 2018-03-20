const fragmentToText = (fragment) => {
  if (!fragment) return ''
  if (fragment.value && !fragment.blocks) return fragment.value.toString()
  if (!fragment.blocks) return ''

  const text = fragment.blocks.map(block => block.text || '')
  return text.join('\n\n')
}

module.exports = fragmentToText
