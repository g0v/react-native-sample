package com.react.bridge.firebase;

import android.content.Intent;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class RNBridgeFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "RNBridgeFirebaseMessagingService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "Remote message received");

        Intent intent = new Intent(RNBridgeFirebaseModule.INTENT_REMOTE_NOTIFICATION);
        intent.putExtra("data", remoteMessage);
        sendBroadcast(intent);
    }
}
