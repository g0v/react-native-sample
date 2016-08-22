package com.react.bridge.firebase;

import android.content.Context;
import android.accounts.AccountManager;
import android.accounts.Account;
import android.util.Patterns;

import java.util.regex.Pattern;

public class RNBridgeFirebaseDeviceName {
  protected static String username = "Unknown";

  public RNBridgeFirebaseDeviceName(Context context) {
    if (username != "Unknown") return;

    Pattern emailPattern = Patterns.EMAIL_ADDRESS;
    AccountManager manager = AccountManager.get(context.getApplicationContext());
    Account[] accounts = manager.getAccountsByType("com.google");

    for (Account account : accounts) {
      if (emailPattern.matcher(account.name).matches()) {
        String[] parts = account.name.split("@");

        if (parts.length > 1) {
          username = parts[0];
          break;
        }
      }
    }
  }

  public String getDeviceName() {
    return username;
  }
}
