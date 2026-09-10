'use strict';

const {
  mergePartialPayloadIntoExisting,
} = require('../../../helpers/cms-bulk-upsert.helper');

describe('cms-bulk-upsert.helper', () => {
  it('mergePartialPayloadIntoExisting keeps existing fields when patch is empty', () => {
    const existing = {
      _id: 'abc',
      title: 'Old title',
      description: 'Keep me',
      product_ref: { uid: '1', slug: 'sku-a', name: 'A' },
      company_id: '95',
    };
    const patch = { title: 'New title' };
    const merged = mergePartialPayloadIntoExisting(existing, patch);
    expect(merged.title).toBe('New title');
    expect(merged.description).toBe('Keep me');
    expect(merged.product_ref.slug).toBe('sku-a');
    expect(merged._id).toBeUndefined();
  });

  it('mergePartialPayloadIntoExisting skips empty patch values', () => {
    const existing = { title: 'Old', hero: 'https://cdn/a.jpg' };
    const patch = { title: '', hero: null, subtitle: undefined };
    const merged = mergePartialPayloadIntoExisting(existing, patch);
    expect(merged.title).toBe('Old');
    expect(merged.hero).toBe('https://cdn/a.jpg');
    expect(merged.subtitle).toBeUndefined();
  });
});
