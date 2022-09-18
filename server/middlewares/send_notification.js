import FCM from 'fcm-node';

var fbServerKey = 'AAAA9dwQnKo:APA91bEoo8bVKUbqj9TzcFvhN4Ek0Te66pnHiFd9KOXlvNlaEDeIxHd52ZnNRIcfawSm3jSxyqLs2VcnQLd9bMGzazQxi6eYP71B5GthFTwizA8k4oqqYegHODK5HX_lpmivOit4DzZo';

export default function sendNoti(title,body,pushToken) {
    var message = {
        to: pushToken,
        notification:{
            title:title,
            body:body
        }
      };
      var fcm = new FCM(fbServerKey);
      fcm.send(message, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!" + err);
        } else {
          // showToast("Successfully sent with response");
          console.log("Successfully sent with response: ", response);
        }
      });
}