package com.react.bridge.firebase;

import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.content.Intent;
import android.content.res.Resources;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.app.Activity;
import android.app.NotificationManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.crash.FirebaseCrash;

import java.util.Map;
import java.util.HashMap;
import java.util.Set;

import javax.annotation.Nullable;

public class RNBridgeFirebaseModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

  private static final String TAG = "RNBridgeFirebaseModule";

  public static final String INTENT_REMOTE_NOTIFICATION = "com.reactlibrary.RNBridgeFirebase.refreshedToken";
  public static final String INTENT_REGISTERED = "com.reactlibrary.RNBridgeFirebase.registered";

  private static final String DEVICE_REGISTERED = "FirebaseDeviceRegistered";
  private static final String REGISTERED = "FirebaseRegistered";
  private static final String FAIL_To_REGISTER = "FirebaseFailToRegister";
  private static final String REMOTE_NOTIFICATION = "FirebaseRemoteNotificationReceived";

  @Override
  public String getName() {
    return "RNBridgeFirebase";
  }

  public RNBridgeFirebaseModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(this);
    reactContext.addLifecycleEventListener(this);

    intentMessageHandler();
    intentTokenRefreshHandler();
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
  }

  @Override
  public void onNewIntent(Intent intent) {
    Bundle extras = intent.getExtras();

    if(extras != null && extras.get("google.message_id") != null) {
      WritableMap params = Arguments.createMap();
      for (String key : extras.keySet()) {
        Object value = extras.get(key);
        params.putString(key, value.toString());
      }
      sendEvent(REMOTE_NOTIFICATION, params);
    }
  }

  @Override
  public void onHostResume() {
    Bundle extras = getCurrentActivity().getIntent().getExtras();

    if(extras != null && extras.get("google.message_id") != null) {
      WritableMap params = Arguments.createMap();
      for (String key : extras.keySet()) {
        Object value = extras.get(key);
        params.putString(key, value.toString());
      }
      sendEvent(REMOTE_NOTIFICATION, params);
    }
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {
  }

  public Class getMainActivityClass() {
    Context context = getReactApplicationContext();
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    String className = launchIntent.getComponent().getClassName();
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  public void sendEvent(String name, Object params) {
    getReactApplicationContext()
      .getJSModule(RCTNativeAppEventEmitter.class)
      .emit(name, params);
  }

  // [START message]
  private void intentTokenRefreshHandler() {
    IntentFilter intentFilter = new IntentFilter(INTENT_REGISTERED);
    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          WritableMap firebaseParams = Arguments.createMap();
          firebaseParams.putString("firebaseToken", intent.getStringExtra("firebaseToken"));
          sendEvent(REGISTERED, firebaseParams);
          WritableMap deviceParams = Arguments.createMap();
          deviceParams.putString("deviceToken", intent.getStringExtra("deviceToken"));
          sendEvent(DEVICE_REGISTERED, deviceParams);
        }
      }
    }, intentFilter);
  }

  private void intentMessageHandler() {
    IntentFilter intentFilter = new IntentFilter(INTENT_REMOTE_NOTIFICATION);

    getReactApplicationContext().registerReceiver(new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if (getReactApplicationContext().hasActiveCatalystInstance()) {
          RemoteMessage message = intent.getParcelableExtra("data");
          WritableMap params = Arguments.createMap();

          RemoteMessage.Notification notification = message.getNotification();
          if (notification != null) {
            WritableMap notice = Arguments.createMap();
            notice.putString("title", notification.getTitle());
            notice.putString("body", notification.getBody());
            params.putMap("notification", notice);
          }

          if (message.getData() != null) {
            Map data = message.getData();
            Set<String> keysIterator = data.keySet();
            params.putString("collapse_key", message.getCollapseKey());
            params.putString("google.message_id", message.getMessageId());
            params.putString("google.sent_time", Long.toString(message.getSentTime()));
            params.putString("from", message.getFrom());

            for(String key: keysIterator) {
              params.putString(key, (String) data.get(key));
            }

            sendEvent(REMOTE_NOTIFICATION, params);
          }
        }
      }
    }, intentFilter);
  }

  @ReactMethod
  public void requestPermissions(ReadableMap params, Promise promise) {
    WritableMap map = Arguments.createMap();
    promise.resolve(map);
  }
  // [END message]

  @ReactMethod
  public void reportCrash(String message){
      FirebaseCrash.log(message);
  }

  @ReactMethod
  public void setUserId(String id){
      FirebaseAnalytics.getInstance(getReactApplicationContext()).setUserId(id);
  }

  @ReactMethod
  public void setUserProperty(String name, String property) {
      FirebaseAnalytics.getInstance(getReactApplicationContext()).setUserProperty(name, property);
  }

  @ReactMethod
  public void logEvent(String name, ReadableMap parameters) {
      FirebaseAnalytics.getInstance(getReactApplicationContext()).logEvent(name, Arguments.toBundle(parameters));
  }

  @ReactMethod
  public void setEnabled(Boolean enabled) {
      FirebaseAnalytics.getInstance(getReactApplicationContext()).setAnalyticsCollectionEnabled(enabled);
  }

  @Override
  public @Nullable Map<String, Object> getConstants() {
    HashMap<String, Object> constants = new HashMap<String, Object>();

    String token = FirebaseInstanceId.getInstance().getToken();

    RNBridgeFirebaseDeviceName deviceName = new RNBridgeFirebaseDeviceName(getReactApplicationContext());
    RNBridgeFirebaseDeviceUid deviceUid = new RNBridgeFirebaseDeviceUid(getReactApplicationContext());

    constants.put("deviceToken", token != null ? token : "");
    constants.put("firebaseToken", token != null ? token : "");
    constants.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);
    constants.put("deviceName", deviceName.getDeviceName());
    constants.put("deviceUid", deviceUid.getDeviceUid().toString());
    constants.put("appVersion", BuildConfig.VERSION_NAME);

    return constants;
  }
}
