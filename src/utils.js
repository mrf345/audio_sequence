module.exports = {
  choice (array = []) {
    const nextIndex = Math.floor(Math.random() * array.length)

    return { nextIndex, nextItem: array[nextIndex] }
  },

  keepWithin (index = 0, array = []) {
    const nextIndex = index.toString().includes('-')
      ? array.length ? array.length - 1 : 0
      : index > array.length - 1 ? 0 : index

    return { nextIndex, nextItem: array[nextIndex] }
  },

  findFile (file = '') {
    return this.playlist[this.playlist.map(ele => ele.src).indexOf(file)]
  },

  addPromise (callback = Function, pre = false) {
    const promise = new Promise(resolve => callback(resolve))

    this[pre ? 'prePromises' : 'postPromises'].push(promise)
  },

  waitForDOM (callback = Function) {
    return document.readyState === 'complete'
      ? callback()
      : window.addEventListener('DOMContentLoaded', () => callback())
  },

  handleAutoPlayNotAllowed () {
    const audio = document.createElement('audio')
    audio.src = this.silence
    const promise = audio.play()

    promise && promise.catch && promise.catch(error =>
      !this.isAutoPlayEnabled(error) && this.createOverlayInstructions())
  },

  isFirefox () { return !this.isChrome() && window.navigator.userAgent.includes('Firefox') },
  isEdge () { return !this.isChrome() && window.navigator.userAgent.includes('Edge') },
  isOpera () { return !this.isChrome() && window.navigator.userAgent.includes('OPR') },
  isSafari () { return !this.isOpera() && window.navigator.userAgent.includes('Safari') },
  isChrome () {
    return window.navigator.vendor === 'Google Inc.' &&
           window.navigator.userAgent.includes('Chrome') &&
           !window.navigator.userAgent.includes('OPR')
  },

  isAutoPlayEnabled (error) { return !(error.name === 'NotAllowedError') }
}
