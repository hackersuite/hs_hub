let scanner;
let camera;

function startScanner() {
  $("#qr-scanner-container").fadeIn("slow");
  scanner = new Instascan.Scanner({ video: document.getElementById('qr-scanner') });
  scanner.addListener('scan', function (content) {
    var info = JSON.parse(content);
    if (info.type == "achievementStep") {
      $.post({
        url: "/achievements/" + info.id + "/incrementProgress",
        data: {
          step: info.step,
          token: info.token.replace(/ /g, "+")
        },
        success: function (response) {
          $.notify({
            message: response.message
          }, {
              type: 'success'
            });
        },  
        error: function (error) {
          $.notify({
            message: error.responseJSON.message
          }, {
              type: 'danger'
            });
        }
      });
    } else {
      location.href = content;
    }
    closeScanner();
  });
  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      camera = cameras[0];
      scanner.start(camera);
    } else {
      couldNotStartCamera();
    }
  }).catch(function (e) {
    couldNotStartCamera();
    console.error(e);
  });
}

function startCustomScanner(videoObjId, callback) {
  closeScanner();
  scanner = new Instascan.Scanner({ video: document.getElementById(videoObjId) });
  scanner.addListener('scan', function (content) {
    callback(content);
  });
  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      camera = cameras[0];
      scanner.start(camera);
    } else {
      couldNotStartCamera();
    }
  }).catch(function (e) {
    couldNotStartCamera();
    console.error(e);
  });
}

function closeScanner() {
  if (camera && scanner) {
    scanner.stop(camera);
    $("#qr-scanner-container").fadeOut("slow");
  }
}

function couldNotStartCamera() {
  $.notify({
    message: 'Could not start webcam!'
  }, {
      type: 'danger'
    });
  $("#qr-scanner-container").fadeOut("slow");
}

function getQRCode(url) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + url;
}