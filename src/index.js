import { JSDOM } from 'jsdom'
import { AudioSequence } from './main'

if (JSDOM) {
  global.window = new JSDOM().window
  global.document = global.window.document

  // Workaround JSDOM lacking `HTMLMediaElement` methods
  Object.defineProperty(global.window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    get () {
      setTimeout(() => (this.onloadeddata && this.onloadeddata()))
      return () => {}
    }
  })
}

export default AudioSequence
