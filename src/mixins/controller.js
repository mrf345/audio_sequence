module.exports = {
  play (file = '') {
    if (file) {
      if (!this.hasFiles()) return false
      const element = this.findFile(file)
      const index = this.playlist.indexOf(element)

      if (element) {
        this.pause(true)
        this.current = index
        this.handlePlay(element.play())
        return true
      } else return false
    } else {
      const canPlay = this.hasFiles() && (!this.isActive() || this.isPaused())

      if (canPlay) this.handlePlay(this.getCurrent().item.play())
      return canPlay
    }
  },

  replay () {
    const canReplay = this.isActive() || this.isPaused()

    if (canReplay) {
      const { item } = this.getCurrent()

      item.currentTime = 0
      if (this.isPaused()) this.handlePlay(item.play())
    }

    return canReplay
  },

  pause (softStop = false) {
    const canPause = this.isActive() && !this.isPaused()

    if (canPause) {
      const { item } = this.getCurrent()

      item.pause()
      if (softStop) item.currentTime = 0
    }

    return canPause
  },

  stop () {
    const canStop = this.isActive()

    if (canStop) {
      const { item } = this.getCurrent()

      this.pause(true)
      item.currentTime = 0
      this.current = 0
    }

    return canStop
  },

  next (item) {
    const canMove = this.isActive(item) && this.hasFiles()

    if (canMove) {
      if (!item) item = this.getCurrent().item
      item.currentTime = item.duration
    }

    return canMove
  },

  previous () {
    const canMove = this.isActive() && this.hasFiles()

    if (canMove) {
      const { item } = this.getCurrent()
      const { nextIndex, nextItem } = this.getNext(true)
      item.currentTime = 0
      item.pause()
      this.current = nextIndex
      this.handlePlay(nextItem.play())
    }

    return canMove
  },

  forward (seconds = 0) {
    const canForward = this.isActive() || this.isPaused()

    if (canForward) {
      const { item } = this.getCurrent()
      item.currentTime += seconds || (item.duration / 6)
    }

    return canForward
  },

  backward (seconds = 0) {
    const canBackward = this.isActive() || this.isPaused()

    if (canBackward) {
      const { item } = this.getCurrent()
      item.currentTime -= seconds || (item.duration / 6)
    }

    return canBackward
  },

  mute () {
    const notMuted = !this.isMuted() && this.hasFiles()

    if (notMuted) this.playlist.forEach(ele => { ele.volume = 0 })

    return notMuted
  },

  unmute (volume = 0.5) {
    this.playlist.forEach(ele => { ele.volume = volume })

    return this.hasFiles()
  }
}
