function updateRepository(repoURL) {
  let regex = new RegExp("((http(s)?))(:(//)?)([\w\.@\:/\-~]+)(\.git)");
  if (!regex.test(repoURL)) {
    showError("Enter a valid URL");
    return;
  }

  $.post({
    url: "/team/updateRepository",
    data: {
      repo: repoURL
    },
    success: function(response) {
      showSuccess(response);
    },  
    error: function(error) {
      showError(error.responseJSON.message);
      return;
    }
  });
}

function updateTableNumber(newTableNumber) {
  if (Number(newTableNumber) < 0 || !Number.isSafeInteger(Number(newTableNumber))) {
    showError("Enter a valid table number");
    return;
  }

  $.post({
    url: "/team/updateTableNumber",
    data: {
      tableNumber: newTableNumber
    },
    success: function(response) {
      showSuccess(response);
    },  
    error: function(error) {
      showError(error.responseJSON.message);
      return;
    }
  });
}

function createTeam() {
  $.post({
    url: "/team/create",
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      showError(error.responseJSON.message);
      return;
    }
  });
}

function updateName(newName) {
  $.post({
    url: "/team/updateTeamName",
    data: {
      name: newName
    },
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      showError(error.responseJSON.message);
      return;
    }
  });
}

function joinTeam(teamCode) {
  $.post({
    url: "/team/join",
    data: {
      team: teamCode
    },
    success: function(response) {
      location.reload();
    },  
    error: function(error) {
      showError(error.responseJSON.message);
      return;
    }
  });
}

function leaveTeam() {
  $.post({
    url: "/team/leave",
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      showError(error.responseJSON.message);
      return;
    }
  });
}