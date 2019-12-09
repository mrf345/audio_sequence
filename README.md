# audio_sequence (Beta)
### [jQuery][d17250b1] based script that allows you to control, monitor and play multiple audio files in sequences at a time.

  [d17250b1]: https://jquery.com "jquery website"

## [Live Demo][d5c4a4d8]

  [d5c4a4d8]: https://audio-sequence.github.io "Live demo"

![Demo GIF](https://audio-sequence.github.io/audio_sequence.gif)

## Features:
- Repeat whole: allows you to repeat a list of audio files as whole for a given number of repeats
- Repeat each: allows you to repeat each file of list of audio files for a certain number of repeats
- Repeat forever: allows you to repeat a list of audio files as whole forever !
- Repeat delay: allows you to add a delay in-between repeats
- Log: logs music player like interface from the console

## Setup:
#### - From NPM:
```bash
npm install --save audio_sequence
```
```javascript
import AudioSequence from 'audio_sequence'
const player = AudioSequence(
  {
    files: ['1.mp3', '2.mp3', '3.mp3', '4.mp3'],
    repeat_whole: 'true',
    repeats: 5
  }
)
player.log(true)
```

#### - From browser:
```html
<head>
  <script src='https://rawgit.com/mrf345/audio_sequence/master/bin/bundle.js'
  type='text/javascript'></script>
  <script type='text/javascript'>
    const player = AudioSequence({
      files: ['1.mp3', '2.mp3', '4.mp3'],
      repeat_forever: 'true'
    })
  </script>
</head>
```

## Options:
```javascript
options = {
  files: [], // audio files inserted will be stored in
  repeats: 0, // number of repeats to obey with some adjustments later
  repeat_whole: 'true', // repeat all files as whole for the number of repeats
  repeat_each: 'false', // repeat each file for the number of repeats [You can not select both !]
  repeat_forever: 'false', // to keep repeating endlessly, only works on repeat whole
  repeat_delay: 0, // to add a time delay between each repeat in seconds
  reverse_order: 'false', // to reverse the order list of audio files
  shuffle_order: 'false', // to randomly shuffle the order of the files list
  volume: options.volume || 0.5, // to set the default volume > 0 && < 1
  auto_start: 'true', // to auto start playing as the module loads
  cleanup: 'true' // to clean up after existing
}
```

## Useful functions:
#### To use any of the following functions, you have to get an instance of the constructor, which we did in the Setup section :
` const player = AudioSequence()` </br>
` player.following_functions()`

#### - Play list :
```javascript
playlist = function playlist (check) {
  // to log the list of audio elements and their properties
}

log = function log (doornot) {
  // to a live list of the playing elements and quit whenever done playing
}

list = function list (onlyPlaying = false) {
  // to return html ready list of elments
}
```

#### - List order :
```javascript
shuffle = function shuffle () {
  // picking items from the array randomly and reinserting them, to create shuffle like effect
}

reverse = function reverse () {
  // to reverse the order of elements ID list
}
```

#### - Control audio:
- List of typical music player like functions

```javascript
play = function play () {
  // to strart playing elements added to the list
}

replay = function replay () {
  // to restart playing the list
}

stop = function stop () {
    // to stop playing all unended elements
}

pause = function pause () {
  // to pause the currently played element
}

resume = function resume () {
  // to resume the currently paused element
}

previous = function previous () {
  // to move the list of elements backward to play previous element
}

next = function next () {
  // moving the list of elements forward by one element, to play next element
}

forward = function forward (seconds) {
  // to forward the duration of audio element with seconds or portion of it
}

backward = function backward (seconds) {
  // to forward the duration of audio element with seconds or portion of it
}

mute = function mute () {
  // to mute all audio elements
}

unmute = function unmute () {
  // to unmute all audio elements
}

repeat_forever = function repeatForever () {
  // to set repeat_forever and replay
}

```

#### - Manage files:

```javascript
add_file = function addFile (file) {
  // adding an audio file into the playing list
}

remove_file = function removeFile (id) {
  // remove file using ID index number, file index can mismatch but ids do not
}
```

#### - Cleanup and exit:

```javascript
abort = function abort () {
  // make sure all created elements events are off
}

empty = function empty () {
  // to remove created audio elements from the DOM
}

exit = function exit (msg = true) {
  // to gracefully exist, with a thorough cleanup
}
```

## Dependencies:
- jQuery

## Known issues:
- repeat_each while more than one repeat is set, doesn't play well with the music player like functions next(), previous() ...
