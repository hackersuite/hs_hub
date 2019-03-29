var selectedAchievementId;
var selectedUserId;

function showConfirmationModal(achievementId, userId, prizeUrl, title, user) {
  selectedAchievementId = achievementId;
  selectedUserId = userId;
  $('#confirmModalImg').attr("src", prizeUrl);
  $('#confirmModalBody').html(title + " to user " + user);
  $("#modal-confirm-button").off( "click" );
  $("#modal-confirm-button").click(givePrize);
  $('#confirmModal').modal()
}

function givePrize() {
  var url = "/achievements/" + selectedAchievementId + "/giveprize";

  $.ajax({
    url: url,
    type: "PUT",
    data: {
      userId: selectedUserId
    },
    success: function() {
      location.reload();
    }
  });
}

function awardAchievement() {
  var achievementId = $("#select-achievement option:selected").attr("data-id");
  var userId = $("#select-user option:selected").attr("data-id");

  $.ajax({
    url: "/achievements/" + achievementId + "/complete",
    type: "PUT",
    data: {
      userId: userId
    },
    success: function() {
      location.reload()
    }
  });
}