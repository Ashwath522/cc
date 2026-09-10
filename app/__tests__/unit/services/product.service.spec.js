'use strict';

jest.mock('../../../fdk', () => ({
  fdkExtension: {
    getPlatformClient: jest.fn(),
    getApplicationClient: jest.fn(),
  },
}));

const { getProductsBySKUs, getProductsBySKUsInBatches, catalogItemToProductRef } = require('../../../routes/services/product.service');
const { fdkExtension } = require('../../../fdk');

describe('product.service SKU batch lookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fdkExtension.getPlatformClient.mockResolvedValue({
      catalog: {
        getProducts: jest.fn(),
      },
    });
  });

  it('getProductsBySKUs calls catalog with itemCode array', async () => {
    const client = await fdkExtension.getPlatformClient('95');
    client.catalog.getProducts.mockResolvedValue({ items: [] });
    await getProductsBySKUs({ skus: ['A', 'B'], companyId: '95' });
    expect(client.catalog.getProducts).toHaveBeenCalledWith({
      itemCode: ['A', 'B'],
      pageSize: 2,
    });
  });

  it('getProductsBySKUsInBatches chunks requests and maps by item_code', async () => {
    const client = await fdkExtension.getPlatformClient('95');
    client.catalog.getProducts
      .mockResolvedValueOnce({
        items: [
          { uid: 1, item_code: 'SKU-0', slug: 'p0', name: 'P0' },
          { uid: 2, item_code: 'SKU-1', slug: 'p1', name: 'P1' },
        ],
      })
      .mockResolvedValueOnce({
        items: [{ uid: 3, item_code: 'SKU-2', slug: 'p2', name: 'P2' }],
      });

    const map = await getProductsBySKUsInBatches({
      skus: ['SKU-0', 'SKU-1', 'SKU-2'],
      companyId: '95',
      batchSize: 2,
    });

    expect(client.catalog.getProducts).toHaveBeenCalledTimes(2);
    expect(map.get('sku-0').uid).toBe(1);
    expect(map.get('sku-2').uid).toBe(3);
  });

  it('catalogItemToProductRef normalizes catalog item', () => {
    const ref = catalogItemToProductRef({
      uid: 7535049,
      category_slug: 'fabric-sofas',
      name: 'Apollo Sofa',
    });
    expect(ref.uid).toBe('7535049');
    expect(ref.slug).toBe('fabric-sofas');
    expect(ref.name).toBe('Apollo Sofa');
  });
});
