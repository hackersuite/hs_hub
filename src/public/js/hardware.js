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

var itemsContainerId = "items-container";

var itemTemplate = '<div class="col-xl-3 col-lg-4 col-md-6"><div class="card">'
                 + '<div class="card-header #headerClass"><h4 class="card-title">#name</h4></div>'
                 + '<div class="card-body item-content"><div class="item-img-container">'
                 + '<img class="item-img" src="#imageURL" alt=""></div><div><b>In stock:</b>#stock</div>'
                 + '#itemControls'
                 + '</div></div></div>';

var reservedItemUI = '<div><b>You have reserved:</b>#reservedQuantity. Expires in #expiresIn minutes.</div>'
                   + '<button type="button" class="btn btn-warning btn-compact" data-dismiss="modal"'
                   + 'onclick="openQR(`#reservationToken`)">QR</button>'
                   + '<button type="button" class="btn btn-danger btn-compact" data-dismiss="modal"'
                   + 'onclick="cancelReservation(`#reservationToken`)">CANCEL</button>';

var takenItemUI = '<div><b>You have taken:</b>#reservedQuantity.</div>'
                + '<button type="button" class="btn btn-warning btn-compact" data-dismiss="modal"'
                + 'onclick="openQR(`#reservationToken`)">QR</button>';

var takeItemUI = '<div><span><b>Quantity to take:</b></span>'
               + '<input type="number" name="quantity" id="#itemId-reservation-quantity"'
               + 'class="form-control number-input" placeholder="quantity" value="1" min="1"></div>'
               + '<button type="button" class="btn btn-success btn-compact" data-dismiss="modal"'
               + 'onclick="reserve(#itemId)">TAKE</button>';

var outOfStockUI = '<div><b>Sorry. This item is currently out of stock!</b></div>';

var hardwareItems = [];
var filters = { all: "all", reserved: "reserved" };
var currentFilter = filters.all;
var currentSearchKey = "";

var headerClasses = {
  default: "card-header-success",
  reserved: "card-header-warning",
  taken: "card-header-danger"
}

function renderItems() {
  $("#" + itemsContainerId).empty();
  for (var index = 0; index < hardwareItems.length; index++) {
    var item = hardwareItems[index];
    if (passesCurrentFilter(item) && containsCurrentSearchKey(item)) {
          renderItem(item);
    }
  }
}

function passesCurrentFilter(item) {
  return currentFilter === filters.all
         || currentFilter === filters.reserved
         && (item.taken || item.reserved);
}

function containsCurrentSearchKey(item) {
  return currentSearchKey === "" || item.itemName.toLowerCase().includes(currentSearchKey);
}

function renderItem(item) {
  var itemString = makeItemString(item);
  $("#" + itemsContainerId).append(itemString);
}

function compareItems(item1, item2) {
  if (item1.itemName < item2.itemName)
    return 1;
  else if (item1.itemName > item2.itemName)
    return -1;
  else
    return 0;
}

function makeItemString(item) {
  var itemString = itemTemplate
                  .replace(/#headerClass/g, getItemHeaderClass(item))
                  .replace(/#name/g, item.itemName)
                  .replace(/#imageURL/g, item.itemURL)
                  .replace(/#stock/g, item.itemsLeft)
                  .replace(/#itemControls/g, getItemControls(item));
  return itemString;
}

function getItemControls(item) {
  if (item.taken) {
    return takenItemUI
          .replace(/#reservedQuantity/g, item.reservationQuantity)
          .replace(/#reservationToken/g, item.reservationToken);
  } else if (item.reserved) {
    return reservedItemUI
          .replace(/#reservedQuantity/g, item.reservationQuantity)
          .replace(/#expiresIn/g, item.expiresIn)
          .replace(/#reservationToken/g, item.reservationToken);
  } else if (item.itemsLeft == 0) {
    return outOfStockUI;
  } else {
    return takeItemUI
          .replace(/#itemId/g, item.itemID);
  }
}

function getItemHeaderClass(item) {
  if (item.taken)
    return headerClasses.taken;
  else if (item.reserved)
    return headerClasses.reserved;
  else
    return headerClasses.default;
}

function setFilter(filter) {
  if (currentFilter !== filters[filter]) {
    $(".filter-btn").removeClass("active");
    $("#filter-btn-" + filter).addClass("active");
    currentFilter = filters[filter];
    renderItems();
  }
}

function search(key) {
  if (key !== currentSearchKey) {
    currentSearchKey = key.toLowerCase();
    renderItems();
  }
}

function enterFilterButton(filter) {
  if (currentFilter !== filters[filter]) {
    $(".filter-btn").removeClass("active");
    $("#filter-btn-" + filter).addClass("active");
  }
}

function exitFilterButton() {
  $(".filter-btn").removeClass("active");
  $("#filter-btn-" + currentFilter).addClass("active");
}


function reserve(itemID) {
  var quantity = $("#" + itemID + "-reservation-quantity").val();
  $.post({
    url: "/hardware/reserve",
    data: {
      item: itemID,
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