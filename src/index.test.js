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
  self.error = Error()
  self.error.name = 'NotAllowedError'
  window.HTMLMediaElement.prototype.play = () => Promise.reject(self.error)
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
    self.player.autoStart = true

    expect.assertions(1)
    return self.player.load()
      .then(files => expect(document.getElementById('OverLayAutoPlay')).toBeTruthy())
  })

  it('Test adding a new file promise', () => {
    const file = 'http://test.com/1.mp3'

    expect.assertions(1)
    return self.player.add(file)
      .then(element => expect(element.src).toEqual(file))
  })

  it('Test adding already existing file rejection', () => {
    const file = 'http://test.com/1.mp3'

    expect.assertions(1)
    return self.player.add(file)
      .then(e => self.player.add(file)
        .catch(error => expect(error.message).toEqual('File already exists.')))
  })
})
