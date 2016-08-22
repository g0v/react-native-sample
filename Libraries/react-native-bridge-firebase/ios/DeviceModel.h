#import <Foundation/Foundation.h>
#import <sys/utsname.h>

typedef NS_ENUM(NSInteger, DeviceModelVersion){
    iPhone4           = 3,
    iPhone4S          = 4,
    iPhone5           = 5,
    iPhone5C          = 6,
    iPhone5S          = 7,
    iPhone6           = 8,
    iPhone6Plus       = 9,
    iPhone6S          = 10,
    iPhone6SPlus      = 11,
    iPhoneSE          = 12,

    iPad1             = 13,
    iPad2             = 14,
    iPadMini          = 15,
    iPad3             = 16,
    iPad4             = 17,
    iPadAir           = 18,
    iPadMini2         = 19,
    iPadAir2          = 20,
    iPadMini3         = 21,
    iPadMini4         = 22,
    iPadPro12Dot9Inch = 23,
    iPadPro9Dot7Inch  = 24,

    iPodTouch1Gen     = 25,
    iPodTouch2Gen     = 26,
    iPodTouch3Gen     = 27,
    iPodTouch4Gen     = 28,
    iPodTouch5Gen     = 29,
    iPodTouch6Gen     = 30,

    Simulator         =  0
};

static NSString *DeviceModels[] = {
    [iPhone4]           = @"iPhone 4",
    [iPhone4S]          = @"iPhone 4S",
    [iPhone5]           = @"iPhone 5",
    [iPhone5C]          = @"iPhone 5C",
    [iPhone5S]          = @"iPhone 5S",
    [iPhone6]           = @"iPhone 6",
    [iPhone6Plus]       = @"iPhone 6 Plus",
    [iPhone6S]          = @"iPhone 6S",
    [iPhone6SPlus]      = @"iPhone 6S Plus",
    [iPhoneSE]          = @"iPhone SE",

    [iPad1]             = @"iPad 1",
    [iPad2]             = @"iPad 2",
    [iPadMini]          = @"iPad Mini",
    [iPad3]             = @"iPad 3",
    [iPad4]             = @"iPad 4",
    [iPadAir]           = @"iPad Air",
    [iPadMini2]         = @"iPad Mini 2",
    [iPadAir2]          = @"iPad Air 2",
    [iPadMini3]         = @"iPad Mini 3",
    [iPadMini4]         = @"iPad Mini 4",
    [iPadPro9Dot7Inch]  = @"iPad Pro",
    [iPadPro12Dot9Inch] = @"iPad Pro",

    [iPodTouch1Gen]     = @"iPod Touch 1st Gen",
    [iPodTouch2Gen]     = @"iPod Touch 2nd Gen",
    [iPodTouch3Gen]     = @"iPod Touch 3rd Gen",
    [iPodTouch4Gen]     = @"iPod Touch 4th Gen",
    [iPodTouch5Gen]     = @"iPod Touch 5th Gen",
    [iPodTouch6Gen]     = @"iPod Touch 6th Gen",

    [Simulator]         = @"Simulator"
};

@interface DeviceModel : NSObject
+ (NSString *)name;
@end
