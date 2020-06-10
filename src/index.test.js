import AudioSequence from './index'

function mockProperty (event, func) {
  try {
    Object.defineProperty(
      window.HTMLMediaElement.prototype,
      event, {
        get (attr) { return attr },
        set (callback) { return (func || callback)() }
      })
  } catch (e) { } // Expected redefine property error.
}

function commonSetup () {
  ['oncanplaythrough', 'onerror', 'onended'].forEach(e => mockProperty(e))
  const error = Error()
  error.name = 'NotAllowedError'

  Object.defineProperty(global.window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    get () { return () => Promise.reject(error) }
  })

  this.error = error
  this.host = 'http://faketesting-audiosequence.org/'
  this.files = Array(4).slice(1).fill(this.host).map((f, i) => `${f}${i}.mp3`)
  this.player = new AudioSequence({ files: this.files })
}

describe('Testing module main functionalities and units.', function () {
  beforeEach(commonSetup.bind(this))

  test('Test Module default parameters.', () => {
    expect(this.player.files).toEqual(this.files)
    expect(this.player.repeats).toEqual(1)
    expect(this.player.repeatWhole).toEqual(true)
    expect(this.player.repeatEach).toEqual(false)
    expect(this.player.repeatForever).toEqual(false)
    expect(this.player.repeatDelay).toEqual(0)
    expect(this.player.reverseOrder).toEqual(false)
    expect(this.player.shuffleOrder).toEqual(false)
    expect(this.player.volume).toEqual(0.5)
    expect(this.player.autoStart).toEqual(false)
  })

  it('Test loading audio file through loader', () => {
    expect.assertions(1)
    return this.player.loader(this.files[0])
      .then(element => expect(element.src).toEqual(this.files[0]))
  })

  it('Test adding multiple audio files are loaded', () => {
    expect.assertions(3)
    return this.player.load()
      .then(files => {
        expect(files.map(f => f.src)).toEqual(this.files)
        expect(this.player.playlist).toEqual(files)
        expect(this.player.files).toEqual(files.map(f => f.src.replace(window.origin, '')))
      })
  })

  it('Test auto teardown after loading a second time', () => {
    expect.assertions(2)
    return this.player.load()
      .then(files => {
        const elementsLength = document.body.children.length
        const playlistLength = this.player.playlist.length

        this.player.load()
          .then(secondFiles => {
            expect(this.player.playlist.length).toEqual(playlistLength)
            expect(document.body.children.length).toEqual(elementsLength)
          })
      })
  })

  it('Test autoplay policy instructions overlay', () => {
    this.player.autoStart = true

    expect.assertions(1)
    return this.player.load()
      .then(files => expect(document.getElementById('OverLayAutoPlay')).toBeTruthy())
  })

  it('Test adding a new file promise', () => {
    const file = 'http://test.com/1.mp3'

    expect.assertions(1)
    return this.player.add(file)
      .then(element => expect(element.src).toEqual(file))
  })

  it('Test adding already existing file rejection', () => {
    const file = 'http://test.com/1.mp3'

    expect.assertions(1)
    return this.player.add(file)
      .then(e => this.player.add(file)
        .catch(error => expect(error.message).toEqual('File already exists.')))
  })
})
