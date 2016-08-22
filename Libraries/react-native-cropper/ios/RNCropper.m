#import "RNCropper.h"

#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"

#import "TOCropViewController.h"

@interface RNCropper () <UINavigationControllerDelegate,UIImagePickerControllerDelegate, TOCropViewControllerDelegate>

@end

NSString *const RCT_ERROR_USER_CANCELED = @"RCT_ERROR_USER_CANCELED";
NSString *const RCT_ERROR_UNKNOWN = @"RCT_ERROR_UNKNOWN";
NSString *const RCT_ERROR_PERMISSIONS_MISSING = @"RCT_ERROR_PERMISSIONS_MISSING";

@implementation RNCropper
{
    RCTPromiseResolveBlock _getPhotoResolver;
    RCTPromiseRejectBlock _getPhotoRejecter;
}

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSDictionary *)constantsToExport
{
    return @{
             @"ERROR_USER_CANCELED": RCT_ERROR_USER_CANCELED,
             @"ERROR_UNKNOWN": RCT_ERROR_UNKNOWN,
             @"ERROR_PERMISSIONS_MISSING": RCT_ERROR_PERMISSIONS_MISSING
             }
}

- (UIViewController*) getRootViewController {
    UIViewController *root = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
    while (root.presentedViewController != nil) {
        root = root.presentedViewController;
    }

    return root;
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage *)image editingInfo:(NSDictionary *)editingInfo
{
    TOCropViewController *cropController = [[TOCropViewController alloc] initWithCroppingStyle:TOCropViewCroppingStyleDefault image:image];
    [cropController setAspectRatioPreset:TOCropViewControllerAspectRatioPresetSquare animated: false];
    [cropController setAspectRatioLockEnabled:true];
    [cropController setResetAspectRatioEnabled:false];
    cropController.delegate = self;

    [picker dismissViewControllerAnimated:NO completion:^{
        [[self getRootViewController] presentViewController:cropController animated:YES completion:nil];
    }];
}

- (void)cropViewController:(TOCropViewController *)cropViewController didCropToImage:(UIImage *)image withRect:(CGRect)cropRect angle:(NSInteger)angle
{
    if (_getPhotoResolver != nil) {
        CGImageRef imageRef = CGImageCreateWithImageInRect([image CGImage], cropRect);
        UIImage *cropImage = [UIImage imageWithCGImage:imageRef];
        CGImageRelease(imageRef);
        NSData *data = UIImageJPEGRepresentation(cropImage, 1);
        _getPhotoResolver([data base64EncodedStringWithOptions:0]);
    }

    [cropViewController dismissViewControllerAnimated:YES completion:nil];
}

- (void)cropViewController:(TOCropViewController *)cropViewController didFinishCancelled:(BOOL)cancelle
{
    if (_getPhotoRejecter != nil) {
        NSError *error = nil;
        _getPhotoRejecter(RCT_ERROR_USER_CANCELED, @"User canceled on cropper", error);
    }

    [cropViewController dismissViewControllerAnimated:YES completion:nil];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    if (_getPhotoRejecter == nil) {
        NSError *error = nil;
        _getPhotoRejecter(RCT_ERROR_USER_CANCELED, @"User canceled on image picker", error);
    }

    [picker dismissViewControllerAnimated:YES completion:nil];
}

RCT_EXPORT_METHOD(getPhotoFromAlbum:(NSDictionary *)permissions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    picker.allowsEditing = NO;
    picker.delegate = self;

    _getPhotoResolver = resolve;
    _getPhotoRejecter = reject;

    [[self getRootViewController] presentViewController:picker animated:YES completion:nil];
}

RCT_EXPORT_METHOD(getPhotoFromCamera:(NSDictionary *)permissions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    picker.sourceType = UIImagePickerControllerSourceTypeCamera;
    picker.allowsEditing = NO;
    picker.delegate = self;

    _getPhotoResolver = resolve;
    _getPhotoRejecter = reject;

    [[self getRootViewController] presentViewController:picker animated:YES completion:nil];
}

@end
