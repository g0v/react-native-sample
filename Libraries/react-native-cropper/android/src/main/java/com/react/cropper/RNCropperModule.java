
package com.react.cropper;

import android.content.BroadcastReceiver;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.content.IntentFilter;
import android.content.Intent;
import android.content.res.Resources;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.provider.MediaStore;
import android.util.Base64;
import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.support.v4.app.ActivityCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReadableMap;

import com.yalantis.ucrop.UCrop;

import java.io.File;
import java.io.ByteArrayOutputStream;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import android.util.Log;

import javax.annotation.Nullable;

public class RNCropperModule extends ReactContextBaseJavaModule implements ActivityEventListener {

  private static final String TAG = "RNCropperModule";


  private static final int IMAGE_PICKER_REQUEST = 1;
  private static final int CAMERA_PICKER_REQUEST = 2;

  private static final String RCT_ERROR_USER_CANCELED = "RCT_ERROR_USER_CANCELED";
  private static final String RCT_ERROR_UNKNOWN = "RCT_ERROR_UNKNOWN";
  private static final String RCT_ERROR_PERMISSIONS_MISSING = "RCT_ERROR_PERMISSIONS_MISSING";

  private Promise mPickerPromise;
  private Activity activity;
  private Uri mCameraCaptureURI;

  @Override
  public String getName() {
    return "RNCropper";
  }

  public RNCropperModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(this);
  }

  private File getNewFile() {
    final Context context = getReactApplicationContext();
    String filename = "cropper-" + UUID.randomUUID().toString() + ".jpg";

    return new File(context.getCacheDir(), filename);
  }

  public void onImagePickerResult(final int resultCode, final Intent data) {
    if (mPickerPromise == null) return;

    if (resultCode == Activity.RESULT_CANCELED) {
      mPickerPromise.reject(RCT_ERROR_USER_CANCELED, "User canceled on image picker");
      return;
    }

    if (resultCode == Activity.RESULT_OK) {
      Uri uri = data.getData();
      showCropper(uri);
      return;
    }

    mPickerPromise.reject(RCT_ERROR_UNKNOWN, "Exception on image picker");
  }

  public void onCameraPickerResult(final int resultCode, final Intent data) {
    if (mPickerPromise == null) return;

    if (resultCode == Activity.RESULT_CANCELED) {
      mPickerPromise.reject(RCT_ERROR_USER_CANCELED, "User canceled on Camera Picker");
      return;
    }

    if (resultCode == Activity.RESULT_OK && mCameraCaptureURI != null) {
      Uri uri = mCameraCaptureURI;

      showCropper(uri);
      return;
    }

    mPickerPromise.reject(RCT_ERROR_UNKNOWN, "Exception on camera picker");
  }

  public void onCropperResult(final int resultCode, final Intent data) {
    if (mPickerPromise == null) return;

    if (data == null) {
      mPickerPromise.reject(RCT_ERROR_USER_CANCELED, "User canceled on cropper");
      return;
    }

    if (resultCode == Activity.RESULT_OK) {
      final Uri uri = UCrop.getOutput(data);
      final String path = uri.getPath();

      Bitmap image = BitmapFactory.decodeFile(path);
      ByteArrayOutputStream byteArray = new ByteArrayOutputStream();
      image.compress(Bitmap.CompressFormat.JPEG, 100, byteArray);

      mPickerPromise.resolve(Base64.encodeToString(byteArray.toByteArray(), Base64.DEFAULT));

      return;
    }

    mPickerPromise.reject(RCT_ERROR_UNKNOWN, "Exception on cropper");
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    switch (requestCode) {
      case IMAGE_PICKER_REQUEST:
        onImagePickerResult(resultCode, data);
        break;
      case CAMERA_PICKER_REQUEST:
        onCameraPickerResult(resultCode, data);
        break;
      case UCrop.REQUEST_CROP:
        onCropperResult(resultCode, data);
        break;
      default:
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
  }

  public void showCropper(Uri sourceUri) {
    UCrop.Options options = new UCrop.Options();
    options.setCompressionFormat(Bitmap.CompressFormat.JPEG);

    UCrop uCrop = UCrop.of(sourceUri, Uri.fromFile(getNewFile()))
            .withMaxResultSize(512, 512)
            .withAspectRatio(512, 512)
            .withOptions(options);

    final Intent intent = uCrop.getIntent(getReactApplicationContext());
    activity.startActivityForResult(intent, UCrop.REQUEST_CROP);
  }

  private boolean isCameraAvailable() {
    final PackageManager packageManager = getReactApplicationContext().getPackageManager();

    return packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA) ||
           packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY);
  }

  private boolean checkCameraPermissions(Activity activity) {
    int writePermission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.WRITE_EXTERNAL_STORAGE);
    int cameraPermission = ActivityCompat.checkSelfPermission(activity, Manifest.permission.CAMERA);

    if (writePermission != PackageManager.PERMISSION_GRANTED || cameraPermission != PackageManager.PERMISSION_GRANTED) {
      String[] PERMISSIONS = {
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.CAMERA
      };

      ActivityCompat.requestPermissions(activity, PERMISSIONS, 1);
      return false;
    }

    return true;
  }

  @ReactMethod
  public void getPhotoFromCamera(final ReadableMap options, final Promise promise) {
    if (!isCameraAvailable()) {
      promise.reject(RCT_ERROR_UNKNOWN, "Camera not available");
      return;
    }

    activity = getCurrentActivity();

    if (activity == null) {
      promise.reject(RCT_ERROR_UNKNOWN, "Activity doesn't exist");
      return;
    }

    if (!checkCameraPermissions(activity)) {
      promise.reject(RCT_ERROR_PERMISSIONS_MISSING, "Required permission missing");
      return;
    }

    mPickerPromise = promise;

    try {
      final Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

      mCameraCaptureURI = Uri.fromFile(getNewFile());

      final PackageManager packageManager = getReactApplicationContext().getPackageManager();

      intent.putExtra(MediaStore.EXTRA_OUTPUT, mCameraCaptureURI);
      if (intent.resolveActivity(packageManager) == null) {
        promise.reject(RCT_ERROR_UNKNOWN, "Cannot launch camera");
        return;
      }

      activity.startActivityForResult(intent, CAMERA_PICKER_REQUEST);
    } catch (Exception e) {
      mPickerPromise.reject(RCT_ERROR_UNKNOWN, e);
    }
  }

  @ReactMethod
  public void getPhotoFromAlbum(final ReadableMap options, final Promise promise) {
    activity = getCurrentActivity();

    if (activity == null) {
      promise.reject(RCT_ERROR_UNKNOWN, "Activity doesn't exist");
      return;
    }

    mPickerPromise = promise;

    try {
      final Intent intent = new Intent(
        Intent.ACTION_PICK,
        android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI
      );

      activity.startActivityForResult(intent, IMAGE_PICKER_REQUEST);
    } catch (Exception e) {
      mPickerPromise.reject(RCT_ERROR_UNKNOWN, e);
    }
  }

  @Override
  public @Nullable Map<String, Object> getConstants() {
    HashMap<String, Object> constants = new HashMap<String, Object>();

    constants.put("ERROR_USER_CANCELED", RCT_ERROR_USER_CANCELED);
    constants.put("ERROR_UNKNOWN", RCT_ERROR_UNKNOWN);
    constants.put("ERROR_PERMISSIONS_MISSING", RCT_ERROR_PERMISSIONS_MISSING);

    return constants;
  }
}
