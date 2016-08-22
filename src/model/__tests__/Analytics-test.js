jest.mock('react-native-bridge-firebase/Analytics');
jest.mock('react-native-bridge-firebase/Crash');
jest.mock('react-native-bridge-firebase/Message');

import faker from 'faker';
import moment from 'moment';
import _ from 'lodash';
import { Analytics, Crash } from 'react-native-bridge-firebase';
import AnalyticsModel from '../Analytics';

const { Event } = Analytics;
const tz = 'Asia/taipei';

faker.locale = 'zh_TW';

describe('Analytics Model', () => {
  it('constructor', () => {
    expect(AnalyticsModel.disabled).toBe(true);
  });

  it('disable', () => {
    AnalyticsModel.disabled = false;
    AnalyticsModel.disable();
    expect(AnalyticsModel.disabled).toBe(true);
    expect(Analytics.setEnabled).lastCalledWith(false);

    Analytics.logEvent.mockClear();
    AnalyticsModel.logScreen(faker.lorem.word());
    AnalyticsModel.logAppOpen();
    AnalyticsModel.logSearch(faker.lorem.word());
    AnalyticsModel.logWishlist(faker.lorem.word(), faker.random.number({ min: 1 }));
    AnalyticsModel.logCheckout(faker.random.number({ min: 1 }), faker.random.number({ min: 1 }));
    AnalyticsModel.logPurchase(faker.random.number({ min: 1 }), faker.random.number({ min: 1 }));
    AnalyticsModel.logRefund(faker.random.number({ min: 1 }), faker.random.number({ min: 1 }));
    AnalyticsModel.logException(faker.lorem.sentence());
    expect(Analytics.logEvent).not.toBeCalled();
    expect(Crash.report).not.toBeCalled();

    AnalyticsModel.disabled = false;
  });

  it('setUserId', () => {
    const userId = faker.random.number();
    AnalyticsModel.setUserId(userId);
    expect(Analytics.setUserId).lastCalledWith(userId);
  });

  it('setUserProperty', () => {
    const name = faker.lorem.word();
    const value = faker.lorem.word();
    AnalyticsModel.setUserProperty(name, value);
    expect(Analytics.setUserProperty).lastCalledWith(name, value);
  });

  it('logScreen', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logScreen();
    expect(Analytics.logEvent).not.toBeCalled();

    const name = faker.lorem.word();
    AnalyticsModel.logScreen(name);
    expect(Analytics.logEvent).lastCalledWith(Event.VIEW_SCREEN, {
      item_id: name,
    });
  });

  it('logAppOpen', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logAppOpen();
    expect(Analytics.logEvent).lastCalledWith(Event.APP_OPEN);
  });

  it('logSearch', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logSearch();
    expect(Analytics.logEvent).not.toBeCalled();

    const keyword1 = faker.lorem.words();
    AnalyticsModel.logSearch(keyword1);
    expect(Analytics.logEvent).lastCalledWith(Event.SEARCH, {
      search_term: keyword1,
      travel_class: 'all',
      destination: 'all',
      start_date: 'any',
      end_date: 'any',
    });

    const keyword2 = faker.lorem.words();
    const type = faker.lorem.word();
    const area = faker.lorem.word();
    const start = faker.date.recent();
    const end = faker.date.future();
    AnalyticsModel.logSearch(keyword2, { type, area, start, end });
    expect(Analytics.logEvent).lastCalledWith(Event.SEARCH, {
      search_term: keyword2,
      travel_class: type,
      destination: area,
      start_date: moment(start).tz(tz).format(),
      end_date: moment(end).tz(tz).format(),
    });
  });

  it('logWishlist', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logWishlist();
    expect(Analytics.logEvent).not.toBeCalled();

    AnalyticsModel.logWishlist(faker.lorem.word());
    expect(Analytics.logEvent).not.toBeCalled();

    const category1 = faker.lorem.word();
    const id1 = faker.random.number({ min: 1 });
    AnalyticsModel.logWishlist(category1, id1);
    expect(Analytics.logEvent).lastCalledWith(Event.ADD_TO_WISHLIST, {
      item_category: category1,
      item_id: _.toString(id1),
      item_name: _.toString(id1),
      quantity: 1,
      item_location_id: undefined,
    });

    const category2 = faker.lorem.word();
    const id2 = faker.random.number({ min: 1 });
    const name = faker.lorem.word();
    const location = {
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
    };
    AnalyticsModel.logWishlist(category2, id2, { name, location });
    expect(Analytics.logEvent).lastCalledWith(Event.ADD_TO_WISHLIST, {
      item_category: category2,
      item_id: _.toString(id2),
      item_name: name,
      quantity: 1,
      item_location_id: JSON.stringify(location),
    });
  });

  it('logCheckout', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logCheckout();
    expect(Analytics.logEvent).not.toBeCalled();

    AnalyticsModel.logCheckout(faker.random.number({ min: 1 }));
    expect(Analytics.logEvent).not.toBeCalled();

    const id1 = faker.random.number({ min: 1 });
    const value1 = faker.random.number({ min: 1 });
    AnalyticsModel.logCheckout(id1, value1);
    expect(Analytics.logEvent).lastCalledWith(Event.BEGIN_CHECKOUT, {
      transaction_id: _.toString(id1),
      value: value1,
      currency: 'TWD',
      number_of_passengers: 1,
    });

    const id2 = faker.random.number({ min: 1 });
    const value2 = faker.random.number({ min: 1 });
    const currency = faker.finance.currencyCode();
    const passenger = faker.random.number({ min: 1, max: 4 });
    const start = faker.date.recent();
    const end = faker.date.future();
    const buyerArea = faker.lorem.word();
    const serviceArea = faker.lorem.word();
    const type = faker.lorem.word();
    AnalyticsModel.logCheckout(id2, value2, {
      currency, passenger, start, end, buyerArea, serviceArea, type,
    });

    expect(Analytics.logEvent).lastCalledWith(Event.BEGIN_CHECKOUT, {
      transaction_id: _.toString(id2),
      value: value2,
      currency,
      number_of_passengers: passenger,
      start_date: moment(start).tz(tz).format(),
      end_date: moment(end).tz(tz).format(),
      origin: buyerArea,
      destination: serviceArea,
      travel_class: type,
    });
  });

  it('logPurchase', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logPurchase();
    expect(Analytics.logEvent).not.toBeCalled();

    AnalyticsModel.logPurchase(faker.random.number({ min: 1 }));
    expect(Analytics.logEvent).not.toBeCalled();

    const id1 = faker.random.number({ min: 1 });
    const value1 = faker.random.number({ min: 1 });
    AnalyticsModel.logPurchase(id1, value1);
    expect(Analytics.logEvent).lastCalledWith(Event.ECOMMERCE_PURCHASE, {
      transaction_id: _.toString(id1),
      value: value1,
      currency: 'TWD',
      tax: 0,
      shipping: 0,
      number_of_passengers: 1,
    });

    const id2 = faker.random.number({ min: 1 });
    const value2 = faker.random.number({ min: 1 });
    const currency = faker.finance.currencyCode();
    const fee = faker.random.number({ min: 1 });
    const cost = faker.random.number({ min: 1 });
    const coupon = faker.lorem.word();
    const location = {
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
    };
    const passenger = faker.random.number({ min: 1, max: 4 });
    const start = faker.date.recent();
    const end = faker.date.future();
    const buyerArea = faker.lorem.word();
    const serviceArea = faker.lorem.word();
    const type = faker.lorem.word();
    AnalyticsModel.logPurchase(id2, value2, {
      currency, fee, cost, coupon, location, passenger, start, end, buyerArea, serviceArea, type,
    });

    expect(Analytics.logEvent).lastCalledWith(Event.ECOMMERCE_PURCHASE, {
      transaction_id: _.toString(id2),
      value: value2,
      tax: fee,
      shipping: cost,
      currency,
      coupon,
      start_date: moment(start).tz(tz).format(),
      end_date: moment(end).tz(tz).format(),
      location: JSON.stringify(location),
      number_of_passengers: passenger,
      origin: buyerArea,
      destination: serviceArea,
      travel_class: type,
    });
  });

  it('logRefund', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logRefund();
    expect(Analytics.logEvent).not.toBeCalled();

    AnalyticsModel.logRefund(faker.random.number({ min: 1 }));
    expect(Analytics.logEvent).not.toBeCalled();

    const id = faker.random.number({ min: 1 });
    const value = faker.random.number({ min: 1 });
    const currency = faker.finance.currencyCode();

    AnalyticsModel.logRefund(id, value, currency);
    expect(Analytics.logEvent).lastCalledWith(Event.PURCHASE_REFUND, {
      transaction_id: _.toString(id),
      value,
      currency,
    });
  });

  it('logException', () => {
    Analytics.logEvent.mockClear();

    AnalyticsModel.logException();
    expect(Crash.report).not.toBeCalled();

    const error = faker.lorem.sentence();

    AnalyticsModel.logException(error);
    expect(Crash.report).lastCalledWith(error);

    AnalyticsModel.logException(new Error(error));
    expect(Crash.report).lastCalledWith(error);

    expect(Crash.report.mock.calls.length).toBe(2);
  });
});
