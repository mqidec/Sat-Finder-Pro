import { Satellite } from '../types/satellite';

/**
 * Comprehensive KingOfSat Satellite & Transponder Database
 * Sourced according to the official KingOfSat Directory (https://fr.kingofsat.net/satellites.php)
 * Spanning geostationary orbital positions from 80.0°E to 70.0°W (Ku-Band & C-Band)
 */
export const INITIAL_SATELLITES: Satellite[] = [
  // ===================== EASTERN ARC (80.0°E to 30.5°E) =====================
  {
    id: 'express-80-c',
    name: 'Express 80 (80.0°E)',
    nameAr: 'إكسبريس 80 (80.0°E) باند C و Ku',
    pos: 80.0,
    band: 'C',
    orbitalSlot: '80.0°E',
    lnbDefault: '5150',
    region: 'Asia / Russia',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-80E.php',
    transponders: [
      { id: 'exp80-1', frequency: 3875, polarity: 'R', symbolRate: 33483, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: true, channels: ['Perviy Kanal', 'Rossiya 1', 'Match TV'], description: 'Telekarta Package C-Band' },
      { id: 'exp80-2', frequency: 3675, polarity: 'R', symbolRate: 33483, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: false, channels: ['NTV Russia', 'STS', 'REN TV'], description: 'RTRS Russian Multiplex' },
      { id: 'exp80-3', frequency: 11606, polarity: 'V', symbolRate: 45000, fec: '4/5', modulation: 'DVB-S2 8PSK', beam: 'Ku Russia', isFta: false, channels: ['Telekarta HD', 'KHL Prime HD'], description: 'Telekarta Ku High-Power' },
      { id: 'exp80-4', frequency: 10981, polarity: 'V', symbolRate: 44948, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Ku Russia', isFta: true, channels: ['Otrity Mir', 'Spas TV'], description: 'FTA Russian Free Multiplex' }
    ]
  },
  {
    id: 'apstar-7-c',
    name: 'Apstar 7 (76.5°E)',
    nameAr: 'أبستار 7 (76.5°E) باند C',
    pos: 76.5,
    band: 'C',
    orbitalSlot: '76.5°E',
    lnbDefault: '5150',
    region: 'Asia / MidEast',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-76.5E.php',
    transponders: [
      { id: 'ap7-1', frequency: 3780, polarity: 'V', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Asia C', isFta: true, channels: ['Channel 9 BD', 'Bangla Vision', 'ATN Bangla'], description: 'Bangladesh National DTH' },
      { id: 'ap7-2', frequency: 4040, polarity: 'H', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: true, channels: ['Somoy TV', 'Independent TV', 'Jamuna TV'], description: 'South Asian News Net' },
      { id: 'ap7-3', frequency: 3920, polarity: 'H', symbolRate: 28340, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'C-Band Wide', isFta: false, channels: ['Discovery Asia', 'Sony Sports'], description: 'Pay TV Package' }
    ]
  },
  {
    id: 'abs-2a-ku',
    name: 'ABS 2 / ABS 2A (75.0°E)',
    nameAr: 'إي بي إس 2A (75.0°E)',
    pos: 75.0,
    band: 'KU',
    orbitalSlot: '75.0°E',
    lnbDefault: '9750/10600',
    region: 'Russia / Asia',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-75E.php',
    transponders: [
      { id: 'abs2-1', frequency: 11044, polarity: 'H', symbolRate: 44922, fec: '4/5', modulation: 'DVB-S2 8PSK', beam: 'Russia Ku', isFta: true, channels: ['Mir 24', 'RBK TV', 'Moskva 24'], description: 'Russian Broadcasters FTA' },
      { id: 'abs2-2', frequency: 11605, polarity: 'V', symbolRate: 43200, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Ku Wide', isFta: true, channels: ['Star Family', 'Multimania'], description: 'Reference Strong TP' },
      { id: 'abs2-3', frequency: 12521, polarity: 'H', symbolRate: 22000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'MENA / Asia', isFta: false, channels: ['Geo TV', 'ARY Digital'], description: 'Asian Network' }
    ]
  },
  {
    id: 'intelsat-20-c',
    name: 'Intelsat 20 (68.5°E) C-Band',
    nameAr: 'إنتلسات 20 (68.5°E) باند C',
    pos: 68.5,
    band: 'C',
    orbitalSlot: '68.5°E',
    lnbDefault: '5150',
    region: 'Africa / Asia / ME',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-68.5E.php',
    transponders: [
      { id: 'is20-c1', frequency: 3740, polarity: 'H', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: true, channels: ['NHK World Japan', 'CCTV 4', 'CGTN'], description: 'Asia Pacific Feeds' },
      { id: 'is20-c2', frequency: 4064, polarity: 'H', symbolRate: 19850, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Europe / ME', isFta: false, channels: ['Zee Cinema', 'Zee News'], description: 'Zee Network India' },
      { id: 'is20-c3', frequency: 3825, polarity: 'V', symbolRate: 7200, fec: '3/4', modulation: 'DVB-S2 QPSK', beam: 'Africa / ME', isFta: true, channels: ['Times Now', 'ET Now'], description: 'Times Network Global' }
    ]
  },
  {
    id: 'intelsat-20-ku',
    name: 'Intelsat 20 (68.5°E) Ku',
    nameAr: 'إنتلسات 20 (68.5°E) كو باند',
    pos: 68.5,
    band: 'KU',
    orbitalSlot: '68.5°E',
    lnbDefault: '9750/10600',
    region: 'Southern Africa / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-68.5E.php',
    transponders: [
      { id: 'is20-k1', frequency: 12682, polarity: 'V', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Africa Ku', isFta: true, channels: ['Emmanuel TV', 'Prophetic Channel', 'LoveWorld'], description: 'Strongest Reference Ku TP' },
      { id: 'is20-k2', frequency: 12602, polarity: 'V', symbolRate: 26657, fec: '2/3', modulation: 'DVB-S QPSK', beam: 'Africa Ku', isFta: true, channels: ['Daystar TV', 'TBN Africa', 'Gospel TV'], description: 'Religious FTA Community' },
      { id: 'is20-k3', frequency: 11170, polarity: 'V', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe / ME', isFta: false, channels: ['DStv Bouquet', 'SuperSport Africa'], description: 'DStv Sub-Saharan Bouquet' }
    ]
  },
  {
    id: 'intelsat-17-c',
    name: 'Intelsat 17 (66.0°E)',
    nameAr: 'إنتلسات 17 (66.0°E) باند C',
    pos: 66.0,
    band: 'C',
    orbitalSlot: '66.0°E',
    lnbDefault: '5150',
    region: 'India / MidEast',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-66E.php',
    transponders: [
      { id: 'is17-1', frequency: 3845, polarity: 'V', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'India C', isFta: true, channels: ['Sun TV', 'KTV', 'Sun Music'], description: 'Sun TV South India HD' },
      { id: 'is17-2', frequency: 4005, polarity: 'V', symbolRate: 14400, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'India C', isFta: true, channels: ['Polimer News', 'Kalaignar TV'], description: 'Tamil Regional TV' }
    ]
  },
  {
    id: 'express-at1-ku',
    name: 'Express AT1 (56.0°E)',
    nameAr: 'إكسبريس AT1 (56.0°E) قطبي دائري',
    pos: 56.0,
    band: 'KU',
    orbitalSlot: '56.0°E',
    lnbDefault: '10750',
    region: 'Russia / Siberia',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-56E.php',
    transponders: [
      { id: 'at1-1', frequency: 12053, polarity: 'R', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Wide Circular', isFta: false, channels: ['Tricolor Sibir HD', 'Match Arena'], description: 'Tricolor TV Sibir' },
      { id: 'at1-2', frequency: 12226, polarity: 'L', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Wide Circular', isFta: false, channels: ['NTV Plus Vostok', 'Kinohit HD'], description: 'NTV Plus East Package' },
      { id: 'at1-3', frequency: 12130, polarity: 'R', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Wide Circular', isFta: true, channels: ['Promo Tricolor TV', 'InfoKanal'], description: 'Reference FTA TP' }
    ]
  },
  {
    id: 'express-am6-ku',
    name: 'Express AM6 (53.0°E)',
    nameAr: 'إكسبريس AM6 (53.0°E)',
    pos: 53.0,
    band: 'KU',
    orbitalSlot: '53.0°E',
    lnbDefault: '9750/10600',
    region: 'Middle East / Russia',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-53E.php',
    transponders: [
      { id: 'am6-1', frequency: 12594, polarity: 'V', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S QPSK', beam: 'Ku ME', isFta: true, channels: ['Al Masirah TV', 'Al Manar', 'Al Mayadeen'], description: 'Arab News Network' },
      { id: 'am6-2', frequency: 10974, polarity: 'H', symbolRate: 15284, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Ku Russia', isFta: true, channels: ['Perviy Kanal Crimea', 'Vesti'], description: 'Crimea Bouquet' }
    ]
  },
  {
    id: 'yahsat-52-ku',
    name: 'Al Yah 1 / Yahsat (52.5°E)',
    nameAr: 'ياه سات / الياه 1 (52.5°E)',
    pos: 52.5,
    band: 'KU',
    orbitalSlot: '52.5°E',
    lnbDefault: '9750/10600',
    region: 'Middle East / MENA',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-52.5E.php',
    transponders: [
      { id: 'yah-1', frequency: 11843, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'MENA Ku', isFta: true, channels: ['Gem TV HD', 'Gem Cinema', 'Gem Series'], description: 'Popular Persian/Arabic HD' },
      { id: 'yah-2', frequency: 12015, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'MENA Ku', isFta: true, channels: ['MBC Persia HD', 'Navahang HD'], description: 'Entertainment Bouquet' },
      { id: 'yah-3', frequency: 12130, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'MENA Ku', isFta: true, channels: ['Varzesh TV', 'Football HD', 'Persiana Sports'], description: 'Sports Channels' },
      { id: 'yah-4', frequency: 11958, polarity: 'V', symbolRate: 27500, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'MENA Ku', isFta: true, channels: ['Tajikistan TV', 'Jahonnamo', 'Sinamo'], description: 'Tajik State Broadcaster' }
    ]
  },
  {
    id: 'turkmenalem-52-ku',
    name: 'TurkmenÄlem / MonacoSat (52.0°E)',
    nameAr: 'تركمان ألم / موناكو سات (52.0°E)',
    pos: 52.0,
    band: 'KU',
    orbitalSlot: '52.0°E',
    lnbDefault: '9750/10600',
    region: 'Central Asia / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-52E.php',
    transponders: [
      { id: 'tm-1', frequency: 12226, polarity: 'V', symbolRate: 28000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'East Ku', isFta: true, channels: ['Altyn Asyr', 'Yashlyk', 'Miras', 'Turkmenistan TV'], description: 'Turkmen National Package' },
      { id: 'tm-2', frequency: 10762, polarity: 'H', symbolRate: 27500, fec: '1/2', modulation: 'DVB-S QPSK', beam: 'West Ku', isFta: true, channels: ['WNS Network', 'Persiana HD', 'FX HD'], description: 'WNS Transmission Center' },
      { id: 'tm-3', frequency: 10887, polarity: 'V', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S QPSK', beam: 'Europe / ME', isFta: true, channels: ['4U TV', 'Ava Family HD', 'Mono TV'], description: 'European Beam FTA' }
    ]
  },
  {
    id: 'belintersat-51-ku',
    name: 'Belintersat 1 (51.5°E)',
    nameAr: 'بيلينترسات 1 (51.5°E)',
    pos: 51.5,
    band: 'KU',
    orbitalSlot: '51.5°E',
    lnbDefault: '9750/10600',
    region: 'Europe / Africa',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-51.5E.php',
    transponders: [
      { id: 'bel-1', frequency: 11290, polarity: 'H', symbolRate: 45000, fec: '8/9', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['CT 1 HD', 'CT 2 HD', 'Nova HD'], description: 'Fotelka Slovakia / Czech' },
      { id: 'bel-2', frequency: 11410, polarity: 'H', symbolRate: 45000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['Prima Plus HD', 'JOJ TV HD'], description: 'Fotelka Entertainment' },
      { id: 'bel-3', frequency: 11350, polarity: 'H', symbolRate: 45000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['Belintersat Promo', 'Belarus 24 HD'], description: 'Belarus National FTA' }
    ]
  },
  {
    id: 'azerspace-46-ku',
    name: 'AzerSpace 1 / Africasat 1A (46.0°E)',
    nameAr: 'أزرسبيس 1 (46.0°E)',
    pos: 46.0,
    band: 'KU',
    orbitalSlot: '46.0°E',
    lnbDefault: '9750/10600',
    region: 'Europe / Central Asia',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-46E.php',
    transponders: [
      { id: 'az-1', frequency: 11135, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Central Asia', isFta: true, channels: ['AzTV', 'Ictimai TV', 'Medeniyyet TV'], description: 'Azerbaijan State TV' },
      { id: 'az-2', frequency: 11095, polarity: 'H', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['CBC Sport HD', 'Real TV HD'], description: 'CBC Sport Live Premier League' },
      { id: 'az-3', frequency: 11024, polarity: 'V', symbolRate: 16500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['1 TV Georgia', 'Rustavi 2'], description: 'Georgian Multiplex' }
    ]
  },
  {
    id: 'turksat-42-ku',
    name: 'Türksat 3A / 4A / 5B (42.0°E)',
    nameAr: 'تركسات (42.0°E)',
    pos: 42.0,
    band: 'KU',
    orbitalSlot: '42.0°E',
    lnbDefault: '9750/10600',
    region: 'Turkey / Europe / ME',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-42E.php',
    transponders: [
      { id: 'trk-1', frequency: 12054, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'West Ku', isFta: true, channels: ['TRT 1 HD', 'TRT Spor HD', 'TRT Haber HD'], description: 'TRT Turkish State Bouquet (Ref TP)' },
      { id: 'trk-2', frequency: 12380, polarity: 'V', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'West Ku', isFta: true, channels: ['ATV HD', 'A Haber HD', 'A Spor HD'], description: 'Turkuvaz Media Group' },
      { id: 'trk-3', frequency: 11096, polarity: 'V', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'West Ku', isFta: true, channels: ['TRT 4K Ultra HD', 'TRT World HD'], description: 'TRT 4K Ultra High Definition' },
      { id: 'trk-4', frequency: 12245, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Turkey Ku', isFta: true, channels: ['Show TV HD', 'Haberturk HD', 'Bloomberg HT'], description: 'Ciner Media Group' },
      { id: 'trk-5', frequency: 11977, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'West Ku', isFta: true, channels: ['Kanal D HD', 'CNN Turk HD', 'Teve2'], description: 'Demiroren Media' }
    ]
  },
  {
    id: 'hellas-39-ku',
    name: 'Hellas Sat 3 / 4 (39.0°E)',
    nameAr: 'هيلاس سات (39.0°E)',
    pos: 39.0,
    band: 'KU',
    orbitalSlot: '39.0°E',
    lnbDefault: '9750/10600',
    region: 'Balkans / Greece / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-39E.php',
    transponders: [
      { id: 'hel-1', frequency: 12224, polarity: 'H', symbolRate: 13381, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'F1 Europe', isFta: true, channels: ['The Voice Bulgaria', 'Magic TV HD', 'City TV'], description: 'Bulgarian Music FTA' },
      { id: 'hel-2', frequency: 12241, polarity: 'H', symbolRate: 13381, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'F1 Europe', isFta: true, channels: ['BNT 1 HD', 'BNT 2', 'BNT 3 HD'], description: 'Bulgarian National TV' },
      { id: 'hel-3', frequency: 12118, polarity: 'H', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'F2 Balkans', isFta: false, channels: ['Telekom Romania HD', 'Pro TV HD'], description: 'Telekom Romania Package' },
      { id: 'hel-4', frequency: 12437, polarity: 'V', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['ERT 1 HD', 'ERT 2 HD', 'ERT News'], description: 'ERT Greek DTT Feeds (BISS)' }
    ]
  },
  {
    id: 'paksat-38-c',
    name: 'Paksat 1R (38.0°E)',
    nameAr: 'باكسات 1R (38.0°E) باند C',
    pos: 38.0,
    band: 'C',
    orbitalSlot: '38.0°E',
    lnbDefault: '5150',
    region: 'Pakistan / South Asia',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-38E.php',
    transponders: [
      { id: 'pak-1', frequency: 4005, polarity: 'V', symbolRate: 15555, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'C-Band', isFta: true, channels: ['PTV Home', 'PTV News', 'PTV Sports HD'], description: 'Pakistan Television Network' },
      { id: 'pak-2', frequency: 4158, polarity: 'V', symbolRate: 12000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'C-Band', isFta: true, channels: ['Geo News', 'Geo Entertainment', 'Geo Tez'], description: 'Geo Network Pakistan' }
    ]
  },
  {
    id: 'eutelsat-36-ku',
    name: 'Eutelsat 36B / 36C (36.0°E)',
    nameAr: 'يوتلسات 36 (36.0°E) قطبي دائري',
    pos: 36.0,
    band: 'KU',
    orbitalSlot: '36.0°E',
    lnbDefault: '10750',
    region: 'Russia / Sub-Saharan Africa',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-36E.php',
    transponders: [
      { id: 'eu36-1', frequency: 12226, polarity: 'L', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Russia Circular', isFta: false, channels: ['NTV Plus HD', 'Match Premier HD'], description: 'NTV Plus Russia' },
      { id: 'eu36-2', frequency: 12054, polarity: 'R', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Russia Circular', isFta: false, channels: ['Tricolor TV HD', 'Kino Uhod'], description: 'Tricolor TV Main DTH' },
      { id: 'eu36-3', frequency: 11785, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Africa Ku', isFta: false, channels: ['DStv SuperSport 1', 'M-Net Movies'], description: 'DStv Sub-Saharan Africa' }
    ]
  },
  {
    id: 'arabsat-30-ku',
    name: 'Arabsat 5A / 6A (30.5°E)',
    nameAr: 'عربسات 5A / 6A (30.5°E)',
    pos: 30.5,
    band: 'KU',
    orbitalSlot: '30.5°E',
    lnbDefault: '9750/10600',
    region: 'MENA / Africa',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-30.5E.php',
    transponders: [
      { id: 'arb30-1', frequency: 12526, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Arabsat Ku', isFta: true, channels: ['Sudan TV', 'Eritrea TV', 'Omdurman TV'], description: 'East Africa / Sudan DTH' },
      { id: 'arb30-2', frequency: 10890, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'MENA Ku', isFta: true, channels: ['Saudi Quran HD', 'Saudi Sunnah HD'], description: 'Islamic Broadcast' }
    ]
  },

  // ===================== CENTRAL & EUROPEAN ARC (28.2°E to 9.0°E) =====================
  {
    id: 'astra-28-ku',
    name: 'Astra 2E / 2F / 2G (28.2°E)',
    nameAr: 'أسترا 28 بريطانيا (28.2°E)',
    pos: 28.2,
    band: 'KU',
    orbitalSlot: '28.2°E',
    lnbDefault: '9750/10600',
    region: 'UK / Ireland / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-28.2E.php',
    transponders: [
      { id: 'as28-1', frequency: 10773, polarity: 'H', symbolRate: 22000, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'UK Spot', isFta: true, channels: ['BBC One London HD', 'BBC Two HD', 'BBC Four HD'], description: 'BBC Freeview HD (UK Spot)' },
      { id: 'as28-2', frequency: 10847, polarity: 'V', symbolRate: 23000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'UK Spot', isFta: true, channels: ['BBC One Wales HD', 'BBC One Scotland'], description: 'BBC Nations HD' },
      { id: 'as28-3', frequency: 11914, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: false, channels: ['Sky Sports Main Event', 'Sky Cinema Premiere'], description: 'Sky Digital UK' },
      { id: 'as28-4', frequency: 11222, polarity: 'H', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: true, channels: ['Sky News HD', 'Pick TV', 'Challenge'], description: 'Sky UK Free-To-Air (Europe Beam)' },
      { id: 'as28-5', frequency: 12012, polarity: 'V', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['Sky Sports Football HD', 'TNT Sports 1 HD'], description: 'Sky Sports Premier League HD' }
    ]
  },
  {
    id: 'badr-26-ku',
    name: 'Badr 4/5/6/7 / Es\'hailSat (26.0°E)',
    nameAr: 'بدر 4/5/6/7 / سهيل سات (26.0°E)',
    pos: 26.0,
    band: 'KU',
    orbitalSlot: '26.0°E',
    lnbDefault: '9750/10600',
    region: 'MENA / Arabian Gulf / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-26E.php',
    transponders: [
      { id: 'badr-1', frequency: 11270, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Badr 4 FSS', isFta: true, channels: ['Al Arabiya HD', 'Al Hadath HD', 'MBC FM'], description: 'Al Arabiya News Network (Strongest Ref)' },
      { id: 'badr-2', frequency: 11785, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Badr 4 BSS', isFta: true, channels: ['Dubai TV HD', 'Dubai One HD', 'Dubai Sports 1'], description: 'Dubai Media Inc (DMI) Bouquet' },
      { id: 'badr-3', frequency: 12130, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Es\'hail 2 MENA', isFta: true, channels: ['beIN Sports HD (Open)', 'beIN Sports News HD', 'Al Rayyan TV HD'], description: 'beIN Sports Free Bouquet' },
      { id: 'badr-4', frequency: 12054, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Badr 4 BSS', isFta: true, channels: ['Saudi 1 HD', 'KSA Sports 1 HD', 'Al Ekhbariya HD'], description: 'SBA Saudi Broadcasting Authority' },
      { id: 'badr-5', frequency: 11938, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Badr 4 BSS', isFta: true, channels: ['Kuwait TV 1 HD', 'Kuwait Sports HD', 'Al Majlis'], description: 'Kuwait TV Official Network' },
      { id: 'badr-6', frequency: 12265, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Es\'hail 1 MENA', isFta: false, channels: ['beIN Sports 1 HD', 'beIN Sports 2 HD', 'beIN Sports 3 HD'], description: 'beIN Media Group Pay DTH' }
    ]
  },
  {
    id: 'astra-23-ku',
    name: 'Astra 3B / 3C (23.5°E)',
    nameAr: 'أسترا 3B (23.5°E)',
    pos: 23.5,
    band: 'KU',
    orbitalSlot: '23.5°E',
    lnbDefault: '9750/10600',
    region: 'Benelux / Central Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-23.5E.php',
    transponders: [
      { id: 'as23-1', frequency: 12168, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: true, channels: ['CT 24 HD', 'Ocko TV', 'Slagr TV'], description: 'Czech Free News (Ref TP)' },
      { id: 'as23-2', frequency: 11739, polarity: 'V', symbolRate: 29900, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['NPO 1 HD', 'NPO 2 HD', 'RTL 4 HD'], description: 'Canal Digitaal Netherlands' },
      { id: 'as23-3', frequency: 12344, polarity: 'H', symbolRate: 29900, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['VTM HD', 'Play4 HD', 'Ketnet'], description: 'TV Vlaanderen Belgium' },
      { id: 'as23-4', frequency: 12070, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: true, channels: ['Astra 3B Info HD', 'SES Promo'], description: 'SES Astra Technical Beacon' }
    ]
  },
  {
    id: 'eutelsat-21-ku',
    name: 'Eutelsat 21B (21.6°E)',
    nameAr: 'يوتلسات 21B (21.6°E) الفيدات',
    pos: 21.6,
    band: 'KU',
    orbitalSlot: '21.6°E',
    lnbDefault: '9750/10600',
    region: 'Professional Broadcast Feeds',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-21.6E.php',
    transponders: [
      { id: 'eu21-1', frequency: 11527, polarity: 'V', symbolRate: 2857, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Wide Feeds', isFta: true, channels: ['Reuters World News Feed', 'Live Sports Feed'], description: 'Reuters Live Transmission Feed' },
      { id: 'eu21-2', frequency: 11600, polarity: 'V', symbolRate: 3333, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'MENA Feeds', isFta: true, channels: ['MENA News Feed', 'EBU SNG Feed'], description: 'European Broadcasting Union SNG' }
    ]
  },
  {
    id: 'astra-19-ku',
    name: 'Astra 1KR / 1L / 1M / 1N (19.2°E)',
    nameAr: 'أسترا 19 (19.2°E)',
    pos: 19.2,
    band: 'KU',
    orbitalSlot: '19.2°E',
    lnbDefault: '9750/10600',
    region: 'France / Germany / Spain',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-19.2E.php',
    transponders: [
      { id: 'as19-1', frequency: 11538, polarity: 'V', symbolRate: 22000, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: true, channels: ['France 24 Français HD', 'France 24 English', 'TV5 Monde Europe'], description: 'France Public News (Strongest Ref)' },
      { id: 'as19-2', frequency: 11856, polarity: 'V', symbolRate: 29700, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['Canal+ France HD', 'Canal+ Cinema', 'Canal+ Sport 360 HD'], description: 'Canal+ France Premium DTH' },
      { id: 'as19-3', frequency: 12207, polarity: 'V', symbolRate: 29700, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['TF1 HD', 'M6 HD', 'W9 HD', 'Arte HD'], description: 'Canal+ TNT Sat France' },
      { id: 'as19-4', frequency: 11494, polarity: 'H', symbolRate: 22000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['Das Erste HD (ARD)', 'Arte Deutsch HD', 'SWR HD'], description: 'ARD German Public HD (FTA)' },
      { id: 'as19-5', frequency: 11362, polarity: 'H', symbolRate: 22000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['ZDF HD', 'ZDFinfo HD', 'KiKA HD'], description: 'ZDF German Public HD (FTA)' },
      { id: 'as19-6', frequency: 10818, polarity: 'V', symbolRate: 22000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['LaLiga TV HD', 'Movistar Liga de Campeones', 'Movistar Plus+ HD'], description: 'Movistar Plus+ Spain' },
      { id: 'as19-7', frequency: 11229, polarity: 'V', symbolRate: 22000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['BBC News HD', 'DW English HD', 'NHK World Japan'], description: 'International FTA Broadcasters' }
    ]
  },
  {
    id: 'eutelsat-16-ku',
    name: 'Eutelsat 16A (16.0°E)',
    nameAr: 'يوتلسات 16 (16.0°E)',
    pos: 16.0,
    band: 'KU',
    orbitalSlot: '16.0°E',
    lnbDefault: '9750/10600',
    region: 'Central Europe / Balkans / Albania',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-16E.php',
    transponders: [
      { id: 'eu16-1', frequency: 11221, polarity: 'H', symbolRate: 30000, fec: '3/5', modulation: 'DVB-S2 8PSK', beam: 'Europe B', isFta: false, channels: ['Top Channel HD', 'Klan HD', 'SuperSport 1 HD'], description: 'DigitAlb Albania Bouquet' },
      { id: 'eu16-2', frequency: 11637, polarity: 'H', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe A', isFta: false, channels: ['RTS 1 HD', 'Nova S HD', 'Sport Klub 1 HD'], description: 'Total TV Serbia / Croatia' },
      { id: 'eu16-3', frequency: 11304, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe A', isFta: false, channels: ['Arena Sport 1 HD', 'Arena Sport 2 HD'], description: 'Arena Channels Group' },
      { id: 'eu16-4', frequency: 12564, polarity: 'V', symbolRate: 3617, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe A', isFta: true, channels: ['Slovenia TV 1', 'RTV Slovenija HD'], description: 'Slovenia Public Service' }
    ]
  },
  {
    id: 'hotbird-13-ku',
    name: 'Hot Bird 13F / 13G (13.0°E)',
    nameAr: 'هوت بيرد (13.0°E)',
    pos: 13.0,
    band: 'KU',
    orbitalSlot: '13.0°E',
    lnbDefault: '9750/10600',
    region: 'Europe / North Africa / Middle East',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-13E.php',
    transponders: [
      { id: 'hb-1', frequency: 10992, polarity: 'V', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S QPSK', beam: 'Super Ku', isFta: true, channels: ['Rai 1 HD', 'Rai 2 HD', 'Rai 3 HD', 'Rai News 24'], description: 'RAI Radiotelevisione Italiana (Primary Ref)' },
      { id: 'hb-2', frequency: 11034, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Super Ku', isFta: true, channels: ['TVP Info HD', 'TVP Polonia HD', 'Polsat News 2'], description: 'Telewizja Polska Public TV' },
      { id: 'hb-3', frequency: 11411, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Wide', isFta: false, channels: ['Canal+ Sport HD', 'Eleven Sports 1 HD', 'HBO HD Polska'], description: 'Canal+ Polska / Polsat Box' },
      { id: 'hb-4', frequency: 11727, polarity: 'V', symbolRate: 29900, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Wide', isFta: false, channels: ['Sky Uno HD', 'Sky Sport Uno HD', 'Sky Cinema Uno HD'], description: 'Sky Italia HD Bouquet' },
      { id: 'hb-5', frequency: 12597, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Super Ku', isFta: true, channels: ['Euronews English HD', 'Euronews Français', 'BBC Arabic HD'], description: 'International FTA News' },
      { id: 'hb-6', frequency: 12226, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Wide', isFta: false, channels: ['Eleven Sports 1 4K', 'Museum 4K', 'Love Nature 4K'], description: 'Hotbird 4K Ultra HD Transponder' },
      { id: 'hb-7', frequency: 11488, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Wide', isFta: false, channels: ['Canal+ Family HD', 'Ale Kino+ HD', 'MiniMini+'], description: 'ITI Neovision Poland' }
    ]
  },
  {
    id: 'eutelsat-10-ku',
    name: 'Eutelsat 10B (10.0°E)',
    nameAr: 'يوتلسات 10B (10.0°E)',
    pos: 10.0,
    band: 'KU',
    orbitalSlot: '10.0°E',
    lnbDefault: '9750/10600',
    region: 'Aviation / Maritime / Feeds',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-10E.php',
    transponders: [
      { id: 'eu10-1', frequency: 11222, polarity: 'V', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe Wide', isFta: true, channels: ['BFBS 1', 'BFBS 2', 'BFBS Extra'], description: 'British Forces Broadcasting' },
      { id: 'eu10-2', frequency: 11346, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Wide', isFta: true, channels: ['CCTV News Feed', 'CGTN Documentary'], description: 'Broadcasting Feed' }
    ]
  },
  {
    id: 'eutelsat-9-ku',
    name: 'Eutelsat 9B / Ka-Sat (9.0°E)',
    nameAr: 'يوتلسات 9 (9.0°E) مولتيستريم',
    pos: 9.0,
    band: 'KU',
    orbitalSlot: '9.0°E',
    lnbDefault: '9750/10600',
    region: 'Europe / Italy Multistream / Greece',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-9E.php',
    transponders: [
      { id: 'eu9-1', frequency: 11900, polarity: 'H', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Germany Ku', isFta: false, channels: ['Kabelkiosk HD', 'Kabel Eins Classics'], description: 'M7 Kabelkiosk Germany' },
      { id: 'eu9-2', frequency: 12034, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Greece Ku', isFta: false, channels: ['Cosmote Sport 1 HD', 'Cosmote Cinema HD'], description: 'Cosmote TV Greece' },
      { id: 'eu9-3', frequency: 12111, polarity: 'V', symbolRate: 31400, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Italy MIS', isFta: true, channels: ['Canale 5 HD', 'Italia 1 HD', 'Rete 4 HD (Multistream)'], description: 'Mediaset Italy DTT Multistream' },
      { id: 'eu9-4', frequency: 12265, polarity: 'V', symbolRate: 31400, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Italy MIS', isFta: true, channels: ['LA7 HD', 'LA7d HD', 'TG La7 (Multistream)'], description: 'Cairo Due Italy Multistream' }
    ]
  },

  // ===================== CENTRAL GREENWICH ARC (7.0°E to 8.0°W) =====================
  {
    id: 'eutelsat-7-ku',
    name: 'Eutelsat 7B / 7C (7.0°E)',
    nameAr: 'يوتلسات 7 (7.0°E)',
    pos: 7.0,
    band: 'KU',
    orbitalSlot: '7.0°E',
    lnbDefault: '9750/10600',
    region: 'Turkey / Africa / Middle East',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-7E.php',
    transponders: [
      { id: 'eu7-1', frequency: 10721, polarity: 'V', symbolRate: 22000, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Europe B', isFta: true, channels: ['Manoto HD', 'BBC Persian HD', 'Iran International HD'], description: 'Persian News & Entertainment (Ref TP)' },
      { id: 'eu7-2', frequency: 11387, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Europe B', isFta: true, channels: ['Iran International HD', 'Radio Farda TV'], description: 'Persian Free Information' },
      { id: 'eu7-3', frequency: 11471, polarity: 'V', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 QPSK', beam: 'Turkey Ku', isFta: false, channels: ['Digiturk beIN Sports 1 Turkey', 'beIN Movies Premiere HD'], description: 'Digiturk Turkey Bouquet' }
    ]
  },
  {
    id: 'astra-4a-ku',
    name: 'Astra 4A / SES 5 (4.8°E)',
    nameAr: 'أسترا 4A (4.8°E)',
    pos: 4.8,
    band: 'KU',
    orbitalSlot: '4.8°E',
    lnbDefault: '9750/10600',
    region: 'Nordic / Ukraine / Baltic',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-4.8E.php',
    transponders: [
      { id: 'as4-1', frequency: 11766, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe BSS', isFta: false, channels: ['Viasat Sport Premium HD', 'TV3 HD Sweden', 'TV6 HD'], description: 'Allente Nordic Bouquet' },
      { id: 'as4-2', frequency: 12073, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Europe FSS', isFta: true, channels: ['1+1 Ukraine HD', 'Inter HD', 'Rada TV HD'], description: 'Ukrainian National Multiplex (FTA)' },
      { id: 'as4-3', frequency: 11996, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Europe BSS', isFta: false, channels: ['TV3 Baltic', 'TV6 Latvia', '3+ Estonia'], description: 'Viasat Baltic TV' }
    ]
  },
  {
    id: 'bulgariasat-2-ku',
    name: 'BulgariaSat 1 (1.9°E)',
    nameAr: 'بلغاريا سات 1 (1.9°E)',
    pos: 1.9,
    band: 'KU',
    orbitalSlot: '1.9°E',
    lnbDefault: '9750/10600',
    region: 'Balkans / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-1.9E.php',
    transponders: [
      { id: 'bul-1', frequency: 12380, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['Arena Sport 1 Serbia HD', 'Arena Premium 1 HD'], description: 'Neosat Balkans Package' },
      { id: 'bul-2', frequency: 12149, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['BNT 1 HD', 'Bulgaria 24 HD', 'Planeta TV HD'], description: 'Bulgarian Free TV' }
    ]
  },
  {
    id: 'thor-08-ku',
    name: 'Thor 5 / 6 / 7 / Intelsat 10-02 (0.8°W)',
    nameAr: 'ثور 0.8 غرب (0.8°W)',
    pos: -0.8,
    band: 'KU',
    orbitalSlot: '0.8°W',
    lnbDefault: '9750/10600',
    region: 'Nordic / Romania / Hungary / Czech',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-0.8W.php',
    transponders: [
      { id: 'th-1', frequency: 10809, polarity: 'V', symbolRate: 24500, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Thor 5 Nordic', isFta: false, channels: ['NRK 1 HD', 'SVT 1 HD', 'TV 2 Norge HD'], description: 'Allente Nordic Premium' },
      { id: 'th-2', frequency: 12111, polarity: 'V', symbolRate: 28000, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Thor 6 Central', isFta: false, channels: ['Digi Sport 1 Romania HD', 'Pro TV Romania'], description: 'Digi TV Romania / Slovakia' },
      { id: 'th-3', frequency: 11938, polarity: 'H', symbolRate: 28000, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Thor 6 Central', isFta: false, channels: ['M1 HD Hungary', 'RTL Klub Hungary'], description: 'Focus Sat Romania & Hungary' },
      { id: 'th-4', frequency: 12418, polarity: 'V', symbolRate: 28000, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Thor 7 Nordic', isFta: true, channels: ['Visjon Norge', 'Kanal 10 Norge'], description: 'Scandinavian FTA Reference' }
    ]
  },
  {
    id: 'amos-4-ku',
    name: 'Amos 3 / 7 (4.0°W)',
    nameAr: 'أموس (4.0°W)',
    pos: -4.0,
    band: 'KU',
    orbitalSlot: '4.0°W',
    lnbDefault: '9750/10600',
    region: 'Central Europe / Middle East',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-4W.php',
    transponders: [
      { id: 'am-1', frequency: 11031, polarity: 'V', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'ME Beam', isFta: false, channels: ['YES 1 HD', 'YES Action HD', 'Sport 5 HD'], description: 'YES TV Israel Bouquet' },
      { id: 'am-2', frequency: 11140, polarity: 'H', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['1+1 Marathon HD', 'Pershyi HD', 'Suspilne'], description: 'Ukraine National Broadcast' },
      { id: 'am-3', frequency: 11525, polarity: 'H', symbolRate: 8520, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'ME Beam', isFta: true, channels: ['Channel 11 Kan HD', 'Channel 12 Keshet', 'Channel 13 Reshet'], description: 'Israel Terrestrial DTT Feed' }
    ]
  },
  {
    id: 'eutelsat-5w-ku',
    name: 'Eutelsat 5 West B (5.0°W)',
    nameAr: 'يوتلسات 5 غرب (5.0°W) فرنسا وإيطاليا',
    pos: -5.0,
    band: 'KU',
    orbitalSlot: '5.0°W',
    lnbDefault: '9750/10600',
    region: 'France (Fransat) / Italy Multistream',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-5W.php',
    transponders: [
      { id: 'eu5w-1', frequency: 11554, polarity: 'V', symbolRate: 29950, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'France Ku', isFta: false, channels: ['TF1 HD', 'France 2 HD', 'France 3 HD', 'M6 HD'], description: 'Fransat TNT France HD (Ref TP)' },
      { id: 'eu5w-2', frequency: 12543, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Italy MIS', isFta: true, channels: ['Rai 1 HD MIS', 'Rai 2 HD MIS', 'Rai 3 HD (Multistream)'], description: 'RAI Italy DTT Feeds (Multistream 121)' },
      { id: 'eu5w-3', frequency: 12648, polarity: 'V', symbolRate: 29500, fec: '8/9', modulation: 'DVB-S2 8PSK', beam: 'Italy MIS', isFta: true, channels: ['Italia 1 HD MIS', 'Canale 5 HD MIS', 'TGCOM24'], description: 'Mediaset Italy Multistream' },
      { id: 'eu5w-4', frequency: 11096, polarity: 'V', symbolRate: 29950, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'France Ku', isFta: false, channels: ['Canal+ Fransat', 'C8 HD', 'W9 HD', 'TMC HD'], description: 'Fransat Commercial Channels' }
    ]
  },
  {
    id: 'nilesat-7w-ku',
    name: 'Nilesat 201 / Nilesat 301 (7.0°W)',
    nameAr: 'نايل سات 201 / 301 (7.0°W)',
    pos: -7.0,
    band: 'KU',
    orbitalSlot: '7.0°W',
    lnbDefault: '9750/10600',
    region: 'North Africa / Middle East (MENA)',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-7W.php',
    transponders: [
      { id: 'nil-1', frequency: 11636, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 201', isFta: true, channels: ['Al Masriya', 'Nile News', 'Nile Drama', 'Nile Sports'], description: 'ERTV Egypt Bouquet (Strongest Installer Ref)' },
      { id: 'nil-2', frequency: 11766, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 201', isFta: true, channels: ['Al Jazeera HD', 'Al Jazeera Mubasher', 'Al Jazeera English'], description: 'Al Jazeera Media Network' },
      { id: 'nil-3', frequency: 11938, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 201', isFta: true, channels: ['MBC 1 HD', 'MBC 2 HD', 'MBC Action', 'MBC Masr HD'], description: 'MBC Group Arabic Network' },
      { id: 'nil-4', frequency: 12054, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 201', isFta: true, channels: ['Kuwait TV 1 HD', 'Kuwait Sports', 'Al Arabiya HD'], description: 'Kuwait Media Network' },
      { id: 'nil-5', frequency: 12303, polarity: 'H', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 301', isFta: true, channels: ['Programme National HD (الأرضية الجزائرية)', 'Canal Algérie HD', 'Algérie 3 HD', 'TV 4 Tamazight'], description: 'EPTV Algeria National Bouquet (BISS)' },
      { id: 'nil-6', frequency: 12604, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 301', isFta: true, channels: ['Rotana Cinema HD', 'Rotana Classic', 'Rotana Khalijiah'], description: 'Rotana Media Group HD' },
      { id: 'nil-7', frequency: 11595, polarity: 'V', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Nilesat 301', isFta: true, channels: ['El Bilad TV', 'Ennahar TV HD', 'Echourouk TV HD', 'El Heddaf TV'], description: 'Algerian Private News Channels' }
    ]
  },
  {
    id: 'eutelsat-8w-ku',
    name: 'Eutelsat 8 West B (8.0°W) Ku',
    nameAr: 'يوتلسات 8 غرب (8.0°W) ملاصق للنايلسات',
    pos: -8.0,
    band: 'KU',
    orbitalSlot: '8.0°W',
    lnbDefault: '9750/10600',
    region: 'MENA Adjacent to Nilesat',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-8W.php',
    transponders: [
      { id: 'eu8-k1', frequency: 11054, polarity: 'H', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'MENA Ku', isFta: true, channels: ['beIN Sports HD (Free)', 'beIN Sports News HD', 'Al Kass HD'], description: 'beIN Sports Free-to-Air HD Bouquet' },
      { id: 'eu8-k2', frequency: 12646, polarity: 'H', symbolRate: 27500, fec: '7/8', modulation: 'DVB-S QPSK', beam: 'Maghreb Ku', isFta: true, channels: ['Algeria Public News', 'Libya Alrasmia TV', 'Tunisia Nat 1'], description: 'Maghreb North Africa Bouquet' },
      { id: 'eu8-k3', frequency: 11137, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'MENA Ku', isFta: true, channels: ['ON Time Sports 1 HD', 'ON Time Sports 2 HD', 'Al Ahly TV'], description: 'Egyptian Sports HD Network' },
      { id: 'eu8-k4', frequency: 11012, polarity: 'H', symbolRate: 27500, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'MENA Ku', isFta: false, channels: ['beIN Sports 1 Premium', 'beIN Sports 2 Premium'], description: 'beIN Sports Exclusive Premium' }
    ]
  },
  {
    id: 'eutelsat-8w-c',
    name: 'Eutelsat 8 West B (8.0°W) C-Band',
    nameAr: 'يوتلسات 8 غرب (8.0°W) باند C',
    pos: -8.0,
    band: 'C',
    orbitalSlot: '8.0°W',
    lnbDefault: '5150',
    region: 'Africa / Latin / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-8W.php',
    transponders: [
      { id: 'eu8-c1', frequency: 3725, polarity: 'R', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: true, channels: ['CRTV Cameroon', 'RTI 1 Ivory Coast', 'ORTM Mali'], description: 'West African National TV' },
      { id: 'eu8-c2', frequency: 3854, polarity: 'R', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: true, channels: ['Tele Congo', 'Gabon 1ere', 'RTNC DR Congo'], description: 'Central Africa Broadcasters' }
    ]
  },

  // ===================== WESTERN & ATLANTIC ARC (11.0°W to 70.0°W) =====================
  {
    id: 'express-am44-ku',
    name: 'Express AM44 (11.0°W)',
    nameAr: 'إكسبريس AM44 (11.0°W)',
    pos: -11.0,
    band: 'KU',
    orbitalSlot: '11.0°W',
    lnbDefault: '9750/10600',
    region: 'Atlantic / Mediterranean Feeds',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-11W.php',
    transponders: [
      { id: 'am44-1', frequency: 11565, polarity: 'H', symbolRate: 8000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['Capri Television HD', 'Odeon 24', 'Radio Capri'], description: 'Italian Regional Channels' },
      { id: 'am44-2', frequency: 11520, polarity: 'H', symbolRate: 1666, fec: '5/6', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: true, channels: ['Data Link', 'Feed SNG'], description: 'Occasional Video Link' }
    ]
  },
  {
    id: 'telstar-15w-ku',
    name: 'Telstar 12 Vantage (15.0°W)',
    nameAr: 'تيلستار 12 (15.0°W)',
    pos: -15.0,
    band: 'KU',
    orbitalSlot: '15.0°W',
    lnbDefault: '9750/10600',
    region: 'Atlantic Ocean / Americas / Europe',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-15W.php',
    transponders: [
      { id: 'tel15-1', frequency: 11495, polarity: 'V', symbolRate: 44100, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Spot', isFta: true, channels: ['Maritime Global News', 'Cruise TV'], description: 'Transatlantic Maritime Feed' },
      { id: 'tel15-2', frequency: 12608, polarity: 'H', symbolRate: 19279, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: true, channels: ['MSNBC HD (BISS)', 'CNBC US Feed', 'NBC Feed'], description: 'NBC Universal Feeds' },
      { id: 'tel15-3', frequency: 12588, polarity: 'H', symbolRate: 3400, fec: '3/4', modulation: 'DVB-S2 QPSK', beam: 'Europe Ku', isFta: true, channels: ['Aviation Weather Link', 'Aero Link'], description: 'Aviation Feeds' }
    ]
  },
  {
    id: 'ses-4-c',
    name: 'SES 4 (22.0°W) C-Band & Ku',
    nameAr: 'إس إي إس 4 (22.0°W)',
    pos: -22.0,
    band: 'C',
    orbitalSlot: '22.0°W',
    lnbDefault: '5150',
    region: 'Atlantic / West Africa / Latin America',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-22W.php',
    transponders: [
      { id: 'ses4-1', frequency: 3749, polarity: 'L', symbolRate: 20830, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Global C', isFta: true, channels: ['RTS 1 Senegal HD', '2sTV Senegal', 'ORTM 1 Mali'], description: 'Senegal & Mali National DTH' },
      { id: 'ses4-2', frequency: 4115, polarity: 'L', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Africa C', isFta: false, channels: ['Canal+ Sport 1 Afrique', 'Noveletas'], description: 'Canal+ Afrique C-Band DTH' },
      { id: 'ses4-3', frequency: 11551, polarity: 'V', symbolRate: 45000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'West Africa Ku', isFta: false, channels: ['Canal+ Action Afrique', 'A+ HD'], description: 'Canal+ Overseas Ku-Band' }
    ]
  },
  {
    id: 'alcomsat-24w-ku',
    name: 'Alcomsat-1 (24.8°W)',
    nameAr: 'ألكوم سات 1 (24.8°W) القمر الجزائري',
    pos: -24.8,
    band: 'KU',
    orbitalSlot: '24.8°W',
    lnbDefault: '9750/10600',
    region: 'Algeria / North Africa / Sahel',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-24.8W.php',
    transponders: [
      { id: 'alc-1', frequency: 12240, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'North Africa Ku', isFta: true, channels: ['TV 1 Algérie HD', 'Canal Algérie HD', 'TV 3 Algérie HD', 'TV 4 Tamazight HD', 'TV 5 Coran HD', 'TV 6 Jeunesse HD', 'TV 7 El Maarifa HD', 'TV 8 Edhakira HD'], description: 'EPTV Algerian National Public Bouquet' },
      { id: 'alc-2', frequency: 12160, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'North Africa Ku', isFta: true, channels: ['Chaîne 1 Radio', 'Chaîne 2 Radio', 'Chaîne 3 Radio', 'Radio Algérie Internationale'], description: 'Radio Algérienne Complete Bouquet' },
      { id: 'alc-3', frequency: 12320, polarity: 'H', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'North Africa Ku', isFta: true, channels: ['TDA Telecom Feed', 'APS News Wire Feed'], description: 'Télédiffusion d\'Algérie Telecom' }
    ]
  },
  {
    id: 'hispasat-30w-ku',
    name: 'Hispasat 30W-5 / 30W-6 (30.0°W)',
    nameAr: 'هيسباسات (30.0°W)',
    pos: -30.0,
    band: 'KU',
    orbitalSlot: '30.0°W',
    lnbDefault: '9750/10600',
    region: 'Spain / Portugal / Latin America',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-30W.php',
    transponders: [
      { id: 'his-1', frequency: 12207, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['RTP 1 HD', 'SIC HD', 'TVI HD', 'Sport TV 1 HD'], description: 'MEO Portugal Pay Bouquet' },
      { id: 'his-2', frequency: 12398, polarity: 'H', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['Sport TV 2 HD', 'Canal 11 HD', 'Cinemundo HD'], description: 'NOS Portugal Pay Bouquet' },
      { id: 'his-3', frequency: 10770, polarity: 'H', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['La 1 HD', 'La 2 HD', 'Antena 3 HD', 'Cuatro HD', 'Telecinco HD'], description: 'Abertis Telecom Spanish DTT (BISS)' },
      { id: 'his-4', frequency: 11811, polarity: 'V', symbolRate: 27500, fec: '3/4', modulation: 'DVB-S QPSK', beam: 'Europe Ku', isFta: true, channels: ['Hispasat 4K Promo', 'Canal Extremadura', 'Radio Exterior de España'], description: 'Hispasat Technical Promo FTA' },
      { id: 'his-5', frequency: 11382, polarity: 'H', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Europe Ku', isFta: false, channels: ['Castilla-La Mancha Media', 'Aragon TV HD'], description: 'Spanish Autonomous Regions' }
    ]
  },
  {
    id: 'ses-6-40w-c',
    name: 'SES 6 (40.5°W)',
    nameAr: 'إس إي إس 6 (40.5°W) باند C',
    pos: -40.5,
    band: 'C',
    orbitalSlot: '40.5°W',
    lnbDefault: '5150',
    region: 'Latin America / Brazil / Caribbean',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-40.5W.php',
    transponders: [
      { id: 'ses6-1', frequency: 3803, polarity: 'L', symbolRate: 27500, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Latin America C', isFta: true, channels: ['Rede Globo HD', 'TV Brasil HD', 'TV Cultura HD'], description: 'Brazilian National Broadcasting' },
      { id: 'ses6-2', frequency: 4055, polarity: 'R', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Latin America C', isFta: false, channels: ['Caracol TV HD', 'RCN Nuestra Tele', 'Win Sports+'], description: 'Colombia & Andean Package' }
    ]
  },
  {
    id: 'intelsat-14-c',
    name: 'Intelsat 14 (45.0°W)',
    nameAr: 'إنتلسات 14 (45.0°W) باند C',
    pos: -45.0,
    band: 'C',
    orbitalSlot: '45.0°W',
    lnbDefault: '5150',
    region: 'Americas / Atlantic Ocean',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-45W.php',
    transponders: [
      { id: 'is14-1', frequency: 3740, polarity: 'H', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Pan-American C', isFta: true, channels: ['TeleSUR HD', 'ViVe TV', 'TVES'], description: 'Pan-American Public Feeds' },
      { id: 'is14-2', frequency: 4080, polarity: 'V', symbolRate: 28000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'Pan-American C', isFta: false, channels: ['Latin Cinema', 'TyC Sports HD'], description: 'South American Feeds' }
    ]
  },
  {
    id: 'intelsat-21-c',
    name: 'Intelsat 21 (58.0°W)',
    nameAr: 'إنتلسات 21 (58.0°W) باند C',
    pos: -58.0,
    band: 'C',
    orbitalSlot: '58.0°W',
    lnbDefault: '5150',
    region: 'North & South America',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-58W.php',
    transponders: [
      { id: 'is21-1', frequency: 3840, polarity: 'V', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Americas C', isFta: false, channels: ['CNN En Español HD', 'Cartoon Network LA', 'TNT Latin America'], description: 'Warner Bros Discovery Latin' },
      { id: 'is21-2', frequency: 4120, polarity: 'H', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Americas C', isFta: false, channels: ['Discovery Channel Latin', 'Animal Planet LA'], description: 'Discovery Networks Latin' }
    ]
  },
  {
    id: 'amazonas-61w-ku',
    name: 'Amazonas 2 / 3 / 5 (61.0°W)',
    nameAr: 'أمازوناس (61.0°W) كو وباند C',
    pos: -61.0,
    band: 'KU',
    orbitalSlot: '61.0°W',
    lnbDefault: '10750',
    region: 'South America / Brazil / Chile',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-61W.php',
    transponders: [
      { id: 'amz-1', frequency: 12270, polarity: 'H', symbolRate: 30000, fec: '2/3', modulation: 'DVB-S2 8PSK', beam: 'South America Ku', isFta: false, channels: ['Vivo TV Brazil HD', 'SporTV HD', 'Premiere FC'], description: 'Vivo DTH Brazil' },
      { id: 'amz-2', frequency: 12310, polarity: 'V', symbolRate: 30000, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Andean Ku', isFta: false, channels: ['Movistar TV Chile HD', 'Canal 13 HD', 'Chilevision'], description: 'Movistar TV Latin America' },
      { id: 'amz-3', frequency: 11095, polarity: 'V', symbolRate: 30000, fec: '5/6', modulation: 'DVB-S2 8PSK', beam: 'South America Ku', isFta: true, channels: ['Amazonas Promo HD', 'Rede Vida'], description: 'Reference FTA South America' }
    ]
  },
  {
    id: 'starone-70w-ku',
    name: 'Star One D2 / C4 (70.0°W)',
    nameAr: 'ستار ون D2 (70.0°W)',
    pos: -70.0,
    band: 'KU',
    orbitalSlot: '70.0°W',
    lnbDefault: '10750',
    region: 'Brazil / South America',
    kingOfSatUrl: 'https://fr.kingofsat.net/pos-70W.php',
    transponders: [
      { id: 'so-1', frequency: 12220, polarity: 'H', symbolRate: 29900, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Brazil Ku', isFta: false, channels: ['Claro TV HD Brazil', 'Globo SP HD', 'Band HD'], description: 'Claro TV Brazil Main DTH' },
      { id: 'so-2', frequency: 12460, polarity: 'H', symbolRate: 29900, fec: '3/4', modulation: 'DVB-S2 8PSK', beam: 'Brazil Ku', isFta: true, channels: ['Canal Claro HD', 'Canal do Boi', 'Agro Canal'], description: 'Claro Free Promo & Agri Channels' }
    ]
  }
];

export const POPULAR_CITIES = [
  // Algeria
  { name: 'Algiers', nameAr: 'الجزائر العاصمة', latitude: 36.7538, longitude: 3.0588 },
  { name: 'Oran', nameAr: 'وهران', latitude: 35.6987, longitude: -0.6349 },
  { name: 'Constantine', nameAr: 'قسنطينة', latitude: 36.3650, longitude: 6.6147 },
  { name: 'Setif', nameAr: 'سطيف', latitude: 36.1911, longitude: 5.4137 },
  { name: 'Annaba', nameAr: 'عنابة', latitude: 36.9000, longitude: 7.7667 },
  { name: 'Ouargla', nameAr: 'ورقلة', latitude: 31.9530, longitude: 5.3283 },
  { name: 'Batna', nameAr: 'باتنة', latitude: 35.5558, longitude: 6.1741 },
  { name: 'Tlemcen', nameAr: 'تلمسان', latitude: 34.8783, longitude: -1.3150 },
  { name: 'Biskra', nameAr: 'بسكرة', latitude: 34.8504, longitude: 5.7281 },
  { name: 'Tamanrasset', nameAr: 'تمنراست', latitude: 22.7850, longitude: 5.5228 },
  // Tunisia & Morocco & Libya
  { name: 'Tunis', nameAr: 'تونس', latitude: 36.8065, longitude: 10.1815 },
  { name: 'Sfax', nameAr: 'صفاقس', latitude: 34.7406, longitude: 10.7603 },
  { name: 'Casablanca', nameAr: 'الدار البيضاء', latitude: 33.5731, longitude: -7.5898 },
  { name: 'Rabat', nameAr: 'الرباط', latitude: 34.0209, longitude: -6.8416 },
  { name: 'Tangier', nameAr: 'طنجة', latitude: 35.7595, longitude: -5.8340 },
  { name: 'Tripoli', nameAr: 'طرابلس', latitude: 32.8872, longitude: 13.1913 },
  // Egypt & Middle East & Gulf
  { name: 'Cairo', nameAr: 'القاهرة', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Alexandria', nameAr: 'الإسكندرية', latitude: 31.2001, longitude: 29.9187 },
  { name: 'Riyadh', nameAr: 'الرياض', latitude: 24.7136, longitude: 46.6753 },
  { name: 'Jeddah', nameAr: 'جدة', latitude: 21.4858, longitude: 39.1925 },
  { name: 'Dubai', nameAr: 'دبي', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Baghdad', nameAr: 'بغداد', latitude: 33.3152, longitude: 44.3661 },
  { name: 'Amman', nameAr: 'عمان', latitude: 31.9454, longitude: 35.9284 },
  { name: 'Beirut', nameAr: 'بيروت', latitude: 33.8938, longitude: 35.5018 },
  { name: 'Doha', nameAr: 'الدوحة', latitude: 25.2854, longitude: 51.5310 },
  // Europe
  { name: 'Paris', nameAr: 'باريس', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Marseille', nameAr: 'مارسيليا', latitude: 43.2965, longitude: 5.3698 },
  { name: 'Madrid', nameAr: 'مدريد', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Rome', nameAr: 'روما', latitude: 41.9028, longitude: 12.4964 },
  { name: 'London', nameAr: 'لندن', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Istanbul', nameAr: 'إسطنبول', latitude: 41.0082, longitude: 28.9784 }
];
