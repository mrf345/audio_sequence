<h1 align='center'> audio_sequence </h1>
<h5 align='center'>Front-End utility to ease the process of plying audio elements in sequences.</h5>
<p align='center'>
  <a href='https://travis-ci.org/mrf345/audio_sequence'> <img src='https://travis-ci.org/mrf345/audio_sequence.svg?branch=master' alt='Build Status' /></a>
  <a href='https://coveralls.io/github/mrf345/audio_sequence?branch=master'><img src='https://coveralls.io/repos/github/mrf345/audio_sequence/badge.svg?branch=master' alt='Coverage Status' /></a>
  <a href='https://www.npmjs.com/package/@mrf3/audio_sequence'><img src='https://img.shields.io/npm/v/@mrf3/audio_sequence' /></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>

  <br /><br />
  <img width='60%' src='https://audio-sequence.github.io/audio_sequence.gif' />
</p>

### Install:

##### NPM: to bundle it however you like:
- To install it:
`npm i audio_sequence --save`
- To import it:
```javascript
// ES5
const AudioSequence = require('audio_sequence').default

// ES6
import AudioSequence from 'audio_sequence'
```

##### Browser:
- You can get the latest bundle from [here](https://gitcdn.xyz/repo/mrf345/audio_sequence/master/bin/AudioSequence.min.js)
- To Import it:
```html
<script src="https://gitcdn.xyz/repo/mrf345/audio_sequence/master/bin/AudioSequence.min.js"></script>
<script>
  var Player = new AudioSequence()
</script>
```

### Support:
Should work with anything newer than `Internet Explorer 10` and `NodeJS 12`.

### Usage:
```javascript
var Player = new AudioSequence(
    /**
     * Utility to help import html templates and parse them minimally.
     * @param {object} options contains the module options.
     *
     *`options` = {
     *  files: [], // files inserted will be stored in
     *  repeats: 1, // number of repeats to obey with some adjustments later
     *  repeat_whole: true, // repeat all files as whole
     *  repeat_each: false, // repeat each file for the number of repeats
     *  repeat_forever: false, // to keep repeating endlessly
     *  repeat_delay: 0, // to add a time delay between each repeat
     *  reverse_order: false, // to reverse the order list of audio files
     *  shuffle_order: false, // to randomly shuffle the order of the files list
     *  volume: 0.5, // to set the default volume
     *  auto_start: false, // to auto load and start playing as the module loads
     *  autoplay_warning: true, // to display warning if AutoPlay's disabled
     *  autoplay_message: 'message' // message to show if AutoPlay's disabled
     * 
     *  NOTE: if both `repeat_each` and `repeat_whole` are `true`. In any case
     *        `repeat_each` will always take precedence.
     * }
     */
)

// if the default options work for you out-of-the-box. this should load it:
Player.load()
  .then(function(audios) { console.log(audios) })
  .catch(function(error) { console.warn(error) })
```


### Features:
- Repeat whole: allows you to repeat a list of audio files as whole for a given number of repeats or forever.
- Repeat each: allows you to repeat each file of list of audio files for a certain number of repeats.
- Repeat delay: allows you to add a delay in-between repeats.
- `AutoPlay` policy notification: notify the user with an overlay instructions to how to enable `AutoPlay`.

### Interface:
List of typical music player like methods:


| Method | Input | Output | Description|
|---------|--------|--------|----------|
| `.play(file = '')` | `file`: audio file's link.  | `boolean` | to start playing the added audio files. |
| `.replay()` | N/A | `boolean` | restart playing the added audio files. |
| `.stop()` | N/A | `boolean` | stop playing all added audio files. |
| `.pause()` | N/A | `boolean` | pause the currently playing audio. |
| `.next()` | N/A | `boolean` | play the next file in the playlist. |
| `.previous()` | N/A | `boolean` | play the previous file in the playlist. | 
| `.forward(seconds = 0)` | `seconds`: number of seconds to forward with. | `boolean` | forward the currently playing audio. |
| `.backward(seconds = 0)` | `seconds`: number of seconds to backward with. | `boolean` | backward the currently playing audio. |
| `.mute()` | N/A | `boolean` | mute all audio files. |
| `.unmute(volume = 0.5)` | `volume`: volume to unmute with. | `boolean` | unmute all audio files. |
| `.each()` | N/A | N/A | activate repeat each file for the number of `Player.repeats` mode. |
| `.while()` | N/A | N/A | activate repeat the whole playlist for the number of `Player.repeats` mode. |
| `.forever()` | N/A | N/A | activate forever mode to disregard `Player.repeats` and repeat forever. |
| `.add(file = '')` | `file`: audio file's link. | `Promise()` | load and add file to the playlist. |
| `.remove(file = '')` | `file`: audio file's link. | `boolean` | remove file from the playlist. |
| `.load()` | N/A | `Promise()` | to load `Player.files` manually with a `Promise` that resolves when all files are loaded. |

### Example:
There's a bit old and dated [live example](https://mrf345.github/audio_sequence),
that was created when `JQuery` was a requirement "no longer it is". But it still works and serves the purpose.
