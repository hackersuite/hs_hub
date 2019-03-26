function givePrize() {
  var achievementId = $("#give-achievement-id").val();
  var userId = $("#give-user-id").val();
  var url = "/achievements/" + achievementId + "/giveprize";

  $.ajax({
    url: url,
    type: "PUT",
    data: {
      userId: userId
    }
  });
}

function awardAchievement() {
  var achievementId = $("#award-achievement-id").val();
  var userId = $("#award-user-id").val();
  var url = "/achievements/" + achievementId + "/complete";

  $.ajax({
    url: url,
    type: "PUT",
    data: {
      userId: userId
    }
  });
}