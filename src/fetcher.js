function loader (file = '') {
  return new Promise((resolve, reject) => {
    const element = document.createElement('audio')

    element.oncanplaythrough = () => resolve(element)

    element.onerror = (e) => {
      const error = `Failed to load ${file}. ${e}`
      this.errors.push(error)
      return reject(error)
    }

    element.onended = event => {
      this.loading = true

      return Promise.all(this.prePromises)
        .then(values => this.handleEnding(event))
        .then(ele => Promise.all(this.postPromises))
        .then(values => {
          this.prePromises = []
          this.postPromises = []
          this.loading = false
        }).catch(e => console.warn(e))
    }

    element.preload = 'auto'
    element.display = 'none'
    element.controls = false
    element.volume = this.volume
    element.src = file

    document.body.prepend(element)
  })
}

module.exports = {
  handlePlay (promise) {
    // if auto-play is disabled, will prompt the user with instructions.
    promise.catch(error =>
      !this.isAutoPlayAllowed(error) && this.createOverlayInstructions())

    return promise && promise.then && this.prePromises.push(promise)
  },

  add (file = '') {
    const exists = !!this.playlist.find(e => e.src === file)

    !exists && loader.bind(this)(file).then(element => {
      this.playlist.push(element)

      if (this.autoStart) {
        this.pause(true)
        this.play(file)
      }
    })

    return !exists
  },

  remove (file = '') {
    const element = this.playlist.find(e => e.src === file)

    function tearDown (resolve) {
      this.playlist = this.playlist.filter(e => e.src !== element.src)
      document.body.removeChild(element)
      if (resolve) return resolve('teared down')
    }

    if (this.isActive(element)) {
      this.addPromise(tearDown.bind(this))
      this.next(element)
    } else tearDown.bind(this)()

    return !!element
  },

  fetchAll () {
    this.loading = true

    return new Promise(resolve => {
      Promise.all(this.files.map(file => loader.bind(this)(file)))
        .then(stack => {
          this.loading = false
          resolve(stack)
        })
    })
  }
}
