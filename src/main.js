export class AudioSequence {
  /**
   * Utility to ease the process of plying audio elements in sequences.
   * @param {object} options contains the module options.
   */
  constructor (options = {}) {
    const AUTOPLAY_MSG = 'AutoPlay permission is lacking. Enable it then reload:'
    const b = (value, defValue) => value === undefined ? defValue : !!value

    this.files = options.files || [] // files inserted will be stored in
    this.repeats = options.repeats || 1 // number of repeats to obey with some adjustments later
    this.repeatWhole = b(options.repeat_whole, true) // repeat all files as whole
    this.repeatEach = b(options.repeat_each, false) // repeat each file for the number of repeats
    this.repeatForever = b(options.repeat_forever, false) // to keep repeating endlessly
    this.repeatDelay = options.repeat_delay * 1000 || 0 // to add a time delay between each repeat
    this.reverseOrder = b(options.reverse_order, false) // to reverse the order list of audio files
    this.shuffleOrder = b(options.shuffle_order, false) // to randomly shuffle the order of the files list
    this.volume = options.volume || 0.5 // to set the default volume
    this.autoStart = b(options.auto_start, false) // to auto load and start playing as the module loads
    this.autoplayWarning = b(options.autoplay_warning, true) // to display warning if AutoPlay's disabled
    this.autoplayMessage = options.autoplay_message || AUTOPLAY_MSG // message to show if AutoPlay's disabled

    this.playlist = [] // stack of audio elements playing
    this.current = 0 // index of the currently playing
    this.errors = [] // stack of errors encountered in loading
    this.loading = false // indication of all files loaded
    this.repeatCounter = 0 // whole repeats index counter
    this.prePromises = [] // to resolve prior to ending transition
    this.postPromises = [] // to resolve after ending transition
    this.logger = undefined // store the logging interval

    this.hasFiles = () => !!this.playlist.length
    this.hasErrors = () => !!this.errors.length
    this.getCurrent = () => ({ index: this.current, item: this.playlist[this.current] })
    this.getNext = p => this.keepWithin(p ? this.current - 1 : this.current + 1, this.playlist)
    this.isMuted = () => this.hasFiles() && this.getCurrent().item.volume === 0
    this.isPaused = () => this.hasFiles() && this.getCurrent().item.paused
    this.isLast = () => (this.playlist.length - 1) === this.current
    this.notStarted = () => !this.isPaused() && !this.isActive()
    this.getPlace = ele => this.files
      .map(f => f.replace(window.origin, ''))
      .indexOf(ele.src.replace(window.origin, ''))
    this.isActive = item => {
      if (this.hasFiles()) {
        item = item || this.getCurrent().item
        return item && !item.ended && item.currentTime > 0
      } else return false
    }

    this.mixIns = ['utils', 'constants', 'fetcher', 'controller', 'repeater', 'logger']
    this.mixIns.forEach(mixin => Object.assign(this, require(`./mixins/${mixin}`)))

    // if auto-play is disabled, will prompt the user with instructions.
    this.handleAutoPlayNotAllowed()

    // auto start playing audio, or wait for DOM to load.
    if (this.autoStart) this.waitForDOM(this.load.bind(this))
  }

  handleEnding (event) {
    return new Promise(resolve => {
      const element = this.playlist.find(ele => ele.src === event.target.src)
      const eleIndex = this.playlist.indexOf(element)
      const { nextIndex, nextItem } = this.shuffleOrder
        ? this.choice(this.playlist)
        : this.reverseOrder
          ? this.keepWithin(eleIndex - 1, this.playlist)
          : this.keepWithin(eleIndex + 1, this.playlist)

      const zeroAndPlay = (element) => {
        element.volume = this.volume
        element.currentTime = 0

        const promise = (this.repeatEach || this.repeatWhole) && this.repeatDelay
          ? new Promise(resolve => setTimeout(() => resolve(element.play()), this.repeatDelay))
          : element.play()

        return promise && promise.then
          ? promise.then(() => resolve(element))
          : resolve(element)
      }

      const commonNext = () => {
        if (nextItem) {
          this.current = nextIndex
          nextItem.repeats = 1
          return zeroAndPlay(nextItem)
        } else return resolve(element)
      }

      if (this.repeatEach) {
        const repeats = element.repeats || 1

        if (repeats >= this.repeats && !this.repeatForever) {
          element.repeats = 0

          return this.isLast() ? resolve(element) : commonNext()
        } else {
          element.repeats = repeats + 1
          return zeroAndPlay(element)
        }
      } else if (this.repeatWhole) {
        if (this.repeatForever) return commonNext()
        else {
          if (this.repeatCounter >= this.repeats) return resolve(element)
          else {
            if (this.current === (this.playlist.length - 2)) this.repeatCounter += 1
            return commonNext()
          }
        }
      } else {
        if (this.repeatForever || (this.playlist.length - 1) >= this.current) return commonNext()
        else {
          this.current = 0
          return resolve(element)
        }
      }
    })
  }

  tearDown () {
    if (this.isActive() && !this.isPaused()) this.getCurrent().item.pause()
    this.playlist.forEach(e => document.body.removeChild(e))
    this.playlist = []
    this.current = 0
    this.repeatCounter = 0
    this.errors = []
    this.prePromises = []
    this.postPromises = []
  }

  load () {
    if (this.hasFiles()) this.tearDown()
    return new Promise(resolve => {
      this.fetchAll()
        .then(stack => {
          if (stack.length) { // keep original order
            this.playlist = Array(stack.length).fill()
            stack.forEach(ele => { this.playlist[this.getPlace(ele)] = ele })
            this.playlist = this.playlist.filter(ele => !!ele)
          }

          if (this.hasErrors()) this.errors.forEach(error => console.warn(error))
          if (this.autoStart && this.hasFiles()) this.handlePlay(this.getCurrent().item.play())
          resolve(stack)
        })
    })
  }
}
