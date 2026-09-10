'use strict';

const {
  resolveInstanceSlugSourceField,
  applyInstanceSlugToPayload,
  isDuplicateInstanceSlugError,
} = require('../../../helpers/dynamic-collection.helper');

describe('instance slug helpers', () => {
  const productDefinition = {
    slug: 'product-page',
    fields: [
      { name: 'title', field_type: 'text' },
      { name: 'product_ref', field_type: 'product', multiple: false },
    ],
  };

  const multiProductDefinition = {
    fields: [{ name: 'products', field_type: 'product', multiple: true }],
  };

  const collectionDefinition = {
    fields: [{ name: 'collection_ref', field_type: 'collection', multiple: false }],
  };

  it('resolveInstanceSlugSourceField picks first single product or collection field', () => {
    expect(resolveInstanceSlugSourceField(productDefinition)).toBe('product_ref');
    expect(resolveInstanceSlugSourceField(collectionDefinition)).toBe('collection_ref');
    expect(resolveInstanceSlugSourceField(multiProductDefinition)).toBeNull();
    expect(resolveInstanceSlugSourceField({ fields: [] })).toBeNull();
  });

  it('applyInstanceSlugToPayload copies relation slug and ignores user slug', () => {
    const payload = {
      title: 'Hero',
      product_ref: { uid: '123', slug: 'apollo-sofa', name: 'Apollo Sofa' },
      slug: 'user-slug',
    };
    applyInstanceSlugToPayload(payload, productDefinition);
    expect(payload.slug).toBe('apollo-sofa');
  });

  it('applyInstanceSlugToPayload leaves slug unset when relation has no slug', () => {
    const payload = {
      product_ref: { uid: '123', name: 'Apollo Sofa' },
    };
    applyInstanceSlugToPayload(payload, productDefinition);
    expect(payload.slug).toBeUndefined();
  });

  it('applyInstanceSlugToPayload is no-op when definition has no slug source', () => {
    const payload = { title: 'Only text' };
    applyInstanceSlugToPayload(payload, { fields: [{ name: 'title', field_type: 'text' }] });
    expect(payload.slug).toBeUndefined();
  });

  it('isDuplicateInstanceSlugError detects Mongo duplicate key on slug', () => {
    expect(isDuplicateInstanceSlugError({ code: 11000, message: 'dup key: slug_1' })).toBe(true);
    expect(isDuplicateInstanceSlugError({ code: 11000, message: 'other field' })).toBe(false);
    expect(isDuplicateInstanceSlugError(null)).toBe(false);
  });
});
