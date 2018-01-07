/* global $ */ // to avoid linter false alarm
/*

Script : audio_sequence 0.1 beta
Author : Mohamed Feddad
Date : 2017/12/24
Source : https://github.com/mrf345/audio_sequence
License : MPL 2.0
Dependencies : jQuery
Today's lesson: If you've survived callbacks hell, you will survive any other hell. Hopefully

*/

/*

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

 */

// Pythonic extra functions
// you can force a man outta python, but his python will always come out ..
const randint = function randint (digits) {
// to generate a random int of certain range, it takes the length of
// the randint as an arguement
  if (!checkType('number')) throw new TypeError('randint() requires numbers')
  return Math.floor(Math.random() * (10 ** digits))
}
const choice = function choice (list) {
// to chose randomly from an Array
  if (!(list instanceof Array)) throw new TypeError('choice() taskes only Arrays')
  if (list.length <= 0) throw new Error('choice() requires pupliated Array')
  let powerOfLength = Math.floor(list.length / 10)
  if (powerOfLength <= 0) powerOfLength = 1
  return list[Math.floor(Math.random() * (10 * powerOfLength))]
}
const range = function range (to = 1, from = 0) {
// to generate an array of certain range of numbers
  let rangeOfNumbers = []
  for (let i = from; to >= i; i += 1) {
    rangeOfNumbers.push(i)
  }
  return rangeOfNumbers
}

// Validation functions

const checkType = function checkType (type, args) {
  // checking the type of each varible in the passed array
  for (let a in args) {
    if (typeof args[a] !== type) return false
  }
  return true
}
const checkBool = function checkBool (args) {
  // check if passed args are 'true' or 'false' type
  for (let a in args) {
    if (args[a] !== 'true' && args[a] !== 'false') return false
  }
  return true
}
const elementExist = function elementExist (id) {
  // checking if an elment exists in the DOM
  // ! sometimes needed when elements are deleted intentionally !
  if (document.getElementById(id) === null) return false; else return true
}
const trulyPlaying = function trulyPlaying (id) {
  // check if audio element trule playing. To avoide not started yet elements.
  // For thought: If it is indeed truly playing, then equal in truthiness, is its existence !
  if (!elementExist(id)) return false
  if (!document.getElementById(id).ended && !isNaN(document.getElementById(id).duration)) {
    return true
  } else return false
}
const checkFiles = function checkFiles (files = []) {
  // to check if the audio files are loaded and the elements are error free
  for (let i = 0; files.length > i; i += 1) {
    let id = 'TEST' + randint(6)
    $('body').append($('<audio>').attr('src', files[i]).attr('id', id))
    setTimeout(function () {
      if (elementExist(id)) {
        if (document.getElementById(id).error !== null) {
          this.exit(false)
          throw new Error('audio_sequence(options=[files]) invalid or unavailable file : ' + document.getElementById(id).src)
        }
        $('#' + id).remove()
      }
    }, 10) // time out is needed to get the right response after the files are fully loaded
  }
}

// the bread and butter

