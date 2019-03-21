OneSignal.push(function () {
  OneSignal.on('subscriptionChange', function(isSubscribed) {
    if (isSubscribed) {
      OneSignal.getUserId(function(userId) {
        var request = new XMLHttpRequest();
        request.open('POST', '/announcement/push/register', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onreadystatechange = function () {
          if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
            showSuccess('Subscribed to push notifications!');
          }
        };
        request.send('data=' + userId);
      });
    }
  });
});