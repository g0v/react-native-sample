/**
 * @providesModule react-native-bridge-firebase/RNBridgeFirebase
 */
import { NativeModules, NativeEventEmitter } from 'react-native';

const { RNBridgeFirebase } = NativeModules;

if (RNBridgeFirebase) {
  RNBridgeFirebase.EventEmitter = new NativeEventEmitter(RNBridgeFirebase);
}

export default RNBridgeFirebase || {};