const AudioSequence = function AS (options) {
  // main class where all the black magic does not happen yet
  if (typeof options !== 'object') options = {}
  this.options = {
    files: options.files || [], // files inserted will be stored in
    repeats: options.repeats || 1, // number of repeats to obay with some adjustments later
    repeat_whole: options.repeat_whole || 'false', // repeat all files as whole for the number of repeats
    repeat_each: options.repeat_each || 'true', // repeat each file for the number of repeats [You can not select both !]
    repeat_forever: options.repeat_forever || 'false', // to keep repeating endlessly, only works on repeat whole
    repeat_delay: options.repeat_delay * 1000 || 0, // to add a time delay between each repeat
    reverse_order: options.reverse_order || 'false', // to reverse the order list of audio files
    shuffle_order: options.shuffle_order || 'false', // to randomly shuffle the order of the files list
    volume: options.volume || 0.5, // to set the default volume
    auto_start: options.auto_start || 'true', // to auto start playing as the module loads
    cleanup: options.cleanup || 'true' // to clean up after existing
  }

  // fixing repeats : repeats for repeat_whole requires +1
  if (this.options.repeat_whole === 'true' && this.options.repeats <= 0) {
    this.options.repeats = 1
  }

  const timeouts = function (timeout) { this.defaults.timeouts.push(timeout) } // global timeout to store into the local
  this.defaults = {
    elementsID: [],  // Array to store elements ids
    permID: [], // a clone of elmentsID
    timeouts: [], // to store repeaters, .back() and .next() timeouts, to clear them out whenever needed
    currentCounter: 0, // to keep watch over repeaters counter and use in .back() .next()
    logged: 'none', // to keep watch over .log() status
    mute: false, // indeicator to use in .list()
    paused: 'none', // to store the paused element or status
    store: false, // to store currently playing if 0 repeats
    ended: false // to indecate when playlist is ended
  }

// Core functions

  this.__init__ = function __init__ (repl = false) {
    if (!window.jQuery) throw new Error('This script depends fully on jquery, go get it') // early jQuery check

    // type validation
    if (!checkBool([
      this.options.repeat_whole,
      this.options.repeat_each,
      this.options.repeat_forever,
      this.options.reverse_order,
      this.options.shuffle_order,
      this.options.auto_start,
      this.options.cleanup
    ])) throw new TypeError('audio_sequence(options) requires "true" or "false"')
    if (!checkType('number', [this.options.repeats,
      this.options.repeat_delay,
      this.options.volume])) throw new TypeError('audio_sequence(options) repeats, delay and volume require number')
    if (!(this.options.files instanceof Array)) throw new TypeError('audio_sequence(options) files requires Array')

    // value validation
    let c; for (let n in c = [
      this.options.repeats,
      this.options.repeat_delay]
    ) { if (c[n] < 0) throw new Error('audio_sequence(options) repeats and delay require number bigger or equal to 0') }
    if (this.options.auto_start === 'true' && this.options.files.length <= 0
  ) throw new Error('audio_sequence(options=[files]) requires at least one audio file to if auto_start is "true"')
    if (this.options.volume > 1 || this.options.volume < 0) throw new Error('audio_sequence(options) volume must be float between 0, 1')
    this.apply = function apply () {
      checkFiles(this.options.files) // files validity
      // apply options and redirections
      this.random_elements() // creates random audio elements accourding to this.options.files
      if (this.options.reverse_order === 'true') this.reverse()
      if (this.options.shuffle_order === 'true') this.shuffle()
      if (this.options.auto_start === 'true') {
        if (this.options.repeat_each === 'true' || this.options.repeats === 5) this.each_repeater()
        if (this.options.repeat_whole === 'true') this.whole_repeater()
      }
    }
    if (repl) { // escape event, if it is a relpay
      this.apply()
    } else {
      window.addEventListener('load', function () {
        this.apply()
      })
    }
  }

  this.each_repeater = function eachRepeater (
    // to repeat each file of the list for a number of rpeats
    // HEADS UP callbacks hell black magic ahead
    repeats = this.options.repeats,
    ffs = this.defaults.elementsID,
    counter = 0,
    delay = this.options.repeat_delay) {
    this.defaults.ended = false
    this.defaults.store = false
    const elementID = ffs[0]
    this.defaults.store = ffs[0]
    ffs.splice(0, 1)
    const elementJquery = $('#' + elementID).first() // geting jQuery selection of our element id
    if (elementJquery.length > 0) { // make sure there are elements
      document.getElementById(elementID).volume = this.options.volume
      if (counter === 0) document.getElementById(elementID).play(); counter += 1 // to establesh ended event
      elementJquery.on('ended', function () { // main event that chains elements ending to each other properly
        if (repeats > counter) document.getElementById(elementID).play() // making sure to play it once if repeat is 1
        counter += 1
        if (counter >= repeats) { // if the repeats for each is due
          // adjusting duration if repeats for each is 1
          if (repeats === 1) var timing = 0; else timing = document.getElementById(elementID).duration.toFixed(3) * 1000
          // recursing this function with a time out of the audio duration
          timeouts(setTimeout(function () { this.each_repeater(repeats, ffs, 0) }, timing + delay))
          elementJquery.off('ended') // removing the current ended event listener
        }
      })
    } else {
      this.abort()
      if (this.options.cleanup === 'true') this.exit(false)
      if (this.options.repeat_forever === 'true') this.replay() // adding replay option to repeat each
    } // make sure all created elements events are off and element removed
  }

  this.whole_repeater = function wholeRepeater (counter = 0, delay = this.options.repeat_delay) {
    // To repeat the whole list of files for a number of repeats
    // HEADS UP callbacks hell black magic ahead
    // to set up an infinite loop, will keep increasing the repeats as it goes
    this.defaults.ended = false
    this.defaults.store = false
    this.defaults.currentCounter = counter
    if (this.options.repeat_forever === 'true') this.options.repeats += 1
    const elementID = this.defaults.elementsID[0]
    this.defaults.elementsID.push(this.defaults.elementsID.slice(0, 1)[0])
    // attaching cuurent element to the end of array, so will not run out of elements regardless of repeats
    this.defaults.elementsID.splice(0, 1)
    if (this.options.repeats > Math.floor(counter / this.defaults.permID.length)) { // deviding the sum of counter on the number of elements to get proper counter
      document.getElementById(elementID).volume = this.options.volume
      document.getElementById(elementID).play() // to play and establish ended event
      $('#' + elementID).first().on('ended', function () { // main event that chains elements ending to each other properly
        timeouts(setTimeout(function () { wholeRepeater(counter + 1, delay) }, delay)) // recursion bond to the end with time out of repeat_delay
        $('#' + elementID).first().off('ended') // removing the current ended event listener
      })
    } else { this.abort(); if (this.options.cleanup === 'true') this.exit(false) } // make sure all created elements events are off and element removed
  }

// Controling arrays and elements

  this.random_elements = function randomElements () {
    // to create audio elements to the number of audio files inserted with a random id
    for (let i = 0; this.options.files.length > i; i += 1) {
      while (true) { // making sure ID not exist already
        let id = 'AS' + randint(10) // random id
        let element = $('<audio>').attr('id', id).attr('src', this.options.files[i]) // setting the attributes
        if (this.defaults.elementsID.indexOf(id) === -1) {
          this.defaults.elementsID.push(id) // pushing to the main elements list
          this.defaults.permID.push(id) // pushing to its clone
          $('body').append(element)
          break
        }
      }
    }
  }

  this.shuffle = function shuffle () {
    // picking items from the array randomly and reinserting them, to create shuffle like effect
    for (let _ in range(randint(1))) { // number of pickings chosen randomly too
      var i = this.defaults.elementsID.indexOf(choice(this.defaults.elementsID))
      this.defaults.elementsID.push(this.defaults.elementsID[i])
      this.defaults.elementsID.splice(i, 1) // removing the reincerted item
    }
    this.defaults.permID = this.defaults.elementsID // reseting the clone to the new ordered array
  }

  this.reverse = function reverse () {
    // to reverse the order of elements ID list
    this.defaults.elementsID.reverse()
  }

// Listing and logging

  this.playlist = function playlist (check) {
    // to log the list of audio elements and their properties
    if (check) if (elementExist(this.defaults.elementsID[0])) return true; else return false
    // to check if elements are not deleted while logging
    if (elementExist(this.defaults.elementsID[0])) {
      $.each(this.defaults.elementsID, function (_, v) {
        if (elementExist(v)) {
          if (document.getElementById(v).currentTime.toFixed(2) === '0.00') {
            var playing = 'false'
          } else playing = !document.getElementById(v).ended
          console.log(_ + '.  ID: ' + v + ' | File: ' + $('#' + v).attr('src'
        ) + ' | Now playing: ' + playing + ' | Seconds: ' + document.getElementById(
          v).duration.toFixed(2) + ':' + document.getElementById(v).currentTime.toFixed(2))
        } else console.log('( None existing element )')
      })
      if (this.options.repeat_forever === 'true') var repeating = 'forever'; else repeating = this.options.repeats
      if (this.defaults.paused === 'none') var pauseit = false; else pauseit = true
      console.log('[Repeats : ' + repeating + ']   ' +
       '[Delay seconds: ' + this.options.repeat_delay / 1000 + ']   ' +
        '[Paused: ' + pauseit + ']' + '   [Mute: ' + this.defaults.mute + ']')
    } else return 'Playing finished already !'
  }

  this.log = function log (doornot) {
    // to a live list of the playing elements and quit whenever done playing
    if (doornot === true && this.defaults.logged === 'none') { // true will start the logger
      this.defaults.logged = setInterval(function () {
        console.clear()
        if (this.playlist(true)) this.playlist(); else { // check if playing schdual has ended
          clearInterval(this.defaults.logged) // remove this loggin interval
          this.defaults.logged = 'none'
          return 'Finished playing !'
        }
      }, 100)
    } else if (doornot === false && this.defaults.logged !== 'none') { // false will stop the logger
      clearInterval(this.defaults.logged)
      return 'logging stopped'
    } else return '.log(true|false) to start or stop live logging'
  }

  this.list = function list (onlyPlaying = false) {
    // to return html ready list of elments
    const theList = []
    $.each(this.defaults.elementsID, function (number, value) {
      if (onlyPlaying && trulyPlaying(value)) {
        theList[number] = document.getElementById(value)
      } else if (elementExist(value)) theList[number] = document.getElementById(value)
    })
    return theList
  }

  this.any_playing = function anyPlaying () {
    // to check if any element is playing currently
    let sta = false
    $.each(this.defaults.permID, function (num, value) {
      if (trulyPlaying(value)) sta = true
    })
    return sta
  }

// Monitoring and controlling audio

  this.play = function play () {
    // to strart playing elements added to the list
    if (this.defaults.elementsID.length !== 0 && this.defaults.ended) {
      if (this.options.repeat_each === 'true' || this.options.repeats === 1) {
        this.each_repeater()
      } else this.whole_repeater()
    }
  }

  this.replay = function replay () {
    this.exit(false) // cleans up everything first
    this.__init__(true) // lets not reinvent the wheel !
  }

  this.stop = function stop () {
    // to stop playing all unended elements
    this.abort() // to remove all ended events
    $.each(this.defaults.permID, function (number, value) {
      if (trulyPlaying(value)) {
        document.getElementById(value).currentTime = document.getElementById(value).duration // stopping
      }
    })
    this.defaults.ended = true
  }

  this.pause = function pause () {
    // to pause the currentlly played element
    for (let i in this.defaults.permID) {
      if (trulyPlaying(this.defaults.permID[i])) {
        document.getElementById(this.defaults.permID[i]).pause()
        this.defaults.paused = this.defaults.permID[i]
        return true
      }
    }
  }

  this.resume = function resume () {
    // to resume the currentlly paused element
    if (this.defaults.paused !== 'none') {
      for (let i in this.defaults.permID) {
        if (trulyPlaying(this.defaults.permID[i])) {
          document.getElementById(this.defaults.permID[i]).pause()
          break
        }
      }
      document.getElementById(this.defaults.paused).play()
      this.defaults.paused = 'none'
      return true
    } else return false
  }

  this.previous = function previous () {
    // to move the lis of elements backward to play previous element
    for (let t in this.defaults.timeouts) { clearTimeout(t) }
    this.defaults.timeouts.splice(0, this.defaults.timeouts.length)
    this.abort() // clean up ended events
    this.stop() // stop all playing
    if (this.options.repeat_each === 'true') { // different array manipulation for each_repeater and whole_repeater
      this.defaults.elementsID = [].concat(
        this.defaults.permID.slice( // getting the missing elements with slice and concating them to the beginning of our array
          this.defaults.permID.length - this.defaults.elementsID.length - 2, // -2 , -1 for each since index != length
          this.defaults.permID.length - this.defaults.elementsID.length), // the number of elements to slice
          this.defaults.elementsID)
      timeouts(setTimeout(function () {
        this.each_repeater()
      }, 10 * this.defaults.permID.length))
    } else {
      this.defaults.elementsID.unshift(this.defaults.elementsID.pop())
      this.defaults.elementsID.unshift(this.defaults.elementsID.pop())
      timeouts(setTimeout(function () { // faced some strange callbacks issue here, probabely due to the cleanup functions
        this.whole_repeater(this.defaults.currentCounter, this.options.repeat_delay) // having to loop which takes time !
      }, 10 * this.defaults.elementsID.length)) // timing it out is needed to avoide another callbacks hell !
    }
  }

  this.next = function next () {
    // moving the list of elements forward by one element, to play next element
    for (let t in timeouts) { clearTimeout(t) } // clear all registered timeouts
    this.defaults.timeouts.splice(0, this.defaults.timeouts.length) // remove all stored timeouts
    this.abort() // clean up ended events
    this.stop() // stop all playing
    if (this.options.repeat_each === 'true') { // reserve one element if it reached to the end
      if (this.defaults.elementsID.length === 0) this.defaults.elementsID.unshift(this.defaults.permID.slice(-1)[0])
      this.each_repeater() // it will advance itself
    } else {
      this.defaults.elementsID.unshift(this.defaults.elementsID.pop()) // from the bottom to the top, now we here
      this.whole_repeater(this.defaults.currentCounter, this.options.repeat_delay) // recalling the repeater
    }
  }

  this.forward = function forward (seconds) {
    // to forward the duration of audio element with seconds or portion of it
    $.each(this.defaults.permID, function (number, value) {
      if (trulyPlaying(value)) {
        if (!seconds) seconds = Math.round(document.getElementById(value).duration / 6)
        else if (typeof seconds !== 'number') throw new TypeError('forward(seconds) takes number or empty')
        document.getElementById(value).currentTime += seconds
      }
    })
  }

  this.backward = function backward (seconds) {
    // to forward the duration of audio element with seconds or portion of it
    $.each(this.defaults.permID, function (number, value) {
      if (trulyPlaying(value)) {
        if (!seconds) seconds = Math.round(document.getElementById(value).duration / 6)
        else if (typeof seconds !== 'number') throw new TypeError('backward(seconds) takes number or empty')
        document.getElementById(value).currentTime -= seconds
      }
    })
  }

  this.mute = function mute () {
    // to mute all audio elements
    $.each(this.defaults.permID, function (number, value) {
      if (elementExist(value)) {
        if (document.getElementById(value).volume !== 0) document.getElementById(value).volume = '0'
      }
    })
    this.defaults.mute = true
  }

  this.unmute = function unmute (vol = this.options.volume) {
    // to unmute all audio elements
    $.each(this.defaults.permID, function (number, value) {
      if (elementExist(value)) {
        if (document.getElementById(value).volume === 0) document.getElementById(value).volume = vol
      }
    })
    this.defaults.mute = false
  }

  this.repeat_forever = function repeatForever () {
    // to set repeat_forever and replay
    this.options.repeat_forever = 'true'
    this.replay()
  }

// Managing files

  this.add_file = function addFile (file) {
    // adding an audio file into the playing lis
    checkFiles([file])
    while (true) {
      let id = 'AS' + randint(10) // random id
      if (this.defaults.elementsID.indexOf(id) === -1) {
        this.defaults.elementsID.push(id) // pushing to the main elements list
        this.defaults.permID.push(id) // pushing to its clone
        $('body').append($('<audio>').attr('id', id).attr('src', file))
        break
      }
    }
  }

  this.remove_file = function removeFile (id) {
    // remove file using ID index number, file nASes can mismatch but ids not
    if (this.defaults.elementsID[id] !== 'undefined') {
      this.defaults.elementsID.splice(id, 1)
      this.defaults.permID.splice(
        this.defaults.permID.indexOf(this.defaults.permID[id]), 1)
      return true
    } else return false
  }

// Cleanup and exit

  this.clean_random_elements = function cleanRandomElements () {
    // to clean up previous elements in case of a replay
    this.defaults.elementsID.splice(0, this.defaults.elementsID.length)
    this.defaults.permID.splice(0, this.defaults.permID.length)
  }

  this.abort = function abort () {
    // make sure all created elements events are off
    this.defaults.ended = true
    $.each(this.defaults.permID, function (_, v) { $('#' + v).off('ended') })
  }

  this.empty = function empty () {
    // to remove created audio elements from the DOM
    $.each(this.defaults.permID, function (_, v) { $('#' + v).remove() })
  }

  this.exit = function exit (msg = true) {
    // to gracefully exist, with a thorough cleanup
    for (let t in this.defaults.timeouts) { clearTimeout(t) }
    this.abort()
    this.stop()
    this.clean_random_elements()
    this.empty()
    this.defaults.ended = true
    if (msg) setTimeout(function () { console.log('audio_sequence exited. till next time !') }, 50)
  }

  // setting up with init and return the class
  this.__init__()
  return this
}
