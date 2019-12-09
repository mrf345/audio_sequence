module.exports = {
  createOverlayInstructions () {
    const id = 'OverLayAutoPlay'
    const exists = document.getElementById(id)
    if (exists) document.removeChild(exists)

    const overlay = document.createElement('div')
    const div = document.createElement('div')
    const header = document.createElement('h2')
    const image = document.createElement('img')

    overlay.style.margin = '0%'
    overlay.style.minWidth = '100%'
    overlay.style.minHeight = '100vh'
    overlay.style.zIndex = '0'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.position = 'fixed'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'

    header.style.color = 'rgb(255, 255, 255)'
    header.style.fontFamily = 'Georgia, Times, serif'
    header.style.textShadow = '0 0 20px rgba(255,255,255,0.3)'
    header.style.fontSize = '130%'
    header.style.marginBottom = '5%'

    header.innerHTML = 'Auto-Play permission is not enabled. Enable it then reload:'
    header.style.textAlign = 'center'

    const imageSources = {
      'https://audio-sequence.github.io/firefox.gif': this.isFirefox(),
      'https://audio-sequence.github.io/safari.gif': this.isSafari(),
      'https://audio-sequence.github.io/chrome.gif': this.isChrome(),
      'https://audio-sequence.github.io/edge.gif': this.isEdge()
    }

    image.src = Object.keys(imageSources).find(src => !!imageSources[src])
    image.alt = 'How to enable Auto-Play permission'

    div.appendChild(header)
    div.appendChild(image)
    overlay.appendChild(div)
    document.body.appendChild(overlay)
  }
}
