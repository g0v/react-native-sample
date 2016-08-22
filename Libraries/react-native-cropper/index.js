import { NativeModules } from 'react-native';

const { RNCropper } = NativeModules;

console.log('RNCropper', RNCropper);

export default class {

  size = { width: 512, height: 512 };

  static TOCropViewControllerAspectRatioPresetOriginal
  static async getPhotoFromAlbum(params) {
    return RNCropper.getPhotoFromAlbum(params);
  }

  static async getPhotoFromCamera(params) {
    return RNCropper.getPhotoFromAlbum(params);
  }
}
