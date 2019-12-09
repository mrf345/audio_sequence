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

  isChrome () { return navigator.vendor === 'Google Inc.' && navigator.userAgent.includes('Chrome') },
  isFirefox () { return !this.isChrome() && navigator.userAgent.includes('Firefox') },
  isSafari () { return !this.isChrome() && navigator.userAgent.includes('Safari') },
  isEdge () { return !this.isChrome() && navigator.userAgent.includes('Edge') },
  isAutoPlayAllowed (error) { return !error.name === 'NotAllowedError' }
}
