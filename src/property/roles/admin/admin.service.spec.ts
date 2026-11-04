import { PropertyAdminService } from './admin.service';

describe('PropertyAdminService.updateTranslations', () => {
  const tx = {
    property: { update: jest.fn() },
    propertyDescription: { upsert: jest.fn() },
    propertyOwnerAssistant: { findFirst: jest.fn(), update: jest.fn() },
  };
  const db = {
    property: { findUnique: jest.fn() },
    $transaction: jest.fn((run: (client: typeof tx) => Promise<void>) => run(tx)),
  };

  let service: PropertyAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    db.property.findUnique.mockResolvedValue({ id: 7, code: '12345' });
    tx.propertyOwnerAssistant.findFirst.mockResolvedValue({ id: 3 });
    service = new PropertyAdminService(db as any, {} as any, {} as any, {} as any, {} as any);
  });

  it('writes corrected Persian text and keeps the slug in step with the title', async () => {
    await service.updateTranslations(7, {
      fa: { title: 'ویلا ساحلی', address: '', host_name: 'علی', descriptions: { property_dscr: 'متن', ad_dscr: '' } },
    });

    const propertyData = tx.property.update.mock.calls[0][0].data;
    expect(propertyData.title).toBe('ویلا ساحلی');
    expect(propertyData.slug).toMatch(/^12345-/);
    expect(propertyData).not.toHaveProperty('address');
    expect(tx.propertyDescription.upsert.mock.calls[0][0].update).toEqual({ property_dscr: 'متن', ad_dscr: null });
    expect(tx.propertyOwnerAssistant.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { assistant_full_name: 'علی' },
    });
  });

  it('leaves the Persian originals alone when only translations are sent', async () => {
    await service.updateTranslations(7, { descriptions: { en: { property_dscr: 'Text' } } });

    expect(tx.property.update.mock.calls[0][0].data).toEqual({});
    expect(Object.keys(tx.propertyDescription.upsert.mock.calls[0][0].update)).toEqual(['translations']);
    expect(tx.propertyOwnerAssistant.update).not.toHaveBeenCalled();
  });
});
