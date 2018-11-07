let scanner;
let camera;

function startScanner() {
  $("#qr-scanner-container").fadeIn("slow");
  scanner = new Instascan.Scanner({ video: document.getElementById('qr-scanner') });
  scanner.addListener('scan', function (content) {
    console.log(content);
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
  scanner.stop(camera);
  $("#qr-scanner-container").fadeOut("slow");
}

function couldNotStartCamera() {
  $.notify({
    message: 'Could not start webcam!'
  }, {
      type: 'danger'
    });
  $("#qr-scanner-container").fadeOut("slow");
}