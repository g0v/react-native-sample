/**
 * @providesModule react-native-bridge-firebase/Crash
 */
import RNBridgeFirebase from './RNBridgeFirebase';

export default class {

  static report(message) {
    RNBridgeFirebase.reportCrash(message);
  }
}
