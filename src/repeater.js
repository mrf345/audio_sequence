module.exports = {
  each () {
    if (!this.repeatEach) {
      this.repeatWhole = false
      this.repeatEach = true
      return this.load()
    } else return this.whole()
  },

  whole () {
    if (!this.repeatWhole) {
      this.repeatEach = false
      this.repeatWhole = true
      return this.load()
    } else return this.each()
  },

  forever () {
    this.repeatForever = !this.repeatForever
    if (this.hasFiles() && !this.isActive() && this.autoStart) this.play()
  }
}
