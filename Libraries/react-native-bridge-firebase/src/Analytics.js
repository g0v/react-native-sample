/**
 * @providesModule react-native-bridge-firebase/Analytics
 */
import RNBridgeFirebase from './RNBridgeFirebase';

export default class {

  static Event = {
    ADD_PAYMENT_INFO: 'add_payment_info',               // Add Payment Info event.
    ADD_TO_CART: 'add_to_cart',                         // E-Commerce Add To Cart event.
    ADD_TO_WISHLIST: 'add_to_wishlist',                 // E-Commerce Add To Wishlist event.
    APP_OPEN: 'app_open',                               // App Open event.
    BEGIN_CHECKOUT: 'begin_checkout',                   // E-Commerce Begin Checkout event.
    ECOMMERCE_PURCHASE: 'ecommerce_purchase',           // E-Commerce Purchase event.
    GENERATE_LEAD: 'generate_lead',                     // Generate Lead event.
    JOIN_GROUP: 'join_group',                           // Join Group event.
    LEVEL_UP: 'level_up',                               // Level Up event.
    LOGIN: 'login',                                     // Login event.
    POST_SCORE: 'post_score',                           // Post Score event.
    PRESENT_OFFER: 'present_offer',                     // Present Offer event.
    PURCHASE_REFUND: 'purchase_refund',                 // E-Commerce Purchase Refund event.
    SEARCH: 'search',                                   // Search event.
    SELECT_CONTENT: 'select_content',	                  // Select Content event.
    SHARE: 'share',                                     // Share event.
    SIGN_UP: 'sign_up',                                 // Sign Up event.
    SPEND_VIRTUAL_CURRENCY: 'spend_virtual_currency',   // Spend Virtual Currency event.
    TUTORIAL_BEGIN: 'tutorial_begin',                   // Tutorial Begin event.
    TUTORIAL_COMPLETE: 'tutorial_complete',             // Tutorial End event.
    UNLOCK_ACHIEVEMENT: 'unlock_achievement',           // Unlock Achievement event.
    VIEW_ITEM: 'view_item',                             // View Item event.
    VIEW_ITEM_LIST: 'view_item_list',                   // View Item List event.
    VIEW_SEARCH_RESULTS: 'view_search_results',         // View Search Results event.

    // customize
    VIEW_SCREEN: 'view_screen',
  };

  static setUserId(userId) {
    RNBridgeFirebase.setUserId(userId);
  }

  static setUserProperty(name, property) {
    RNBridgeFirebase.setUserProperty(name, property);
  }

  static logEvent(name, parameters) {
    RNBridgeFirebase.logEvent(name, parameters);
  }

  static setEnabled(enabled) {
    RNBridgeFirebase.setEnabled(enabled);
  }
}
