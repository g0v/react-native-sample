#import "RNBridgeFirebase.h"

#import "Firebase.h";
#import "DeviceModel.h";
#import "DeviceUID.h";

#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"

#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0

#define UIUserNotificationTypeAlert UIRemoteNotificationTypeAlert
#define UIUserNotificationTypeBadge UIRemoteNotificationTypeBadge
#define UIUserNotificationTypeSound UIRemoteNotificationTypeSound
#define UIUserNotificationTypeNone  UIRemoteNotificationTypeNone
#define UIUserNotificationType      UIRemoteNotificationType

#endif

NSString *const RCT_EVENT_REGISTER_SETTINGS = @"FirebaseRegisterSettings";
NSString *const RCT_EVENT_DEVICE_REGISTERED = @"FirebaseDeviceRegistered";
NSString *const RCT_EVENT_REGISTERED = @"FirebaseRegistered";
NSString *const RCT_EVENT_FAIL_TO_REGISTER = @"FirebaseFailToRegister";
NSString *const RCT_EVENT_REMOTE_NOTIFICATION_RECEIVED = @"FirebaseRemoteNotificationReceived";

NSString *const RCT_ERROR_UNABLE_TO_REQUEST_PERMISSION = @"ERROR_UNABLE_TO_REQUEST_PERMISSIONS";

@implementation RNBridgeFirebase
{
    RCTPromiseResolveBlock _requestPermissionsResolveBlock;
}

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}


- (void)startObserving
{
    // [START message observer]
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRegisterUserNotificationSettings:)
                                                 name:RCT_EVENT_REGISTER_SETTINGS
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleDeviceRegistered:)
                                                 name:RCT_EVENT_DEVICE_REGISTERED
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRegistered:)
                                                 name:kFIRInstanceIDTokenRefreshNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleFailToRemoteRegistered:)
                                                 name:RCT_EVENT_FAIL_TO_REGISTER
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRemoteNotificationReceived:)
                                                 name:RCT_EVENT_REMOTE_NOTIFICATION_RECEIVED
                                               object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleConnectMessage)
                                                 name:UIApplicationDidBecomeActiveNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleDisconnectMessage)
                                                 name:UIApplicationDidEnterBackgroundNotification
                                               object:nil];
    // [END message observer]
}

- (void)stopObserving
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[RCT_EVENT_DEVICE_REGISTERED,
             RCT_EVENT_REGISTERED,
             RCT_EVENT_FAIL_TO_REGISTER,
             RCT_EVENT_REMOTE_NOTIFICATION_RECEIVED];
}

