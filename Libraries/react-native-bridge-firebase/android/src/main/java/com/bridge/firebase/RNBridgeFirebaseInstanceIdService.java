package com.react.bridge.firebase;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;

public class RNBridgeFirebaseInstanceIdService extends FirebaseInstanceIdService {

    private static final String TAG = "RNBridgeFirebaseInstanceIdService";

    @Override
    public void onTokenRefresh() {
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        Log.d(TAG, "Refreshed token: " + refreshedToken);

        Intent intent = new Intent(RNBridgeFirebaseModule.INTENT_REGISTERED);
        Bundle bundle = new Bundle();
        bundle.putString("token", refreshedToken);
        intent.putExtras(bundle);
        sendBroadcast(intent);
    }
}
