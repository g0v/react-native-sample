import { Analytics, Crash } from 'react-native-bridge-firebase';
import moment from 'moment-timezone';
import _ from 'lodash';

const { Event } = Analytics;

const tz = 'Asia/taipei';

class AnalyticsModel {

  name = 'Analytics';

  constructor() {
    if (__DEV__) this.disable();
  }

  disabled = false;

  disable() {
    this.disabled = true;
    Analytics.setEnabled(false);
  }

  setUserId(userId) {
    Analytics.setUserId(userId);
  }

  setUserProperty(name, value) {
    Analytics.setUserProperty(name, value);
  }

  logScreen(name) {
    if (this.disabled || _.isUndefined(name)) return;
    Analytics.logEvent(Event.VIEW_SCREEN, { item_id: _.toString(name) });
  }

  logAppOpen() {
    if (this.disabled) return;
    Analytics.logEvent(Event.APP_OPEN);
  }

  logSelect(type, id) {
    if (this.disabled || _.isUndefined(type) || _.isUndefined(id)) return;
    Analytics.logEvent(Event.SELECT_CONTENT, {
      content_type: _.toString(type),
      item_id: _.toString(id),
    });
  }

  logSearch(keyword, { type, area, start, end } = {}) {
    if (this.disabled || _.isUndefined(keyword)) return;
    Analytics.logEvent(Event.SEARCH, {
      search_term: _.toString(keyword),
      travel_class: _.toString(type || 'all'),
      destination: _.toString(area || 'all'),
      start_date: start ? moment(start).tz(tz).format() : 'any',
      end_date: end ? moment(end).tz(tz).format() : 'any',
    });
  }

  logWishlist(category, id, { name, location } = {}) {
    if (this.disabled || _.isUndefined(category) || _.isUndefined(id)) return;
    Analytics.logEvent(Event.ADD_TO_WISHLIST, {
      item_category: _.toString(category),
      item_id: _.toString(id),
      item_name: _.toString(name || id),
      quantity: 1,
      item_location_id: location ? JSON.stringify(location) : undefined,
    });
  }

  logCheckout(id, value, {
    start,
    end,
    type,
    currency,
    passenger,
    buyerArea,
    serviceArea,
  } = {}) {
    if (this.disabled || _.isUndefined(id) || _.isUndefined(value)) return;
    Analytics.logEvent(Event.BEGIN_CHECKOUT, {
      transaction_id: _.toString(id),
      value: _.toNumber(value),
      start_date: start ? moment(start).tz(tz).format() : undefined,
      end_date: end ? moment(end).tz(tz).format() : undefined,
      currency: _.toString(currency || 'TWD'),
      number_of_passengers: _.toNumber(passenger) || 1,
      origin: buyerArea ? _.toString(buyerArea) : undefined,
      destination: serviceArea ? _.toString(serviceArea) : undefined,
      travel_class: type ? _.toString(type) : undefined,
    });
  }

  logPurchase(id, value, {
    currency,
    fee,
    cost,
    coupon,
    start,
    end,
    location,
    passenger,
    buyerArea,
    serviceArea,
    type,
  } = {}) {
    if (this.disabled || _.isUndefined(id) || _.isUndefined(value)) return;
    Analytics.logEvent(Event.ECOMMERCE_PURCHASE, {
      transaction_id: _.toString(id),
      value: _.toNumber(value),
      currency: _.toString(currency || 'TWD'),
      tax: _.toNumber(fee) || 0,
      shipping: _.toNumber(cost) || 0,
      coupon: coupon ? _.toString(coupon) : undefined,
      start_date: start ? moment(start).tz(tz).format() : undefined,
      end_date: end ? moment(end).tz(tz).format() : undefined,
      location: location ? JSON.stringify(location) : undefined,
      number_of_passengers: _.toInteger(passenger) || 1,
      origin: buyerArea ? _.toString(buyerArea) : undefined,
      destination: serviceArea ? _.toString(serviceArea) : undefined,
      travel_class: type ? _.toString(type) : undefined,
    });
  }

  logRefund(id, value, currency = 'TWD') {
    if (this.disabled || _.isUndefined(id) || _.isUndefined(value)) return;
    Analytics.logEvent(Event.PURCHASE_REFUND, {
      transaction_id: _.toString(id),
      value: _.toNumber(value),
      currency: _.toString(currency),
    });
  }

  logException(error) {
    if (this.disabled || _.isUndefined(error)) return;
    Crash.report(_.isError(error) ? error.message : _.toString(error));
  }
}

export default new AnalyticsModel();
