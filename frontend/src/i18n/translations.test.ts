import { describe, it, expect } from 'vitest';
import { translations, getTranslation, getUnitLabel, getCategoryLabel } from './translations';

describe('Bilingual Translation System (English & Hindi)', () => {
  it('contains matching keys across English and Hindi dictionaries', () => {
    const enKeys = Object.keys(translations.en);
    const hiKeys = Object.keys(translations.hi);

    enKeys.forEach(k => {
      expect(hiKeys).toContain(k);
      const enVal = translations.en[k as keyof typeof translations.en];
      const hiVal = translations.hi[k as keyof typeof translations.hi];
      expect(enVal).toBeTruthy();
      expect(hiVal).toBeTruthy();
    });
  });

  it('correctly interpolates named dynamic parameters', () => {
    const textEn = getTranslation('en', 'addedStockSuccess', {
      product: 'Atta',
      qty: 10,
      unit: 'pkt'
    });
    expect(textEn).toBe('Successfully added 10 pkt to Atta!');

    const textHi = getTranslation('hi', 'addedStockSuccess', {
      product: 'आटा',
      qty: 10,
      unit: 'पैकेट'
    });
    expect(textHi).toBe('आटा में 10 पैकेट स्टॉक सफलतापूर्वक जुड़ गया!');
  });

  it('translates all Kirana retail units correctly', () => {
    expect(getUnitLabel('en', 'kg')).toBe('kg');
    expect(getUnitLabel('hi', 'kg')).toBe('किलो');

    expect(getUnitLabel('en', 'packet')).toBe('pkt');
    expect(getUnitLabel('hi', 'packet')).toBe('पैकेट');

    expect(getUnitLabel('hi', 'bottle')).toBe('बोतल');
    expect(getUnitLabel('hi', 'piece')).toBe('नग');
  });

  it('translates all store categories correctly', () => {
    expect(getCategoryLabel('en', 'grocery')).toBe('Grocery & Staples');
    expect(getCategoryLabel('hi', 'grocery')).toBe('किराना व अनाज');
    expect(getCategoryLabel('hi', 'snacks')).toBe('नमकीन व बिस्कुट');
    expect(getCategoryLabel('hi', 'dairy')).toBe('डेयरी व बेकरी');
  });
});
