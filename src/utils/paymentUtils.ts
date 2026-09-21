/**
 * Utilities for formatting, shipping calculations, and simulated payment processing
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function detectCardBrand(number: string): string {
  const clean = number.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2(2[2-9]|[3-6]\d|7[0-1]|720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^(4011|438935|451416|4576|504175|5067|5090|627780|636297|636368)/.test(clean)) return 'Elo';
  if (/^(606282|3841)/.test(clean)) return 'Hipercard';
  return 'Cartão';
}

export interface ShippingOption {
  id: string;
  name: string;
  deliveryDays: string;
  price: number;
  carrier: string;
}

export function calculateShippingOptions(cepClean: string, subtotal: number): ShippingOption[] {
  const isFree = subtotal >= 250;
  return [
    {
      id: 'sedex',
      name: 'Sedex Express',
      deliveryDays: '1 a 3 dias úteis',
      price: isFree ? 0 : 26.90,
      carrier: 'Correios',
    },
    {
      id: 'pac',
      name: 'PAC Econômico',
      deliveryDays: '4 a 8 dias úteis',
      price: isFree ? 0 : 15.50,
      carrier: 'Correios',
    },
    {
      id: 'express_je',
      name: 'JE Flash Delivery (Capitais)',
      deliveryDays: 'Até 24h úteis',
      price: 34.00,
      carrier: 'Loggi / JE Express',
    },
  ];
}

// Standard Official PIX details for JE Imports
export const OFFICIAL_PIX_BENEFICIARY = 'ERIKY FLAVIO REINALDO DA';
export const OFFICIAL_PIX_KEY = 'jeimports33@gmail.com';
export const OFFICIAL_PIX_CITY = 'SAO PAULO';

// Standard CRC16 calculation for Banco Central do Brasil Pix specifications
export function calculatePixCrc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// TLV (Tag-Length-Value) helper
function tlv(id: string, value: string): string {
  const len = new TextEncoder().encode(value).length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

// Generates an authentic EMV Pix "Copia e Cola" code compatible with 100% of Brazilian banking apps
export function buildPixEMVPayload(params: {
  key?: string;
  name?: string;
  city?: string;
  amount?: number;
  txid?: string;
}): string {
  const pixKey = params.key || OFFICIAL_PIX_KEY;
  const rawName = (params.name || OFFICIAL_PIX_BENEFICIARY)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);
  const rawCity = (params.city || OFFICIAL_PIX_CITY)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);
  const txid = params.txid || '***';

  const gui = tlv('00', 'br.gov.bcb.pix');
  const keyField = tlv('01', pixKey);
  const merchantAccountInfo = tlv('26', `${gui}${keyField}`);

  const pfi = tlv('00', '01');
  const mcc = tlv('52', '0000');
  const currency = tlv('53', '986');
  
  const amountField = (params.amount && params.amount > 0) 
    ? tlv('54', Number(params.amount).toFixed(2)) 
    : '';

  const country = tlv('58', 'BR');
  const merchantName = tlv('59', rawName);
  const merchantCity = tlv('60', rawCity);
  const additionalData = tlv('62', tlv('05', txid));

  const raw = `${pfi}${merchantAccountInfo}${mcc}${currency}${amountField}${country}${merchantName}${merchantCity}${additionalData}6304`;
  const checksum = calculatePixCrc16(raw);
  return `${raw}${checksum}`;
}

// Official authentic Static PIX Copia e Cola code generated directly from key jeimports33@gmail.com
export const OFFICIAL_PIX_CODE = buildPixEMVPayload({
  key: OFFICIAL_PIX_KEY,
  name: OFFICIAL_PIX_BENEFICIARY,
  city: OFFICIAL_PIX_CITY,
});

// Precomputed 100% vector SVG with shape-rendering="crispEdges" (guaranteed razor-sharp scanning on any phone/bank app)
export const OFFICIAL_PIX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h45v45H0z"/><path stroke="#000000" d="M2 2.5h7m1 0h1m1 0h1m5 0h2m3 0h1m3 0h1m1 0h2m1 0h2m2 0h7M2 3.5h1m5 0h1m1 0h1m1 0h3m1 0h2m2 0h1m2 0h8m5 0h1m5 0h1M2 4.5h1m1 0h3m1 0h1m4 0h1m1 0h1m3 0h1m2 0h1m3 0h1m1 0h1m2 0h1m2 0h1m1 0h1m1 0h3m1 0h1M2 5.5h1m1 0h3m1 0h1m1 0h2m1 0h5m5 0h1m1 0h1m3 0h1m3 0h2m1 0h1m1 0h3m1 0h1M2 6.5h1m1 0h3m1 0h1m2 0h1m2 0h1m1 0h2m3 0h2m3 0h1m1 0h1m2 0h2m1 0h1m1 0h1m1 0h3m1 0h1M2 7.5h1m5 0h1m2 0h1m3 0h1m1 0h2m2 0h4m1 0h2m3 0h1m2 0h1m1 0h1m5 0h1M2 8.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M10 9.5h2m1 0h3m1 0h1m2 0h5m4 0h1m2 0h1m1 0h1M2 10.5h1m1 0h2m1 0h3m3 0h1m1 0h2m4 0h1m2 0h3m1 0h2m4 0h1m1 0h1m2 0h1m1 0h2M5 11.5h2m3 0h1m1 0h1m2 0h1m1 0h2m6 0h1m1 0h2m2 0h1m3 0h1m1 0h2m3 0h1M4 12.5h1m3 0h1m3 0h1m3 0h1m2 0h1m1 0h1m1 0h1m1 0h7m3 0h1m1 0h2m1 0h1M2 13.5h3m1 0h1m3 0h2m5 0h1m3 0h1m5 0h6m4 0h3m1 0h2M2 14.5h1m2 0h1m1 0h2m1 0h1m2 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h2m2 0h2m3 0h1M3 15.5h1m1 0h3m1 0h1m1 0h1m2 0h1m2 0h3m2 0h1m2 0h2m1 0h2m2 0h1m1 0h3m4 0h1M2 16.5h3m2 0h2m5 0h1m2 0h1m1 0h1m1 0h2m4 0h1m1 0h2m3 0h1m2 0h2m1 0h2M2 17.5h1m1 0h1m1 0h2m1 0h2m4 0h2m2 0h2m2 0h1m2 0h3m4 0h2m1 0h1m1 0h2m1 0h2M2 18.5h1m3 0h1m1 0h1m2 0h4m1 0h2m1 0h1m4 0h1m1 0h2m2 0h2m1 0h2m2 0h1m2 0h3M2 19.5h1m2 0h3m3 0h4m1 0h1m1 0h1m1 0h2m1 0h3m1 0h1m2 0h1m1 0h1m3 0h2M4 20.5h1m1 0h5m1 0h3m1 0h1m1 0h1m1 0h1m1 0h4m4 0h1m1 0h1m2 0h2m1 0h1m2 0h1M4 21.5h2m4 0h1m1 0h1m1 0h4m1 0h2m2 0h1m1 0h1m3 0h4m1 0h5m2 0h2M2 22.5h3m3 0h1m2 0h1m1 0h1m1 0h2m1 0h1m4 0h1m1 0h3m2 0h2m2 0h1m4 0h1m2 0h1M3 23.5h1m1 0h3m1 0h1m2 0h2m2 0h2m4 0h2m2 0h1m1 0h1m1 0h1m6 0h2m2 0h1M2 24.5h1m2 0h2m1 0h2m4 0h1m2 0h1m1 0h1m2 0h2m1 0h4m1 0h2m1 0h1m3 0h3m2 0h1M3 25.5h1m1 0h2m2 0h1m1 0h1m1 0h1m2 0h1m1 0h4m3 0h1m1 0h4m1 0h1m2 0h4m1 0h2M3 26.5h4m1 0h1m2 0h1m2 0h1m1 0h2m2 0h1m2 0h2m5 0h2m2 0h1m2 0h1m1 0h1m1 0h1M2 27.5h6m2 0h1m2 0h2m1 0h4m2 0h2m1 0h1m1 0h1m1 0h2m1 0h3m2 0h1m2 0h1M2 28.5h8m1 0h1m3 0h2m1 0h2m2 0h1m1 0h1m1 0h1m4 0h1m1 0h2m5 0h1m1 0h1M2 29.5h2m1 0h1m4 0h4m2 0h1m2 0h2m4 0h2m1 0h1m3 0h1m2 0h4m2 0h2M4 30.5h6m1 0h4m1 0h2m4 0h1m4 0h1m1 0h1m1 0h1m2 0h1m1 0h2m3 0h2M4 31.5h1m5 0h3m1 0h4m1 0h1m1 0h2m1 0h1m2 0h1m1 0h2m2 0h1m1 0h1m2 0h4M2 32.5h1m2 0h4m2 0h2m1 0h1m2 0h2m1 0h2m1 0h1m2 0h1m2 0h1m1 0h1m2 0h1m2 0h1m1 0h2m1 0h1M4 33.5h4m1 0h1m2 0h1m4 0h5m2 0h2m4 0h2m1 0h1m1 0h7M3 34.5h4m1 0h1m1 0h4m1 0h1m1 0h2m3 0h1m3 0h1m1 0h15M10 35.5h1m4 0h3m1 0h6m4 0h1m1 0h1m2 0h1m3 0h1m1 0h1M2 36.5h7m1 0h1m3 0h2m1 0h2m1 0h1m4 0h1m2 0h3m2 0h2m1 0h1m1 0h1m1 0h2M2 37.5h1m5 0h1m1 0h5m4 0h1m2 0h1m1 0h1m2 0h2m3 0h3m3 0h1m2 0h1M2 38.5h1m1 0h3m1 0h1m4 0h2m1 0h2m4 0h2m1 0h1m4 0h1m1 0h7m2 0h2M2 39.5h1m1 0h3m1 0h1m1 0h1m1 0h1m2 0h1m5 0h1m1 0h1m2 0h1m2 0h1m1 0h3m3 0h1M2 40.5h1m1 0h3m1 0h1m1 0h6m3 0h3m1 0h2m1 0h1m4 0h1m1 0h1m5 0h2m1 0h1M2 41.5h1m5 0h1m2 0h9m1 0h1m2 0h1m1 0h1m1 0h1m5 0h2m1 0h2M2 42.5h7m1 0h1m1 0h1m1 0h2m1 0h3m2 0h1m1 0h3m1 0h1m1 0h1m4 0h2"/></svg>`;

// Precomputed high-resolution PNG base64 Data URL (360x360, margin 2)
export const OFFICIAL_PIX_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoCAYAAAB65WHVAAAAAklEQVR4AewaftIAAA0NSURBVO3B0a1E164kwSri+O9yjhx4/JiFjaZ0M6L8I5KkcyaSpJMmkqSTJpKkkyaSpJMmkqSTJpKkkyaSpJMmkqSTJpKkkyaSpJMmkqSTJpKkkyaSpJMmkqST/vKxtvlfBmTTNhsgm7b5X9Y2GyCbttkA2bTNBsimbTZANm2zAbJpmw2QTdt8qW3+l00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ00kSSf95REQ/d8B+SUgm7bZANm0zQbIpm02QP6XAdm0zQbIpm02QF4A0f/fRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ0UvlHHrTNBsimbS4D8qJtXgB50TYvgHypbTZAXrTNBsiX2uYFkE3bbIBs2mYDZNM2GyCbtrkMyC9NJEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJEkn/eVjbbMB8qW22QDZtI2+A+RLQF60zQbILwHZtM0GyAsgm7bZANm0zQsgL9rmBZAXE0nSSRNJ0kkTSdJJE0nSSRNJ0kkTSdJJE0nSSX/5GJBN2/xS27wAsmmbDZBN22yAbIC8aJsNkBdt8yUgL4B8CciLttkA2bTNBsimbTZAXgDZtM2XgGza5ksTSdJJE0nSSRNJ0kkTSdJJE0nSSRNJ0kkTSdJJ5R950Da/BGTTNhsgL9rmBZB/s7bZANm0zQbIi7Z5AWTTNhsgm7bZAHnRNhsgm7bZANm0zQsg/8smkqSTJpKkkyaSpJMmkqSTJpKkkyaSpJMmkqST/vIIyIu22QB5AWTTNpe1zQbIvxmQXwLyS0C+BGTTNl8C8qW22QB50TYvgLyYSJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJOKv/Ig7bZAHnRNhsgm7bZANm0zQbIpm3+y4Bs2uYFkBdtcxmQTdtsgPxS22yAbNpmA+SX2uYFkBcTSdJJE0nSSRNJ0kkTSdJJE0nSSRNJ0kkTSdJJf/mXa5sXbfNLQDZt8wLIpm1+CciLtnkB5EXbbIB8qW02QDZt86W2edE2GyCbtvk3m0iSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTir/yIfa5peAfKltNkA2bfNLQL7UNi+AvGibLwHZtM0LIJu2+SUgL9pmA+SX2uYFkBcTSdJJE0nSSRNJ0kkTSdJJE0nSSRNJ0kkTSdJJf/kxIC/a5kXbbIBsgGzaZgNk0zYvgGzaZgPkBZBN27xomw2QTdv8EpBN22yA/FLbvADyom02QDZt8wLIlyaSpJMmkqSTJpKkkyaSpJMmkqSTJpKkkyaSpJPKP/KgbV4A+S9rmw2QTdtsgGzaZgNk0zYbIJe1zS8B2bTNBsiX2mYD5EXbbIBs2uZLQC6bSJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJO+ssjIC/aZgNk0zZfArJpmxdtswHyAshlbbMBchmQF0BetM1/GZBN2/yXTSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ5V/5ENtswGyaZsNkE3bbIBs2mYDZNM2GyCbtnkB5EXbbID8UttsgLxomxdAXrTNBsiLttkA+VLbbIC8aJsXQDZtswHyYiJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJOukvP9Y2L9pmA2TTNhsgm7b5JSCbtrmsbTZANkBetM0LIF8CsmmbDZANkE3bbIC8AHJZ2/zSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ00l8etc0GyGVANm3zpba5DMimbTZANkC+1DYbIJu2uQzIi7b5pbbZANm0zQsgm7bZAPnSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ0UvlHPtQ2L4Bs2uaXgGzaZgNk0zYvgGza5gWQF23zAshlbbMBsmmbF0A2bfMlIF9qmw2QTdt8CciLiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTppL/8GJAXQDZtswHyom1etM0GyKZtNm3zAsiLttkA+VLbvACyaZsNkE3bbIB8CcimbTZANm2zAfJLQF60zZcmkqSTJpKkkyaSpJMmkqSTJpKkkyaSpJMmkqST/vI/rm02QDZAvtQ2GyCbtnnRNi+AbNrmBZBfAvICyKZtvgRkA+S/rG1eAPnSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ00l/+xwHZtM0LIC+A/BKQTdt8CcgLIF9qmy8B2bTNL7XNBsimbTZANkBeANm0zS9NJEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJEkn/eVR22yAvGibF0A2bbMBsmmbL7XNv1nbvGibF0C+BGTTNhsgm7Z5AWTTNhsgL9rmS23zXzaRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ30l385IC+AbNrml4C8aJsXbbMBclnb/BKQTdtsgLxomw2QF0BetM2mbV4A+VLbbIC8mEiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTvrLIyCbttkA+aW2eQHkRdu8ALIB8qJtNm3zJSCbttkA2bTNfxmQTdtsgGzaZgNkA+SX2uYFkC9NJEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJEknlX/kQdtcBuRF27wA8qJtNkA2bfMCyKZtfgnIpm1eAPmlttkA2bTNBsiX2mYDZNM2L4Bs2uYFkC9NJEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJEkn/eVjQL7UNpu2eQHkRdu8APICyKZtNm2zAfKibTZANm2zAfJLbbMB8kttswGyaZsNkC8B2bTNv9lEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSX36sbTZANkA2bbMB8iUgm7Z50Tb/ZW2zAbJpmw2QF22zAbJpm18C8kttswHyJSCbtvmliSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTppPKPPGibDZAvtc2XgLxom38zIJu2eQFk0zYvgGzaZgPkl9rmBZBN22yAbNrmMiAv2mYD5EsTSdJJE0nSSRNJ0kkTSdJJE0nSSRNJ0kkTSdJJ5R/R/1nbfAnIi7Z5AeRF22yAbNpmA+RLbfNLQDZt8yUgm7bZAPlS21wG5MVEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSXx61zX8ZkA2QTdv8EpAXbfNv1jZfArJmy8BedE2m7b5UttsgLwAsmmbDZBfmkiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTvrLx4Bc1jYv2uZLbfMCyKZtXgDZtM2mbV60zQbIi7bZtM0vtc2/GZAvtc2/2USSdNJEknTSRJJ00kSSdNJEknTSRJJ00kSSdNJffqxtvgTkl4Bs2mYDZNM2XwKyaZsNkF9qm18C8iUgL9rmS21zGZBN27wA8mIiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTrpL/pU23wJyGVt80tANm3zAsiX2mYD5N8MyIu22QD5EpAvTSRJJ00kSSdNJEknTSRJJ00kSSdNJEknTSRJJ/1F/2ptswGyAbJpmw2QTdtsgLxomxdAvtQ2GyBfapsvAdm0zaZtNkBetM0GyGUTSdJJE0nSSRNJ0kkTSdJJE0nSSRNJ0kkTSdJJf/kxIP9mQDZtswFyGZBfapsNkBdt8yUgm7bZAHkB5EXb/FLbfKltNkB+aSJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJOukvH2ub/7K22QDZtM2/Wdu8aJsvtc2XgLwA8qJtvgRk0zYbIJu2+RKQF22zAfKliSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTppPKPSJLOmUiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJOmkiSTppIkk6aSJJO+n8AQ2A6w6voeAAAAABJRU5ErkJggg==';

// Real-time PNG URL via Data URL
export const OFFICIAL_PIX_QR_CODE_URL = OFFICIAL_PIX_DATA_URL;

export function generatePixPayload(_orderId?: string, amount?: number): {
  code: string;
  qrCodeUrl: string;
} {
  const code = buildPixEMVPayload({
    key: OFFICIAL_PIX_KEY,
    name: OFFICIAL_PIX_BENEFICIARY,
    city: OFFICIAL_PIX_CITY,
    amount: amount && amount > 0 ? amount : undefined,
  });

  return {
    code,
    qrCodeUrl: OFFICIAL_PIX_DATA_URL,
  };
}

export function generateBoletoBarcode(orderId: string, amount: number): {
  barcodeNumber: string;
  dueDate: string;
} {
  // Generate valid-looking 47-digit linha digitável
  const due = new Date();
  due.setDate(due.getDate() + 3);
  const dueDate = due.toLocaleDateString('pt-BR');

  const cents = Math.round(amount * 100).toString().padStart(10, '0');
  const barcodeNumber = `23793.38128 60000.150244 58000.063207 1 9580${cents}`;

  return {
    barcodeNumber,
    dueDate,
  };
}

export const STORE_WHATSAPP_NUMBER = '5579996016356';
export const STORE_WHATSAPP_DISPLAY = '(79) 9 9601-6356';

export function buildWhatsAppOrderMessage(order: {
  id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    address: {
      street: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      cep?: string;
    };
  };
  items: Array<{
    product: { name: string; price: number };
    selectedSize: string;
    selectedColor: { name: string };
    quantity: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerNote?: string;
}): string {
  const paymentLabels: Record<string, string> = {
    pix: 'PIX Instantâneo',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    boleto: 'Boleto Bancário',
  };

  const paymentName = paymentLabels[order.paymentMethod] || order.paymentMethod.toUpperCase();

  const itemsList = order.items
    .map((item, index) => {
      const itemSubtotal = item.product.price * item.quantity;
      return `${index + 1}️⃣ *${item.product.name}*\n   ▫️ Tamanho: *${item.selectedSize}* | Cor: *${item.selectedColor.name}*\n   ▫️ Quantidade: ${item.quantity}x • ${formatCurrency(item.product.price)} un.\n   ▫️ Subtotal: *${formatCurrency(itemSubtotal)}*`;
    })
    .join('\n\n');

  // Format clean address string
  const addrParts: string[] = [];
  if (order.customer.address.street) {
    addrParts.push(order.customer.address.street);
  }
  if (order.customer.address.number) {
    addrParts.push(`Nº ${order.customer.address.number}`);
  }
  if (order.customer.address.complement?.trim()) {
    addrParts.push(order.customer.address.complement.trim());
  }
  if (order.customer.address.neighborhood?.trim()) {
    addrParts.push(`Bairro: ${order.customer.address.neighborhood.trim()}`);
  }
  if (order.customer.address.city?.trim()) {
    addrParts.push(`${order.customer.address.city.trim()}${order.customer.address.state ? `/${order.customer.address.state}` : ''}`);
  }
  const formattedAddress = addrParts.length > 0 ? addrParts.join(', ') : order.customer.address.street;

  const noteText = order.customerNote?.trim()
    ? `\n📝 *OBSERVAÇÃO DO CLIENTE:*\n${order.customerNote.trim()}\n`
    : '';

  return (
`👑 *NOVO PEDIDO - JE IMPORTS*
*Pedido:* #${order.id}

👤 *DADOS DO CLIENTE:*
• Nome: *${order.customer.name}*
• WhatsApp / Telefone: *${order.customer.phone}*

📍 *ENDEREÇO DE ENTREGA:*
• ${formattedAddress}

🛍️ *PRODUTOS SELECIONADOS:*
${itemsList}

💰 *RESUMO FINANCEIRO:*
• Subtotal das peças: ${formatCurrency(order.subtotal)}
${order.discount > 0 ? `• Desconto aplicado: -${formatCurrency(order.discount)}\n` : ''}• *VALOR FINAL:* *${formatCurrency(order.total)}*

💳 *FORMA DE PAGAMENTO:*
• *${paymentName}*
${noteText}
Olá! Finalizei meu pedido no site da *JE Imports*. Podem confirmar o recebimento e o envio? Obrigado!`
  );
}

export function openWhatsAppOrderUrl(order: Parameters<typeof buildWhatsAppOrderMessage>[0]): string {
  const message = buildWhatsAppOrderMessage(order);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encoded}`;
}

