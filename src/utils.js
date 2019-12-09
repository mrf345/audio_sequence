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

  delay (callback = Function, mSeconds = 1000) {
    return new Promise(resolve => {
      return setTimeout(() => resolve(callback()), mSeconds || this.repeatDelay)
    })
  },

  findFile (file = '') {
    return this.playlist[this.playlist.map(ele => ele.src).indexOf(file)]
  },

  addPromise (callback = Function, pre = false) {
    const promise = new Promise(resolve => callback(resolve))

    this[pre ? 'prePromises' : 'postPromises'].push(promise)
  },

  handleAutoPlayNotAllowed () {
    const audio = document.createElement('audio')
    audio.src = this.silence
    const promise = audio.play()

    promise && promise.catch && promise.catch(error =>
      !this.isAutoPlayEnabled(error) && this.createOverlayInstructions())
  },

  isChrome () { return window.navigator.vendor === 'Google Inc.' && window.navigator.userAgent.includes('Chrome') },
  isFirefox () { return !this.isChrome() && window.navigator.userAgent.includes('Firefox') },
  isSafari () { return !this.isChrome() && window.navigator.userAgent.includes('Safari') },
  isEdge () { return !this.isChrome() && window.navigator.userAgent.includes('Edge') },
  isAutoPlayEnabled (error) { return !(error.name === 'NotAllowedError') }
}
