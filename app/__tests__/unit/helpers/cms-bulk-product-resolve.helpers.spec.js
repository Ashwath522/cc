'use strict';

jest.mock('../../../routes/services/product.service', () => ({
  getProductsBySKUsInBatches: jest.fn(),
  catalogItemToProductRef: (item) => {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const uid = item.uid != null ? String(item.uid) : '';
    return {
      uid,
      slug: item.slug || item.category_slug || '',
      name: item.name || '',
      id: uid || undefined,
    };
  },
}));

const {
  parseProductCellTokens,
  collectProductSkusFromRows,
  resolveProductFieldsOnPayload,
} = require('../../../helpers/cms-bulk-product-resolve.helper');

describe('cms-bulk-product-resolve.helper', () => {
  const singleProductField = { name: 'featured_product', field_type: 'product', multiple: false };
  const multiProductField = { name: 'products', field_type: 'product', multiple: true };
  const definition = {
    fields: [singleProductField, multiProductField],
  };

  it('parseProductCellTokens splits comma-separated SKUs', () => {
    expect(parseProductCellTokens('SKU-1, SKU-2', multiProductField)).toEqual(['SKU-1', 'SKU-2']);
    expect(parseProductCellTokens('ABC123', singleProductField)).toBe('ABC123');
  });

  it('parseProductCellTokens parses JSON product references', () => {
    const json = '{"uid":"1","slug":"s","name":"N"}';
    expect(parseProductCellTokens(json, singleProductField)).toEqual({
      uid: '1',
      slug: 's',
      name: 'N',
    });
  });

  it('collectProductSkusFromRows dedupes SKUs across rows', () => {
    const rows = [
      { featured_product: 'SKU-A', products: 'SKU-B,SKU-C' },
      { featured_product: 'sku-a', products: 'SKU-D' },
    ];
    const skus = collectProductSkusFromRows(rows, definition);
    expect([...skus].sort()).toEqual(['SKU-A', 'SKU-B', 'SKU-C', 'SKU-D', 'sku-a']);
  });

  it('resolveProductFieldsOnPayload maps SKUs to product refs', () => {
    const productSkuMap = new Map([
      [
        'sku-a',
        { uid: 100, slug: 'product-a', name: 'Product A', item_code: 'SKU-A' },
      ],
    ]);
    const payload = { featured_product: 'SKU-A' };
    resolveProductFieldsOnPayload({ payload, definition, productSkuMap });
    expect(payload.featured_product).toEqual({
      uid: '100',
      slug: 'product-a',
      name: 'Product A',
      id: '100',
    });
  });

  it('resolveProductFieldsOnPayload fails when SKU is missing', () => {
    const payload = { featured_product: 'MISSING' };
    expect(() =>
      resolveProductFieldsOnPayload({
        payload,
        definition,
        productSkuMap: new Map(),
      }),
    ).toThrow("Product SKU 'MISSING' not found");
  });
});
