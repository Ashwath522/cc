'use strict';
const _ = require('lodash');

const keys = ['limit', 'offset', 'page', 'page_size', 'page_no'];
exports.paginateMap = function paginateMap(obj) {
  if (!obj) {
    return {};
  }
  if (_.isString(obj)) {
    obj = JSON.parse(obj);
  }
  if (!Object.keys(obj).length) {
    return {};
  }
  _.forEach(keys, (k) => {
    if (obj[k]) {
      obj[k] = Number(obj[k]);
    }
    if (obj.hasOwnProperty('page_no')) {
      obj['page'] = Number(obj['page_no']);
    }
    if (obj.hasOwnProperty('page_size')) {
      obj['limit'] = Number(obj['page_size']);
    }
  });
  return obj;
};

exports.paginateRes = function paginateRes(res = {}) {
  return {
    items: res.docs || [],
    page: {
      type: 'number',
      current: res.page || 1,
      size: res.limit || 10,
      item_total: res.total || 0,
      has_next: res.page < res.total / res.limit ? true : false,
    },
  };
};
