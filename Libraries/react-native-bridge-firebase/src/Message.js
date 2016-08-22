/**
 * @providesModule react-native-bridge-firebase/Message
 */
import RNBridgeFirebase from './RNBridgeFirebase';
import NativeError from 'NativeError';
import _ from 'lodash';
import Events from 'EventEmitter';

const { EventEmitter } = RNBridgeFirebase;
export const eventHandler = new Events();

export default class Message {

  static Event = {
    DEVICE_REGISTERED: 'FirebaseDeviceRegistered',
    REGISTERED: 'FirebaseRegistered',
    FAIL_To_REGISTER: 'FirebaseFailToRegister',
    REMOTE_NOTIFICATION: 'FirebaseRemoteNotificationReceived',
  };

  static EventTypeError = class extends NativeError {
    constructor(message) {
      super(message || 'Message event only supports `REMOTE_NOTIFICATION` and `REGISTERED` events');
      this.name = 'Invalid Event Type';
    }
  }

  static deviceInfo = {
    deviceToken: RNBridgeFirebase.deviceToken,
    firebaseToken: RNBridgeFirebase.firebaseToken,
    appVersion: RNBridgeFirebase.appVersion,
    deviceModel: RNBridgeFirebase.deviceModel,
    deviceName: RNBridgeFirebase.deviceName,
    deviceUid: RNBridgeFirebase.deviceUid,
  };

  constructor(parame: Object = {}) {
    _.forEach(parame, (value, key) => (this[key] = value));
  }

  static triggerEventRegistered = _.debounce(() => {
    eventHandler.emit(Message.Event.REGISTERED, Message.deviceInfo);
  }, 3000);

  static async requestPermissions() {
    await RNBridgeFirebase.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
    });
  }

  static addEventListener(type: String, handler: Function) {
    if (!(
      type === Message.Event.REMOTE_NOTIFICATION ||
      type === Message.Event.REGISTERED
    )) throw new Message.EventTypeError;

    const listener = eventHandler.addListener(type, handler);

    if (type === Message.Event.REGISTERED) Message.triggerEventRegistered();

    return listener;
  }

  static removeEventListener(type: String, handler: Function = () => {}) {
    if (!(
      type === Message.Event.REMOTE_NOTIFICATION ||
      type === Message.Event.REGISTERED
    )) throw new Message.EventTypeError;

    eventHandler.removeListener(type, handler);
  }

  static subscribeToTopic(topic: String) {
    return RNBridgeFirebase.subscribeToTopic(topic);
  }

  static unsubscribeFromTopic(topic: String) {
    return RNBridgeFirebase.unsubscribeFromTopic(topic);
  }

  static notify(message: Object) {
    RNBridgeFirebase.notify(message);
  }
}

let lastMessageId;
if (EventEmitter) {
  EventEmitter.addListener(Message.Event.REMOTE_NOTIFICATION, (data) => {
    const messageId = data['gcm.message_id'] || data['google.message_id'];

    if (lastMessageId === messageId) return;
    lastMessageId = messageId;

    const alert = data.aps && data.aps.alert;
    const notification = data.notification;

    const title = data.title || (alert && alert.title) || (notification && notification.title);
    const body = data.body || (alert && alert.body) || (notification && notification.body);

    const message = _.omit(data, ['gcm.message_id', 'google.message_id', 'aps', 'notification']);
    eventHandler.emit(
      Message.Event.REMOTE_NOTIFICATION,
      new Message({ ...message, messageId, title, body }),
    );
  });

  EventEmitter.addListener(Message.Event.DEVICE_REGISTERED, (data) => {
    if (data.deviceToken) {
      Message.deviceInfo.deviceToken = data.deviceToken;
      Message.triggerEventRegistered();
    }
  });

  EventEmitter.addListener(Message.Event.REGISTERED, (data) => {
    if (data.firebaseToken) {
      RNBridgeFirebase.subscribeToTopic('/topics/all');
      Message.deviceInfo.firebaseToken = data.firebaseToken;
      Message.triggerEventRegistered();
    }
  });

  EventEmitter.addListener(Message.Event.FAIL_To_REGISTER, (data) => {
    console.log('error', data);
  });
}
