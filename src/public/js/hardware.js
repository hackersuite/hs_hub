function openQR(token) {
  $("#reservation-qr").attr("src", getQRCode(token));
  $("#reservation-qr-panel").fadeIn("slow");
  $("#reservation-qr-token").html(token);
}

function closeQR() {
  $("#reservation-qr-panel").fadeOut("fast");
  $("#reservation-qr").attr("src", "");
  $("#reservation-qr-token").html("");
}

function reserve(itemName) {
  var quantity = $("#" + itemName.replace(/ /g, "-").replace(/-/g, "").replace(/./g, "").replace(/\/|(|)/g, "") + "-reservation-quantity").val();
  $.post({
    url: "/hardware/reserve",
    data: {
      item: itemName,
      quantity: quantity
    },
    success: function(response) {
      location.reload();
    },  
    error: function(error) {
      $.notify({
        message: error.responseJSON.message
      }, {
          type: 'danger'
        });
      return;
    }
  })
}

function cancelReservation(token) {
  $.post({
    url: "/hardware/cancelReservation",
    data: {
      token: token
    },
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      $.notify({
        message: error.responseJSON.message
      }, {
          type: 'danger'
        });
      return;
    }
  })
}