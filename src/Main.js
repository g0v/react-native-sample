import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  InteractionManager,
} from 'react-native';
import CodePush from 'react-native-code-push';
import Spinner from 'react-native-spinkit';
import { Message } from 'react-native-bridge-firebase';
import Analytics from './model/Analytics';

import Enter from './page/enter/Enter';

import color from './assist/color.json';

const sh = StyleSheet.create({
  viewport: {
    flex: 1,
    backgroundColor: color.primary,
  },
  progress: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
    marginTop: 20,
    color: color.background,
  },
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
});

export default class extends Component {

  state = {
    isSync: true,
    syncText: 'Bunninn 連線中...',
  };

  componentWillMount() {
    Message.requestPermissions();

    InteractionManager.runAfterInteractions(async () => {
      try {
        if (__DEV__) return this.setState({ isSync: false });

        const remotePackage = await CodePush.checkForUpdate();

        if (!remotePackage) return this.setState({ isSync: false });

        if (remotePackage.isMandatory) {
          return this.showUpdateAlert(remotePackage.description);
        }

        await CodePush.sync(
          {
            updateDialog: false,
            installMode: CodePush.InstallMode.IMMEDIATE,
          },
          (status) => {
            switch (status) {
              case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({
                  syncText: 'Bunninn 連線中...',
                  syncIndeterminate: true,
                });
                break;
              case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.setState({
                  syncText: '更新中 0%',
                  syncIndeterminate: true,
                });
                break;
              case CodePush.SyncStatus.INSTALLING_UPDATE:
                this.setState({
                  syncText: '安裝新的 Bunninn',
                  syncIndeterminate: true,
                });
                break;
              case CodePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({
                  syncText: '安裝完成，即將開始',
                  syncIndeterminate: true,
                });
                break;
              case CodePush.SyncStatus.UP_TO_DATE:
              case CodePush.SyncStatus.UNKNOWN_ERROR:
                this.setState({ isSync: false });
                break;
              case CodePush.SyncStatus.SYNC_IN_PROGRESS:
              default:
                console.log(status);
            }
          },
          ({ receivedBytes, totalBytes }) => {
            const percentage = Math.round(receivedBytes / totalBytes * 100);
            this.setState({
              syncText: `更新中 ${percentage}%`,
            });
          }
        );
      } catch (error) {
        this.setState({ isSync: false });
        console.error(error);
      }

      return false;
    });
  }

  componentDidMount() {
    Analytics.logAppOpen();
  }

  render() {
    const { isSync, syncText } = this.state;

    return (
      <View style={sh.viewport}>
        {isSync ?
          <View style={sh.progress}>
            <Spinner isVisible size={100} type="9CubeGrid" color={color.background} />
            <Text style={sh.progressText}>{syncText}</Text>
          </View>
          :
          <View style={sh.container}>
            <Enter />
          </View>
        }
      </View>
    );
  }
}

Message.addEventListener(Message.Event.REGISTERED, (data) => {
  console.log('REGISTERED', data);
});

Message.addEventListener(Message.Event.REMOTE_NOTIFICATION, (data) => {
  console.log('REMOTE_NOTIFICATION', data);
});
