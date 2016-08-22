#import "DeviceModel.h"

@implementation DeviceModel

+ (NSString*)name
{
    DeviceModelVersion version = (DeviceModelVersion)[[self.deviceNamesByCode objectForKey:[self deviceId]] integerValue];
    NSString* deviceName = DeviceModels[version];

    if (!deviceName) {
        if ([self.deviceId rangeOfString:@"iPod"].location != NSNotFound) {
            deviceName = @"iPod Touch";
        }
        else if([self.deviceId rangeOfString:@"iPad"].location != NSNotFound) {
            deviceName = @"iPad";
        }
        else if([self.deviceId rangeOfString:@"iPhone"].location != NSNotFound) {
            deviceName = @"iPhone";
        }
        else if([self.deviceId rangeOfString:@"AppleTV"].location != NSNotFound) {
            deviceName = @"Apple TV";
        }
        else{
            deviceName = @"Unknown";
        }
    }

    return deviceName;
}

+ (NSString*)deviceId
{
    struct utsname systemInfo;

    uname(&systemInfo);

    return [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding];
}

+ (NSDictionary*)deviceNamesByCode
{
    static NSDictionary *deviceNamesByCode = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        deviceNamesByCode = @{
                              //iPhones
                              @"iPhone3,1" : @(iPhone4),
                              @"iPhone3,2" : @(iPhone4),
                              @"iPhone3,3" : @(iPhone4),
                              @"iPhone4,1" : @(iPhone4S),
                              @"iPhone4,2" : @(iPhone4S),
                              @"iPhone4,3" : @(iPhone4S),
                              @"iPhone5,1" : @(iPhone5),
                              @"iPhone5,2" : @(iPhone5),
                              @"iPhone5,3" : @(iPhone5C),
                              @"iPhone5,4" : @(iPhone5C),
                              @"iPhone6,1" : @(iPhone5S),
                              @"iPhone6,2" : @(iPhone5S),
                              @"iPhone7,2" : @(iPhone6),
                              @"iPhone7,1" : @(iPhone6Plus),
                              @"iPhone8,1" : @(iPhone6S),
                              @"iPhone8,2" : @(iPhone6SPlus),
                              @"iPhone8,4" : @(iPhoneSE),
                              @"i386"      : @(Simulator),
                              @"x86_64"    : @(Simulator),

                              //iPads
                              @"iPad1,1" : @(iPad1),
                              @"iPad2,1" : @(iPad2),
                              @"iPad2,2" : @(iPad2),
                              @"iPad2,3" : @(iPad2),
                              @"iPad2,4" : @(iPad2),
                              @"iPad2,5" : @(iPadMini),
                              @"iPad2,6" : @(iPadMini),
                              @"iPad2,7" : @(iPadMini),
                              @"iPad3,1" : @(iPad3),
                              @"iPad3,2" : @(iPad3),
                              @"iPad3,3" : @(iPad3),
                              @"iPad3,4" : @(iPad4),
                              @"iPad3,5" : @(iPad4),
                              @"iPad3,6" : @(iPad4),
                              @"iPad4,1" : @(iPadAir),
                              @"iPad4,2" : @(iPadAir),
                              @"iPad4,3" : @(iPadAir),
                              @"iPad4,4" : @(iPadMini2),
                              @"iPad4,5" : @(iPadMini2),
                              @"iPad4,6" : @(iPadMini2),
                              @"iPad4,7" : @(iPadMini3),
                              @"iPad4,8" : @(iPadMini3),
                              @"iPad4,9" : @(iPadMini3),
                              @"iPad5,1" : @(iPadMini4),
                              @"iPad5,2" : @(iPadMini4),
                              @"iPad5,3" : @(iPadAir2),
                              @"iPad5,4" : @(iPadAir2),
                              @"iPad6,3" : @(iPadPro9Dot7Inch),
                              @"iPad6,4" : @(iPadPro9Dot7Inch),
                              @"iPad6,7" : @(iPadPro12Dot9Inch),
                              @"iPad6,8" : @(iPadPro12Dot9Inch),

                              //iPods
                              @"iPod1,1" : @(iPodTouch1Gen),
                              @"iPod2,1" : @(iPodTouch2Gen),
                              @"iPod3,1" : @(iPodTouch3Gen),
                              @"iPod4,1" : @(iPodTouch4Gen),
                              @"iPod5,1" : @(iPodTouch5Gen),
                              @"iPod7,1" : @(iPodTouch6Gen)};
    });

    return deviceNamesByCode;
}

@end
