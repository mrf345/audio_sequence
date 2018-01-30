import $ from 'jquery'
import F from './exFunctions.js'
import { createUniqueAudio, promiseAudio, Store } from './AudioLoader'

/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
// the bread and butter
export default function AudioSequence (options) {
  const toreturn = {} // instead of this, to return this properties

  if (typeof options !== 'object') options = {}
  toreturn.options = {
    files: options.files || [], // files inserted will be stored in
    repeats: options.repeats || 1, // number of repeats to obay with some adjustments later
    repeat_whole: options.repeat_whole || 'false', // repeat all files as whole for the number of repeats
    repeat_each: options.repeat_each || 'false', // repeat each file for the number of repeats [You can not select both !]
    repeat_forever: options.repeat_forever || 'false', // to keep repeating endlessly, only works on repeat whole
    repeat_delay: options.repeat_delay * 1000 || 0, // to add a time delay between each repeat
    reverse_order: options.reverse_order || 'false', // to reverse the order list of audio files
    shuffle_order: options.shuffle_order || 'false', // to randomly shuffle the order of the files list
    volume: options.volume || 0.5, // to set the default volume
    auto_start: options.auto_start || 'true', // to auto start playing as the module loads
    cleanup: options.cleanup || 'true' // to clean up after existing
  }

  // fixing repeats : repeats for repeat_whole requires +1
  if (toreturn.options.repeat_whole === 'true' && toreturn.options.repeats <= 0) {
    toreturn.options.repeats = 1
  }

  toreturn.defaults = {
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

  const __init__ = function __init__ (repl = false) {
    if (!$) throw new Error('This script depends fully on jquery, go get it') // early jQuery check
    // type validation
    if (!F.checkBool([
      toreturn.options.repeat_whole,
      toreturn.options.repeat_each,
      toreturn.options.repeat_forever,
      toreturn.options.reverse_order,
      toreturn.options.shuffle_order,
      toreturn.options.auto_start,
      toreturn.options.cleanup
    ])) throw new TypeError('audio_sequence(options) requires "true" or "false"')
    if (!F.checkType('number', [toreturn.options.repeats,
      toreturn.options.repeat_delay,
      toreturn.options.volume])) throw new TypeError('audio_sequence(options) repeats, delay and volume require number')
    if (!(toreturn.options.files instanceof Array)) throw new TypeError('audio_sequence(options) files requires Array')

    // value validation
    let c; for (let n in c = [
      toreturn.options.repeats,
      toreturn.options.repeat_delay]
    ) { if (c[n] < 0) throw new Error('audio_sequence(options) repeats and delay require number bigger or equal to 0') }
    if (toreturn.options.auto_start === 'true' && toreturn.options.files.length <= 0
  ) throw new Error('audio_sequence(options=[files]) requires at least one audio file to if auto_start is "true"')
    if (toreturn.options.volume > 1 || toreturn.options.volume < 0) throw new Error('audio_sequence(options) volume must be float between 0, 1')
    var apply = function apply () {
      // F.checkFiles(toreturn.options.files) // files validity
      // apply options and redirections
      // randomElements() // creates random audio elements accourding to toreturn.options.files
      Promise.all( // creating testing and creating unique audio elements
        toreturn.options.files.map((u) => promiseAudio(u))
      ).then((items) => {
        items.map((item) => createUniqueAudio(item)).forEach(id => {
          toreturn.defaults.elementsID.push(id)
          toreturn.defaults.permID.push(id)
        })
        if (toreturn.options.reverse_order === 'true') toreturn.reverse()
        if (toreturn.options.shuffle_order === 'true') toreturn.shuffle()
        if (toreturn.options.auto_start === 'true') {
          if (toreturn.options.repeat_whole === 'true' || toreturn.options.repeats === 1) toreturn.whole_repeater()
          else if (toreturn.options.repeat_each === 'true') toreturn.each_repeater()
        }
      })
    }
    if (repl) { // escape event, if it is a relpay
      apply()
    } else {
      window.addEventListener('load', function () {
        apply()
      })
    }
  }

  toreturn.each_repeater = function eachRepeater (
    // to repeat each file of the list for a number of rpeats
    // HEADS UP callbacks hell black magic ahead
    repeats = toreturn.options.repeats,
    ffs = toreturn.defaults.elementsID,
    counter = 0,
    delay = toreturn.options.repeat_delay) {
    toreturn.defaults.ended = false
    toreturn.defaults.store = false
    const elementID = ffs[0]
    toreturn.defaults.store = ffs[0]
    ffs.splice(0, 1)
    const element = document.getElementById(elementID)
    if (element !== null) { // make sure there are elements
      element.volume = toreturn.options.volume
      if (counter === 0) document.getElementById(elementID).play(); counter += 1 // to establesh ended event
      $('#' + elementID).first().on('ended', (e) => { // main event that chains elements ending to each other properly
        if (repeats > counter) element.play() // making sure to play it once if repeat is 1
        counter += 1
        if (counter >= repeats) { // if the repeats for each is due
          // adjusting duration if repeats for each is 1
          if (repeats === 1) var timing = 0; else timing = element.duration.toFixed(3) * 1000
          // recursing this function with a time out of the audio duration
          toreturn.defaults.timeouts.push(
            setTimeout(function () { toreturn.each_repeater(repeats, ffs, 0) }, timing + delay)
          )
          $('#' + elementID).off('ended')
        }
      })
    } else {
      toreturn.abort()
      if (toreturn.options.cleanup === 'true') toreturn.exit(false)
      if (toreturn.options.repeat_forever === 'true') toreturn.replay() // adding replay option to repeat each
    } // make sure all created elements events are off and element removed
  }

  toreturn.whole_repeater = function wholeRepeater (counter = 0, delay = toreturn.options.repeat_delay) {
    // To repeat the whole list of files for a number of repeats
    // HEADS UP callbacks hell black magic ahead
    // to set up an infinite loop, will keep increasing the repeats as it goes
    toreturn.defaults.ended = false
    toreturn.defaults.store = false
    toreturn.defaults.currentCounter = counter
    if (toreturn.options.repeat_forever === 'true') toreturn.options.repeats += 1
    const elementID = toreturn.defaults.elementsID[0]
    const element = document.getElementById(elementID)
    toreturn.defaults.elementsID.push(toreturn.defaults.elementsID.slice(0, 1)[0])
    // attaching cuurent element to the end of array, so will not run out of elements regardless of repeats
    toreturn.defaults.elementsID.splice(0, 1)
    if (toreturn.options.repeats > Math.floor(counter / toreturn.defaults.permID.length)) { // deviding the sum of counter on the number of elements to get proper counter
      element.volume = toreturn.options.volume
      element.play() // to play and establish ended event
      // element.addEventListener('ended', doEvent) // main event that chains elements ending to each other properly
      $('#' + elementID).first().on('ended', function () {
        toreturn.defaults.timeouts.push(
          setTimeout(function () { wholeRepeater(counter + 1, delay) }, delay) // recursion bond to the end with time out of repeat_delay
        )
        $('#' + elementID).off('ended')
      })
    } else { toreturn.abort(); if (toreturn.options.cleanup === 'true') toreturn.exit(false) } // 11make sure all created elements events are off and element removed
  }

// Controling arrays and elements

  toreturn.shuffle = function shuffle () {
    // picking items from the array randomly and reinserting them, to create shuffle like effect
    F.range(Store.randint(1)).map(() => { // number of pickings chosen randomly too
      var i = toreturn.defaults.elementsID.indexOf(Store.choice(toreturn.defaults.elementsID))
      toreturn.defaults.elementsID.push(toreturn.defaults.elementsID[i])
      toreturn.defaults.elementsID.splice(i, 1) // removing the reincerted item
    })
    toreturn.defaults.permID = toreturn.defaults.elementsID // reseting the clone to the new ordered array
  }

  toreturn.reverse = function reverse () {
    // to reverse the order of elements ID list
    toreturn.defaults.elementsID.reverse()
  }

// Listing and logging

  toreturn.playlist = function playlist (check) {
    let repeating, pauseit
    // to log the list of audio elements and their properties
    if (check) {
      if (F.elementExist(toreturn.defaults.elementsID[0])) return true
      else return false
    }
    // to check if elements are not deleted while logging
    if (F.elementExist(toreturn.defaults.elementsID[0])) {
      $.each(toreturn.defaults.elementsID, function (_, v) {
        if (F.elementExist(v)) {
          if (document.getElementById(v).currentTime.toFixed(2) === '0.00') {
            var playing = 'false'
          } else playing = !document.getElementById(v).ended
          console.log(_ + '.  ID: ' + v + ' | File: ' + $('#' + v).attr('src'
        ) + ' | Now playing: ' + playing + ' | Seconds: ' + document.getElementById(
          v).duration.toFixed(2) + ':' + document.getElementById(v).currentTime.toFixed(2))
        } else console.log('( None existing element )')
      })
      toreturn.options.repeat_forever === 'true' ? repeating = 'forever' : repeating = toreturn.options.repeats
      toreturn.defaults.paused === 'none' ? pauseit = false : pauseit = true
      console.log('[Repeats : ' + repeating + ']   ' +
       '[Delay seconds: ' + toreturn.options.repeat_delay / 1000 + ']   ' +
        '[Paused: ' + pauseit + ']' + '   [Mute: ' + toreturn.defaults.mute + ']')
    } else return 'Playing finished already !'
  }

  toreturn.log = function log (doornot) {
    // to a live list of the playing elements and quit whenever done playing
    if (doornot === true && toreturn.defaults.logged === 'none') { // true will start the logger
      toreturn.defaults.logged = setInterval(function () {
        console.clear()
        if (toreturn.playlist(true)) toreturn.playlist(); else { // check if playing schdual has ended
          clearInterval(toreturn.defaults.logged) // remove this loggin interval
          toreturn.defaults.logged = 'none'
          return 'Finished playing !'
        }
      }, 100)
    } else if (doornot === false && toreturn.defaults.logged !== 'none') { // false will stop the logger
      clearInterval(toreturn.defaults.logged)
      return 'logging stopped'
    } else return '.log(true|false) to start or stop live logging'
  }

  toreturn.list = function list (onlyPlaying = false) {
    // to return html ready list of elments
    const theList = []
    $.each(toreturn.defaults.elementsID, function (number, value) {
      if (F.onlyPlaying && F.trulyPlaying(value)) {
        theList[number] = document.getElementById(value)
      } else if (F.elementExist(value)) theList[number] = document.getElementById(value)
    })
    return theList
  }

  toreturn.any_playing = function anyPlaying () {
    // to check if any element is playing currently
    let sta = false
    $.each(toreturn.defaults.permID, function (num, value) {
      if (F.trulyPlaying(value)) sta = true
    })
    return sta
  }

// Monitoring and controlling audio

  toreturn.play = function play () {
    // to strart playing elements added to the list
    if (toreturn.defaults.elementsID.length !== 0 && toreturn.defaults.ended) {
      if (toreturn.options.repeat_each === 'true') toreturn.each_repeater()
      else toreturn.whole_repeater()
    }
  }

  toreturn.replay = function replay () {
    toreturn.exit(false, false) // cleans up everything first
    // __init__(true) // lets not reinvent the wheel !
    toreturn.defaults.elementsID.splice(0, toreturn.defaults.elementsID.length)
    toreturn.defaults.permID.forEach(id => toreturn.defaults.elementsID.push(id))
    if (toreturn.options.repeat_whole === 'true' || toreturn.options.repeats === 1) toreturn.whole_repeater()
    else toreturn.each_repeater()
  }

  toreturn.stop = function stop () {
    // to stop playing all unended elements
    toreturn.abort() // to remove all ended events
    $.each(toreturn.defaults.permID, function (number, value) {
      if (F.trulyPlaying(value)) {
        document.getElementById(value).currentTime = document.getElementById(value).duration // stopping
      }
    })
    toreturn.defaults.ended = true
  }

  toreturn.pause = function pause () {
    // to pause the currentlly played element
    for (let i in toreturn.defaults.permID) {
      if (F.trulyPlaying(toreturn.defaults.permID[i])) {
        document.getElementById(toreturn.defaults.permID[i]).pause()
        toreturn.defaults.paused = toreturn.defaults.permID[i]
        return true
      }
    }
  }

  toreturn.resume = function resume () {
    // to resume the currentlly paused element
    if (toreturn.defaults.paused !== 'none') {
      for (let i in toreturn.defaults.permID) {
        if (F.trulyPlaying(toreturn.defaults.permID[i])) {
          document.getElementById(toreturn.defaults.permID[i]).pause()
          break
        }
      }
      document.getElementById(toreturn.defaults.paused).play()
      toreturn.defaults.paused = 'none'
      return true
    } else return false
  }

  toreturn.previous = function previous () {
    // to move the lis of elements backward to play previous element
    for (let t in toreturn.defaults.timeouts) { clearTimeout(t) }
    toreturn.defaults.timeouts.splice(0, toreturn.defaults.timeouts.length)
    toreturn.abort() // clean up ended events
    toreturn.stop() // stop all playing
    if (toreturn.options.repeat_each === 'true') {
       // different array manipulation for each_repeater and whole_repeater
      toreturn.defaults.elementsID = [].concat(
        toreturn.defaults.permID.slice( // getting the missing elements with slice and concating them to the beginning of our array
          toreturn.defaults.permID.length - toreturn.defaults.elementsID.length - 2, // -2 , -1 for each since index != length
          toreturn.defaults.permID.length - toreturn.defaults.elementsID.length), // the number of elements to slice
          toreturn.defaults.elementsID)
      toreturn.defaults.timeouts.push(
        setTimeout(function () {
          toreturn.each_repeater()
        }, 10 * toreturn.defaults.permID.length)
      )
    } else {
      toreturn.defaults.elementsID.unshift(toreturn.defaults.elementsID.pop())
      toreturn.defaults.elementsID.unshift(toreturn.defaults.elementsID.pop())
      toreturn.defaults.timeouts.push(
        setTimeout(function () { // faced some strange callbacks issue here, probabely due to the cleanup functions
          toreturn.whole_repeater(toreturn.defaults.currentCounter, toreturn.options.repeat_delay) // having to loop which takes time !
        }, 10 * toreturn.defaults.elementsID.length) // timing it out is needed to avoide another callbacks hell !
      )
    }
  }

  toreturn.next = function next () {
    // moving the list of elements forward by one element, to play next element
    for (let t in toreturn.defaults.timeouts) { clearTimeout(t) } // clear all registered timeouts
    toreturn.defaults.timeouts.splice(0, toreturn.defaults.timeouts.length) // remove all stored timeouts
    toreturn.abort() // clean up ended events
    toreturn.stop() // stop all playing
    if (toreturn.options.repeat_each === 'true') { // reserve one element if it reached to the end
      if (toreturn.defaults.elementsID.length === 0) toreturn.defaults.elementsID.unshift(toreturn.defaults.permID.slice(-1)[0])
      toreturn.each_repeater() // it will advance itself
    } else {
      toreturn.defaults.elementsID.unshift(toreturn.defaults.elementsID.pop()) // from the bottom to the top, now we here
      toreturn.whole_repeater(toreturn.defaults.currentCounter, toreturn.options.repeat_delay) // recalling the repeater
    }
  }

  toreturn.forward = function forward (seconds) {
    // to forward the duration of audio element with seconds or portion of it
    $.each(toreturn.defaults.permID, function (number, value) {
      if (F.trulyPlaying(value)) {
        if (!seconds) seconds = Math.round(document.getElementById(value).duration / 6)
        else if (typeof seconds !== 'number') throw new TypeError('forward(seconds) takes number or empty')
        document.getElementById(value).currentTime += seconds
      }
    })
  }

  toreturn.backward = function backward (seconds) {
    // to forward the duration of audio element with seconds or portion of it
    $.each(toreturn.defaults.permID, function (number, value) {
      if (F.trulyPlaying(value)) {
        if (!seconds) seconds = Math.round(document.getElementById(value).duration / 6)
        else if (typeof seconds !== 'number') throw new TypeError('backward(seconds) takes number or empty')
        document.getElementById(value).currentTime -= seconds
      }
    })
  }

  toreturn.mute = function mute () {
    // to mute all audio elements
    $.each(toreturn.defaults.permID, function (number, value) {
      if (F.elementExist(value)) {
        if (document.getElementById(value).volume !== 0) document.getElementById(value).volume = '0'
      }
    })
    toreturn.defaults.mute = true
  }

  toreturn.unmute = function unmute (vol = toreturn.options.volume) {
    // to unmute all audio elements
    $.each(toreturn.defaults.permID, function (number, value) {
      if (F.elementExist(value)) {
        if (document.getElementById(value).volume === 0) document.getElementById(value).volume = vol
      }
    })
    toreturn.defaults.mute = false
  }

  toreturn.repeat_forever = function repeatForever () {
    // to set repeat_forever and replay
    toreturn.options.repeat_forever = 'true'
    toreturn.replay()
  }

// Managing files

  toreturn.add_file = function addFile (file) {
    // to add audio element after testing it with Promise
    promiseAudio(file).then((element) => {
      let id = createUniqueAudio(element)
      toreturn.defaults.elementsID.push(id)
      toreturn.defaults.permID.push(id)
    })
  }

  toreturn.remove_file = function removeFile (id) {
    // remove file using ID index number, file nASes can mismatch but ids not
    if (toreturn.defaults.elementsID[id] !== 'undefined') {
      toreturn.defaults.elementsID.splice(id, 1)
      toreturn.defaults.permID.splice(
        toreturn.defaults.permID.indexOf(toreturn.defaults.permID[id]), 1)
      return true
    } else return false
  }

// Cleanup and exit

  const cleanRandomElements = function cleanRandomElements () {
    // to clean up previous elements in case of a replay
    toreturn.defaults.elementsID.splice(0, toreturn.defaults.elementsID.length)
    toreturn.defaults.permID.splice(0, toreturn.defaults.permID.length)
  }

  toreturn.abort = function abort () {
    // make sure all created elements events are off
    toreturn.defaults.ended = true
    $.each(toreturn.defaults.permID, function (_, v) { $('#' + v).off('ended') })
  }

  toreturn.empty = function empty () {
    // to remove created audio elements from the DOM
    $.each(toreturn.defaults.permID, function (_, v) { $('#' + v).remove() })
  }

  toreturn.exit = function exit (msg = true, rpl = true) {
    // to gracefully exist, with a thorough cleanup
    for (let t in toreturn.defaults.timeouts) { clearTimeout(t) }
    toreturn.abort()
    toreturn.stop()
    if (rpl) {
      cleanRandomElements()
      toreturn.empty()
    }
    toreturn.defaults.ended = true
    if (msg) setTimeout(function () { console.log('audio_sequence exited. till next time !') }, 50)
  }

  // setting up with init and return the class
  __init__()
  return toreturn
}
