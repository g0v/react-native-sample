import EventEmitter from 'EventEmitter';
import faker from 'faker';

const RNBridgeFirebase = jest.genMockFromModule('../RNBridgeFirebase');

const events = new EventEmitter();

RNBridgeFirebase.requestPermissions = jest.fn();
RNBridgeFirebase.EventEmitter = {
  addListener: (type, hander) => events.addListener(type, hander),
  events,
};
RNBridgeFirebase.subscribeToTopic = jest.fn();
RNBridgeFirebase.unsubscribeFromTopic = jest.fn();
RNBridgeFirebase.deviceToken = '';
RNBridgeFirebase.firebaseToken = faker.random.uuid();
RNBridgeFirebase.appVersion = faker.name.findName();
RNBridgeFirebase.deviceModel = faker.random.word();
RNBridgeFirebase.deviceName = faker.random.word();
RNBridgeFirebase.deviceUid = faker.random.uuid();

export default RNBridgeFirebase;
