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

function commonSetup (self) {
  ['oncanplaythrough', 'onerror', 'onended'].forEach(e => mockProperty(e))
  self.host = 'http://faketesting-audiosequence.org/'
  self.files = Array(4).fill(self.host).map((f, i) => `${f}${i}.mp3`)
  self.player = new AudioSequence({ files: self.files })
}

describe('Testing module main functionalities and units.', () => {
  const self = {}
  beforeEach(() => commonSetup(self))

  test('Test Module default parameters.', () => {
    expect(self.player.files).toEqual(self.files)
    expect(self.player.repeats).toEqual(1)
    expect(self.player.repeatWhole).toEqual(true)
    expect(self.player.repeatEach).toEqual(false)
    expect(self.player.repeatForever).toEqual(false)
    expect(self.player.repeatDelay).toEqual(0)
    expect(self.player.reverseOrder).toEqual(false)
    expect(self.player.shuffleOrder).toEqual(false)
    expect(self.player.volume).toEqual(0.5)
    expect(self.player.autoStart).toEqual(false)
  })

  it('Test loading audio file through loader', () => {
    expect.assertions(1)
    return self.player.loader(self.files[0])
      .then(element => expect(element.src).toEqual(self.files[0]))
  })

  it('Test adding multiple audio files are loaded', () => {
    expect.assertions(2)
    return self.player.load()
      .then(files => {
        expect(files.map(f => f.src)).toEqual(self.files)
        expect(self.player.playlist).toEqual(files)
      })
  })

  it('Test auto teardown after loading a second time', () => {
    expect.assertions(2)
    return self.player.load()
      .then(files => {
        const elementsLength = document.body.children.length
        const playlistLength = self.player.playlist.length

        self.player.load()
          .then(secondFiles => {
            expect(self.player.playlist.length).toEqual(playlistLength)
            expect(document.body.children.length).toEqual(elementsLength)
          })
      })
  })

  it('Test autoplay policy instructions overlay', () => {
    const error = Error()
    error.name = 'NotAllowedError'
    window.HTMLMediaElement.prototype.play = () => Promise.reject(error)

    self.player.autoStart = true
    return self.player.load()
      .then(files => expect(document.getElementById('OverLayAutoPlay')).toBeTruthy())
  })
})
