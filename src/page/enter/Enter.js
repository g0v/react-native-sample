import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CodePush from 'react-native-code-push';
import Cropper from 'react-native-cropper';

const sh = StyleSheet.create({
  viewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class extends Component {

  componentDidMount() {
    if (!__DEV__) CodePush.notifyAppReady();
  }

  onPressButton = async () => {
    const data = await Cropper.getPhotoFromAlbum({ size: { width: 512, height: 512 } });
    console.log(data);
  }

  navigator = null;

  render() {
    return (
      <View style={sh.viewport}>
        <TouchableOpacity onPress={this.onPressButton}>
          <Text>Hello Bunninn</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
