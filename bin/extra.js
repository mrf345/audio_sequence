/* global $, player, alert */

var trueName = function (name) {
  // to splice name
  name = name.split('/')
  return name[name.length - 2] + '/' + name[name.length - 1]
}

var fileAdd = function fileAdd () {
  // adding items to the file list
  var toWait = setInterval(function () {
    if (player.playlist.length > 0) {
      $.each(player.playlist, function (num, ele) {
        var name = ele.src
        var li = $('<li>').text(trueName(name)).append(
              $('<span>').addClass('fa fa-plus text-primary').click(
                function () {
                  !player.add(name) && alert('File already exists.')
                }
              )
            )
        $('.fileslist').append(li)
      })
      clearInterval(toWait)
    }
  }, 100)
}

var addit = function addit (name, id, first) {
  // adding items to the playlist, with remove event
  first = first || false
  var li = $('<li>').text(trueName(name)).addClass('text-primary').append(
        $('<span>').addClass('fa fa-trash text-danger').click(
          function () {
            player.remove(name)
            $(this).parent().remove()
          }
        )
      )
  $('.playlist').append(li)
}

var addlisted = function addlisted (first) {
  // to add files that are listed. Will interval this
  first = first || false
  $('ol.playlist').children().remove()
  if (player.playlist.length > 0) {
    setTimeout(function () {
      $.each(player.playlist, function (num, value) {
        player.findFile(value.src) && addit(value.src, value.id, first)
      })
    }, 100)
  }
}

var addFinal = function addFinal () {
  addlisted()
  var oldList = player.playlist.join() // to store the old list
  setInterval(
    function () {
      if (player.playlist.join() !== oldList) { // so update if list change only
        addlisted()
        oldList = player.playlist.join()
      } else if (player.playlist.length === 0) {
      }
    }, 500)
}

var progress = function progress () {
  // to set progress bar values. Will interval this too
  setInterval(function () {
    var playing = false // indicate playing element found
    if (player.isActive()) {
      var value = player.playlist[player.current]
      $('#pgbarc').attr(
        'aria-valuenow',
        value.duration.toFixed(2)).attr(
          'style', 'width:' + Math.floor(
            (value.duration - value.currentTime) * 100 / value.duration
          ) + '%;').text(
              value.currentTime.toFixed(2) + ' / ' + value.duration.toFixed(2) + ' : ' + trueName(value.src))
      playing = true
    } else {
      $.each(player.playlist, function (num, value) {
        if (value.duration.toFixed(2) !== '0.00' && !value.ended) {
          $('#pgbarc').attr(
            'aria-valuenow',
            value.duration.toFixed(2)).attr(
              'style', 'width:' + Math.floor(
                (value.duration - value.currentTime) * 100 / value.duration
              ) + '%;').text(
                  value.currentTime.toFixed(2) + ' / ' + value.duration.toFixed(2) + ' : ' + trueName(value.src))
          playing = true
        }
      })
    }
    if (!playing) {
      $('#pgbarc').attr('aria-valuenow', '0.00').attr(
        'style', 'width:0%').text('No file playing now')
    }
  }, 100)
}

var loading = function () {
  setInterval(function () {
    $('.loading')[player.loading ? 'addClass' : 'removeClass']('fa-spin')
  }, 100)
}

var willRepeat = function willRepeat (each) {
  // to get number of repeats from form
  var repeats = $('#repeats').val()
  repeats = parseInt(repeats)
  if (isNaN(repeats) || repeats <= 1) {
    alert('Number of repeats must be a number greater than 1')
  } else {
    player.repeats = repeats
    if (each) {
      player.each()
    } else {
      player.whole()
    }
    player.replay()
  }
}

var randint = function randint (rn, limit) {
// to generate a random int of certain range
  var r = Math.floor(Math.random() * Math.pow(10, rn))
  if (r > limit) return randint(rn, limit)
  else return r
}

jQuery(document).ready(function ($) {
  $('h4').each(function () {
    $(this).css({'color': '#' + randint(6)})
    $(this).hover(
      function () {
        $(this).stop().animate({
          'font-size': '250%',
          'color': '#' + randint(6)
        })
      },
      function () {
        $(this).stop().animate({
          'font-size': '150%'
        })
      }
    )
  })
  loading()
})
