module.exports = {
  silence: (
    'data:audio/wave;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0' +
    'BAAAAAAAAABkYXRhAAAAAA=='),

  demoSources () {
    return {
      'https://mrf345.github.io/audiosequence/demos/firefox.gif': this.isFirefox(),
      'https://mrf345.github.io/audiosequence/demos/safari.gif': this.isSafari(),
      'https://mrf345.github.io/audiosequence/demos/chrome.gif': this.isChrome(),
      'https://mrf345.github.io/audiosequence/demos/opera.gif': this.isOpera()
    }
  },

  createOverlayInstructions () {
    // cut circuit if feature's disabled
    if (!this.autoplayWarning) return

    const id = 'OverLayAutoPlay'
    const exists = document.getElementById(id)
    if (exists) document.removeChild(exists)

    const overlay = document.createElement('div')
    const div = document.createElement('div')
    const header = document.createElement('h2')
    const image = document.createElement('img')

    overlay.id = id
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
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'

    header.style.color = 'rgb(255, 255, 255)'
    header.style.fontFamily = 'Georgia, Times, serif'
    header.style.textShadow = '0 0 5px rgba(255,255,255,0.7)'
    header.style.fontSize = '150%'
    header.style.marginBottom = '5%'
    header.style.textAlign = 'center'
    header.innerHTML = this.autoplayMessage

    image.src = Object.keys(this.demoSources()).find(src => !!this.demoSources()[src])
    image.alt = 'How to enable Auto-Play permission.'

    div.appendChild(header)
    div.appendChild(image)
    overlay.appendChild(div)

    this.waitForDOM(() => document.body.appendChild(overlay))
  }
}
