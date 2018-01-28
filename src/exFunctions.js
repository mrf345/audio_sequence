import $ from 'jquery'
import { Store } from './AudioLoader'

const F = {
  // you can force a man outta python, but his python will always come out ..
  range: function range (to = 1, from = 0) {
    // to generate an array of certain range of numbers
    let rangeOfNumbers = []
    for (let i = from; to >= i; i += 1) {
      rangeOfNumbers.push(i)
    }
    return rangeOfNumbers
  },

  // Validation functions
  checkType: function checkType (type, args) {
    // checking the type of each varible in the passed array
    for (let a in args) {
      if (typeof args[a] !== type) return false
    }
    return true
  },
  checkBool: function checkBool (args) {
    // check if passed args are 'true' or 'false' type
    for (let a in args) {
      if (args[a] !== 'true' && args[a] !== 'false') return false
    }
    return true
  },
  elementExist: function elementExist (id) {
    // checking if an elment exists in the DOM
    // ! sometimes needed when elements are deleted intentionally !
    if (document.getElementById(id) === null) return false; else return true
  },
  trulyPlaying: function trulyPlaying (id) {
    // check if audio element trule playing. To avoide not started yet elements.
    // For thought: If it is indeed truly playing, then equal in truthiness, is its existence !
    if (!F.elementExist(id)) return false
    if (!document.getElementById(id).ended && !isNaN(document.getElementById(id).duration)) {
      return true
    } else return false
  },
  checkFiles: function checkFiles (files = []) {
    // to check if the audio files are loaded and the elements are error free
    for (let i = 0; files.length > i; i += 1) {
      let id = 'TEST' + Store.randint(6)
      $('body').append($('<audio>').attr('src', files[i]).attr('id', id))
      setTimeout(function () {
        if (F.elementExist(id)) {
          if (document.getElementById(id).error !== null) {
            F.exit(false)
            throw new Error('audio_sequence(options=[files]) invalid or unavailable file : ' + document.getElementById(id).src)
          }
          $('#' + id).remove()
        }
      }, 10) // time out is needed to get the right response after the files are fully loaded
    }
  }
}
export default F
