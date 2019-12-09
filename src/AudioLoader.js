
/* global Audio */ // The audio object to test with. To avoid linter
import MyRandom from 'myrandom'
const Store = MyRandom()

function promiseAudio (url) {
  // to chack with Promise wither the audio is load-able
  return new Promise((resolve, reject) => {
    let a = new Audio()
    a.oncanplaythrough = function () {
      resolve(a)
    }
    a.onerror = function () {
      reject(new Error('could not load audio : ' + url))
    }
    a.src = url
  })
}

function createUniqueAudio (element) {
  // pushing the audio into the DOM with unique id and returning the id
  let uniqueID = 'AS' + Store.randint(10)
  element.id = uniqueID
  document.body.appendChild(element)
  return uniqueID
}

export {
  promiseAudio,
  createUniqueAudio,
  Store
}