- (NSDictionary *)constantsToExport
{
    NSString *firebaseToken = [[FIRInstanceID instanceID] token];

    return @{
             @"deviceToken": @"",
             @"firebaseToken": firebaseToken ? firebaseToken : @"",
             @"deviceModel": [DeviceModel name],
             @"deviceName": [[UIDevice currentDevice] name],
             @"deviceUid": [DeviceUID uid],
             @"appVersion": [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"],
             };
}

// [START message did_method]
+ (void)didRegisterUserNotificationSettings:(__unused UIUserNotificationSettings *)notificationSettings
{
    if ([UIApplication instancesRespondToSelector:@selector(registerForRemoteNotifications)]) {
        [[UIApplication sharedApplication] registerForRemoteNotifications];
        [[NSNotificationCenter defaultCenter] postNotificationName:RCT_EVENT_REGISTER_SETTINGS
                                                            object:self
                                                          userInfo:@{@"notificationSettings": notificationSettings}];
    }
}

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)token
{
    [[FIRInstanceID instanceID] setAPNSToken:token
                                        type:DEBUG ? FIRInstanceIDAPNSTokenTypeSandbox : FIRInstanceIDAPNSTokenTypeProd];

    NSString *deviceToken = [[token description] stringByTrimmingCharactersInSet: [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
    deviceToken = [deviceToken stringByReplacingOccurrencesOfString:@" " withString:@""];

    [[NSNotificationCenter defaultCenter] postNotificationName:RCT_EVENT_DEVICE_REGISTERED
                                                        object:self
                                                      userInfo:@{@"deviceToken" : deviceToken}];
}

+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    [[NSNotificationCenter defaultCenter] postNotificationName:RCT_EVENT_FAIL_TO_REGISTER
                                                        object:self
                                                      userInfo:error];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
{
    [[NSNotificationCenter defaultCenter] postNotificationName:RCT_EVENT_REMOTE_NOTIFICATION_RECEIVED
                                                        object:self
                                                      userInfo:notification];
}
// [END message did_method]

// [START message handler]
- (void)handleRegisterUserNotificationSettings:(NSNotification *)notification
{
    if (_requestPermissionsResolveBlock == nil) {
        return;
    }

    UIUserNotificationSettings *notificationSettings = notification.userInfo[@"notificationSettings"];
    NSDictionary *notificationTypes = @{
                                        @"alert": @((notificationSettings.types & UIUserNotificationTypeAlert) > 0),
                                        @"sound": @((notificationSettings.types & UIUserNotificationTypeSound) > 0),
                                        @"badge": @((notificationSettings.types & UIUserNotificationTypeBadge) > 0),
                                        };

    _requestPermissionsResolveBlock(notificationTypes);
    _requestPermissionsResolveBlock = nil;
}

- (void)handleDeviceRegistered:(NSNotification *)notification
{
    [self sendEventWithName:RCT_EVENT_DEVICE_REGISTERED body:notification.userInfo];
}

- (void)handleRegistered:(NSNotification *)notification
{
    NSString *firebaseToken = [[FIRInstanceID instanceID] token];

    [self sendEventWithName:RCT_EVENT_REGISTERED body:@{@"firebaseToken" : firebaseToken}];
}

- (void)handleFailToRemoteRegistered:(NSNotification *)notification
{
    [self sendEventWithName:RCT_EVENT_FAIL_TO_REGISTER body:notification.userInfo];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification
{
    [self sendEventWithName:RCT_EVENT_REMOTE_NOTIFICATION_RECEIVED body:notification.userInfo];
}

- (void)handleConnectMessage
{
    [[FIRMessaging messaging] connectWithCompletion:^(NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"Unable to connect to FCM. %@", error);
        } else {
            NSLog(@"Connected to FCM.");
        }
    }];
}

- (void)handleDisconnectMessage
{
    [[FIRMessaging messaging] disconnect];
    NSLog(@"Disconnected from FCM");
}
// [END message handler]

// [START message method]
RCT_EXPORT_METHOD(requestPermissions:(NSDictionary *)permissions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (RCTRunningInAppExtension()) {
        reject(RCT_ERROR_UNABLE_TO_REQUEST_PERMISSION, nil, RCTErrorWithMessage(@"Requesting push notifications is currently unavailable in an app extension"));
        return;
    }

    if (_requestPermissionsResolveBlock != nil) {
        RCTLogError(@"Cannot call requestPermissions twice before the first has returned.");
        return;
    }

    _requestPermissionsResolveBlock = resolve;

    UIUserNotificationType types = UIUserNotificationTypeNone;
    if (permissions) {
        if ([RCTConvert BOOL:permissions[@"alert"]]) {
            types |= UIUserNotificationTypeAlert;
        }
        if ([RCTConvert BOOL:permissions[@"badge"]]) {
            types |= UIUserNotificationTypeBadge;
        }
        if ([RCTConvert BOOL:permissions[@"sound"]]) {
            types |= UIUserNotificationTypeSound;
        }
    } else {
        types = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound;
    }

    UIApplication *app = RCTSharedApplication();
    if ([app respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        UIUserNotificationSettings *notificationSettings =
        [UIUserNotificationSettings settingsForTypes:(NSUInteger)types categories:nil];
        [app registerUserNotificationSettings:notificationSettings];
    } else {
        [app registerForRemoteNotificationTypes:(NSUInteger)types];
    }


    NSDictionary *notification = [self.bridge.launchOptions objectForKey: UIApplicationLaunchOptionsRemoteNotificationKey];

    if (notification) {
        [RNBridgeFirebase didReceiveRemoteNotification:notification];
    }
}

RCT_EXPORT_METHOD(subscribeToTopic: (NSString*) topic)
{
    [[FIRMessaging messaging] subscribeToTopic:topic];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic: (NSString*) topic)
{
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
}
// [END message method]

RCT_EXPORT_METHOD(reportCrash: (NSString*) message)
{
    FIRCrashLog(message);
}

RCT_EXPORT_METHOD(setUserId: (NSString*) userId)
{
    [FIRAnalytics setUserID:userId];
}

RCT_EXPORT_METHOD(setUserProperty: (NSString*)name property: (NSString*)property)
{
    [FIRAnalytics setUserPropertyString:property forName:name];
}

RCT_EXPORT_METHOD(logEvent: (NSString*)name property: (NSDictionary*)parameters)
{
    [FIRAnalytics logEventWithName:name parameters:parameters];
}

RCT_EXPORT_METHOD(setEnabled: (BOOL)enabled)
{
    [[FIRAnalyticsConfiguration sharedInstance] setAnalyticsCollectionEnabled:enabled];
}

@end
