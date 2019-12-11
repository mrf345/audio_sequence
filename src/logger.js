module.exports = {
  list () {
    this.playlist.forEach(ele => console.log(ele.src.split('/').slice(-1)[0], ele))
  },

  getFile (link) { return link.split('/').slice(-1) },
  getHost (link) { return link.split('/').filter(p => p && !p.includes('http'))[0] },

  log () {
    if (this.logger) clearInterval(this.logger)
    else {
      this.logger = setInterval(() => {
        const activeRepeat = this.repeatEach
          ? 'Each' : this.repeatWhole
            ? 'Whole' : this.repeatForever
              ? 'Forever' : 'Standard'

        console.clear()
        this.playlist.forEach(e =>
          console.log(
            `File: ${this.getFile(e.src)} | Host: ${this.getHost(e.src)} | Playing: ` +
            `${this.isActive(e)} | Seconds: ${e.duration.toFixed(2)}/${e.currentTime.toFixed(2)}`
          ))
        console.log(
          `[Repeats: ${activeRepeat}]   [Delay Seconds: ${(this.repeatDelay / 1000).toFixed(2)}]` +
          `   [Paused: ${this.isPaused()}]   [Muted: ${this.isMuted()}]`
        )
      }, this.isFirefox() ? 100 : 1000)
    }
  }
}
