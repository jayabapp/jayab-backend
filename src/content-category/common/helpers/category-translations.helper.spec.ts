import { Prisma } from '@prisma/client';
import { localizeTextFields } from 'src/common/helpers/title-translations.helper';
import { PLAN_TEXT_FIELDS } from 'src/subscription-plan/common/subscription-plan-translations.constant';
import { localizeCategory, withCategoryTranslations } from './category-translations.helper';

describe('content category and plan translations', () => {
  const contactUs = {
    id: 7,
    title: 'تماس با ما',
    description: 'از راه‌های زیر با ما در تماس باشید.',
    translations: {
      en: { title: 'Contact us', description: 'Reach us through any of these.' },
      ar: { title: 'اتصل بنا' },
    },
    parent: { title: 'صفحات', description: null, translations: { en: { title: 'Pages' } } },
  };

  it('swaps each translated field and keeps Persian where an edition is missing', () => {
    const arabic = localizeCategory(contactUs, 'ar');
    expect(arabic.title).toBe('اتصل بنا');
    expect(arabic.description).toBe(contactUs.description);
    expect(localizeCategory(contactUs, 'en').description).toBe('Reach us through any of these.');
    expect(localizeCategory(contactUs, 'en').parent.title).toBe('Pages');
    expect(JSON.stringify(localizeCategory(contactUs, 'en'))).not.toContain('translations');
  });

  it('leaves Persian readers and missing categories untouched', () => {
    expect(localizeCategory(contactUs, 'fa').title).toBe('تماس با ما');
    expect(localizeCategory(null, 'en')).toBeNull();
  });

  it('stores only filled editions, clears with an empty object and keeps them when not sent', () => {
    expect(
      withCategoryTranslations({
        title: 'x',
        translations: { en: { title: ' Contact ', description: '' }, ar: {} },
      }),
    ).toEqual({ title: 'x', translations: { en: { title: 'Contact' } } });
    expect(withCategoryTranslations({ title: 'x', translations: {} }).translations).toBe(Prisma.DbNull);
    const untouched: { title: string; translations?: undefined } = { title: 'x' };
    expect(withCategoryTranslations(untouched)).toEqual({ title: 'x' });
  });

  it('localizes plan title, description and ribbon for owners and advisors', () => {
    const plan = {
      id: 1,
      title: 'طلایی',
      description: 'سه ماه',
      ribbon_title: 'پیشنهاد ویژه',
      price: 100,
      translations: { en: { title: 'Gold', ribbon_title: 'Best value' } },
    };
    const english = localizeTextFields(plan, PLAN_TEXT_FIELDS, 'en');
    expect(english).toEqual({
      id: 1,
      title: 'Gold',
      description: 'سه ماه',
      ribbon_title: 'Best value',
      price: 100,
    });
  });
});
