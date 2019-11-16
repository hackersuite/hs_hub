var countDownDate = new Date("Nov 17, 2019 12:00:00").getTime();

var timerInterval = setInterval(updateTime, 1000);
updateTime();

function updateTime() {
  var now = new Date().getTime();
  var distance = countDownDate - now;

  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (distance - (1000 * 60 * 60 * 24) > 0) {
    $("#hours").html("24");
    $("#minutes").html("00");
    $("#seconds").html("00");
  } else {
    $("#hours").html(hours < 10 ? "0" + hours : hours);
    $("#minutes").html(minutes < 10 ? "0" + minutes : minutes);
    $("#seconds").html(seconds < 10 ? "0" + seconds : seconds);
  }

  if (distance < 0) {
    clearInterval(timerInterval);
    $("#hours").html("00");
    $("#minutes").html("00");
    $("#seconds").html("00");
  }
}