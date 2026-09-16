// Telecom CDR / IPDR Parser and Analytical Engine
// Universal parser supporting standard Indian TSP formats (Airtel, Jio, Vi, BSNL)

export const SAMPLE_PUNE_CYBER_CDR = [
  {
    recordId: 'CDR-PUN-001',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919422001122',
    calledName: 'Rohit Verma (Mule Lead)',
    timestamp: '2026-03-08T23:42:15',
    durationSec: 340,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-002',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919822334455',
    calledName: 'Vikram Shinde (Hawala Broker)',
    timestamp: '2026-03-09T01:15:30',
    durationSec: 512,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12B',
    lastCellTower: 'Shivajinagar Tower 12B',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5312,
    lng: 73.8480,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-003',
    callingNumber: '+919422001122',
    callingName: 'Rohit Verma (Mule Lead)',
    calledNumber: '+919820123456',
    calledName: 'Sameer Khan',
    timestamp: '2026-03-09T02:04:10',
    durationSec: 185,
    callType: 'Voice Incoming',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-004',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+918800112233',
    calledName: 'Mule Account Operative (Kothrud)',
    timestamp: '2026-03-09T03:30:45',
    durationSec: 92,
    callType: 'SMS Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-005',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919133445566',
    calledName: 'VoIP Gateway / Cyber Desk',
    timestamp: '2026-03-09T10:14:22',
    durationSec: 420,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1809-04B',
    firstCellTower: 'Swargate Junction Tower 04B',
    firstCellSector: '240° (SW)',
    lastCellId: '404-45-1809-04B',
    lastCellTower: 'Swargate Junction Tower 04B',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5018,
    lng: 73.8585,
    isNocturnal: false
  },
  {
    recordId: 'CDR-PUN-006',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919822334455',
    calledName: 'Vikram Shinde (Hawala Broker)',
    timestamp: '2026-03-09T14:45:10',
    durationSec: 210,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1809-04B',
    firstCellTower: 'Swargate Junction Tower 04B',
    firstCellSector: '240° (SW)',
    lastCellId: '404-45-1809-04B',
    lastCellTower: 'Swargate Junction Tower 04B',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5018,
    lng: 73.8585,
    isNocturnal: false
  },
  {
    recordId: 'CDR-PUN-007',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919422001122',
    calledName: 'Rohit Verma (Mule Lead)',
    timestamp: '2026-03-09T18:22:00',
    durationSec: 615,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-2101-09C',
    firstCellTower: 'Hinjewadi Phase-1 Tower 09C',
    firstCellSector: '0° (N)',
    lastCellId: '404-45-2101-09C',
    lastCellTower: 'Hinjewadi Phase-1 Tower 09C',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5912,
    lng: 73.7389,
    isNocturnal: false
  },
  {
    recordId: 'CDR-PUN-008',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919422001122',
    calledName: 'Rohit Verma (Mule Lead)',
    timestamp: '2026-03-09T23:50:18',
    durationSec: 480,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-009',
    callingNumber: '+917711223344',
    callingName: 'Burner SIM #2 (Pune Cyber)',
    calledNumber: '+919822334455',
    calledName: 'Vikram Shinde (Hawala Broker)',
    timestamp: '2026-03-10T00:15:20',
    durationSec: 290,
    callType: 'Voice Outgoing',
    imei: '864209040182741', // SAME IMEI! SIM Swapped
    imsi: '404450998877665', // DIFFERENT IMSI
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-010',
    callingNumber: '+917711223344',
    callingName: 'Burner SIM #2 (Pune Cyber)',
    calledNumber: '+919422001122',
    calledName: 'Rohit Verma (Mule Lead)',
    timestamp: '2026-03-10T01:40:12',
    durationSec: 520,
    callType: 'Voice Outgoing',
    imei: '864209040182741', // SAME IMEI
    imsi: '404450998877665', // Swapped IMSI
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-011',
    callingNumber: '+916622334455',
    callingName: 'Burner SIM #3 (Overseas Proxy)',
    calledNumber: '+919820123456',
    calledName: 'Sameer Khan',
    timestamp: '2026-03-10T03:10:00',
    durationSec: 195,
    callType: 'Voice Incoming',
    imei: '864209040182741', // SAME IMEI - 3rd SIM Swap!
    imsi: '404450554433221', // 3rd IMSI
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-012',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919988776655',
    calledName: 'Deepak Patil (Logistics)',
    timestamp: '2026-03-10T11:20:45',
    durationSec: 140,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1809-04B',
    firstCellTower: 'Swargate Junction Tower 04B',
    firstCellSector: '240° (SW)',
    lastCellId: '404-45-1809-04B',
    lastCellTower: 'Swargate Junction Tower 04B',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5018,
    lng: 73.8585,
    isNocturnal: false
  },
  {
    recordId: 'CDR-PUN-013',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+919822334455',
    calledName: 'Vikram Shinde (Hawala Broker)',
    timestamp: '2026-03-10T16:05:10',
    durationSec: 330,
    callType: 'Voice Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1809-04B',
    firstCellTower: 'Swargate Junction Tower 04B',
    firstCellSector: '240° (SW)',
    lastCellId: '404-45-1809-04B',
    lastCellTower: 'Swargate Junction Tower 04B',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5018,
    lng: 73.8585,
    isNocturnal: false
  },
  {
    recordId: 'CDR-PUN-014',
    callingNumber: '+919422001122',
    callingName: 'Rohit Verma (Mule Lead)',
    calledNumber: '+919820123456',
    calledName: 'Sameer Khan',
    timestamp: '2026-03-10T23:18:30',
    durationSec: 410,
    callType: 'Voice Incoming',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  },
  {
    recordId: 'CDR-PUN-015',
    callingNumber: '+919820123456',
    callingName: 'Sameer Khan',
    calledNumber: '+918800112233',
    calledName: 'Mule Account Operative (Kothrud)',
    timestamp: '2026-03-11T02:45:00',
    durationSec: 68,
    callType: 'SMS Outgoing',
    imei: '864209040182741',
    imsi: '404450123456789',
    firstCellId: '404-45-1204-12A',
    firstCellTower: 'Shivajinagar Tower 12A',
    firstCellSector: '120° (SE)',
    lastCellId: '404-45-1204-12A',
    lastCellTower: 'Shivajinagar Tower 12A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.5308,
    lng: 73.8475,
    isNocturnal: true
  }
];

export const SAMPLE_SWARGATE_EXTORTION_CDR = [
  {
    recordId: 'CDR-EXT-001',
    callingNumber: '+919933441122',
    callingName: 'Target Extortionist #1',
    calledNumber: '+919822114400',
    calledName: 'Victim Merchant (Market Yard)',
    timestamp: '2026-03-12T00:30:10',
    durationSec: 180,
    callType: 'Voice Outgoing',
    imei: '358902094182900',
    imsi: '404200889911223',
    firstCellId: '404-20-8812-01A',
    firstCellTower: 'Market Yard Gate-2 Tower 01A',
    firstCellSector: '0° (N)',
    lastCellId: '404-20-8812-01A',
    lastCellTower: 'Market Yard Gate-2 Tower 01A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.4890,
    lng: 73.8640,
    isNocturnal: true
  },
  {
    recordId: 'CDR-EXT-002',
    callingNumber: '+919933441122',
    callingName: 'Target Extortionist #1',
    calledNumber: '+919822334455',
    calledName: 'Vikram Shinde (Hawala Broker)',
    timestamp: '2026-03-12T01:12:44',
    durationSec: 245,
    callType: 'Voice Outgoing',
    imei: '358902094182900',
    imsi: '404200889911223',
    firstCellId: '404-20-8812-01A',
    firstCellTower: 'Market Yard Gate-2 Tower 01A',
    firstCellSector: '0° (N)',
    lastCellId: '404-20-8812-01A',
    lastCellTower: 'Market Yard Gate-2 Tower 01A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.4890,
    lng: 73.8640,
    isNocturnal: true
  },
  {
    recordId: 'CDR-EXT-003',
    callingNumber: '+919933441122',
    callingName: 'Target Extortionist #1',
    calledNumber: '+919422001122',
    calledName: 'Rohit Verma (Mule Lead)',
    timestamp: '2026-03-12T02:50:19',
    durationSec: 420,
    callType: 'Voice Outgoing',
    imei: '358902094182900',
    imsi: '404200889911223',
    firstCellId: '404-20-8812-01A',
    firstCellTower: 'Market Yard Gate-2 Tower 01A',
    firstCellSector: '0° (N)',
    lastCellId: '404-20-8812-01A',
    lastCellTower: 'Market Yard Gate-2 Tower 01A',
    circle: 'Maharashtra & Goa (Pune)',
    lat: 18.4890,
    lng: 73.8640,
    isNocturnal: true
  }
];

export function parseCDRCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
  const rawHeaders = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  // Find column indices
  const findCol = (aliases) => {
    return rawHeaders.findIndex(h => aliases.some(alias => h.includes(alias)));
  };

  const callingIdx = findCol(['calling', 'a_party', 'a_num', 'msisdn', 'caller', 'source', 'from']);
  const calledIdx = findCol(['called', 'b_party', 'b_num', 'callee', 'destination', 'target', 'to']);
  const timeIdx = findCol(['date', 'time', 'timestamp', 'start_time', 'call_time', 'datetime']);
  const durIdx = findCol(['dur', 'duration', 'sec', 'seconds', 'length']);
  const typeIdx = findCol(['type', 'call_type', 'service', 'event']);
  const imeiIdx = findCol(['imei', 'handset', 'device']);
  const imsiIdx = findCol(['imsi', 'sim']);
  const firstCellIdx = findCol(['first_cell', 'firstcell', 'orig_cell', 'cell_id', 'site_id']);
  const lastCellIdx = findCol(['last_cell', 'lastcell', 'term_cell']);
  const towerIdx = findCol(['tower', 'location', 'site_name', 'address']);
  const circleIdx = findCol(['circle', 'state', 'telecom_circle', 'region']);
  const latIdx = findCol(['lat', 'latitude']);
  const lngIdx = findCol(['lng', 'lon', 'longitude']);

  const parsedRecords = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) continue;

    const calling = callingIdx !== -1 ? cols[callingIdx] : (cols[0] || 'Unknown');
    const called = calledIdx !== -1 ? cols[calledIdx] : (cols[1] || 'Unknown');
    const rawTime = timeIdx !== -1 ? cols[timeIdx] : new Date().toISOString();
    const duration = durIdx !== -1 ? parseInt(cols[durIdx], 10) || 0 : 60;
    const callType = typeIdx !== -1 ? cols[typeIdx] : 'Voice Outgoing';
    const imei = imeiIdx !== -1 ? cols[imeiIdx] : '864209040182741';
    const imsi = imsiIdx !== -1 ? cols[imsiIdx] : '404450123456789';
    const firstCell = firstCellIdx !== -1 ? cols[firstCellIdx] : '404-45-1204-12A';
    const lastCell = lastCellIdx !== -1 ? cols[lastCellIdx] : firstCell;
    const tower = towerIdx !== -1 ? cols[towerIdx] : 'Pune Shivajinagar Tower 12A';
    const circle = circleIdx !== -1 ? cols[circleIdx] : 'Maharashtra & Goa';
    const lat = latIdx !== -1 ? parseFloat(cols[latIdx]) || 18.5204 : 18.5204;
    const lng = lngIdx !== -1 ? parseFloat(cols[lngIdx]) || 73.8567 : 73.8567;

    const parsedDate = new Date(rawTime);
    const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const hour = validDate.getHours();
    const isNocturnal = (hour >= 23 || hour < 5);

    parsedRecords.push({
      recordId: `CDR-UP-${String(i).padStart(4, '0')}`,
      callingNumber: calling,
      callingName: calling,
      calledNumber: called,
      calledName: called,
      timestamp: validDate.toISOString(),
      durationSec: duration,
      callType: callType,
      imei: imei,
      imsi: imsi,
      firstCellId: firstCell,
      firstCellTower: tower,
      firstCellSector: '120° (SE)',
      lastCellId: lastCell,
      lastCellTower: tower,
      circle: circle,
      lat: lat,
      lng: lng,
      isNocturnal: isNocturnal
    });
  }

  return parsedRecords;
}

export function analyze24HourHistogram(records) {
  const hourlyBuckets = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${String(i).padStart(2, '0')}:00`,
    count: 0,
    totalDurationSec: 0,
    isNocturnal: (i >= 23 || i < 5),
    calls: []
  }));

  let totalCalls = 0;
  let nocturnalCalls = 0;
  let totalDurationSec = 0;

  records.forEach(r => {
    const d = new Date(r.timestamp);
    const hr = isNaN(d.getTime()) ? 0 : d.getHours();
    hourlyBuckets[hr].count += 1;
    hourlyBuckets[hr].totalDurationSec += (r.durationSec || 0);
    hourlyBuckets[hr].calls.push(r);

    totalCalls += 1;
    totalDurationSec += (r.durationSec || 0);
    if (hr >= 23 || hr < 5) {
      nocturnalCalls += 1;
    }
  });

  const nocturnalPercent = totalCalls > 0 ? Math.round((nocturnalCalls / totalCalls) * 100) : 0;
  
  let peakHour = 0;
  let peakCount = 0;
  hourlyBuckets.forEach(b => {
    if (b.count > peakCount) {
      peakCount = b.count;
      peakHour = b.hour;
    }
  });

  const peakWindow = `${String(peakHour).padStart(2, '0')}:00 - ${String((peakHour + 1) % 24).padStart(2, '0')}:00`;

  return {
    hourlyBuckets,
    totalCalls,
    nocturnalCalls,
    nocturnalPercent,
    totalDurationSec,
    totalDurationFormatted: formatDuration(totalDurationSec),
    peakHour,
    peakWindow,
    peakCount,
    hasHighNocturnalRisk: nocturnalPercent >= 35
  };
}

export function analyzeIMEISwaps(records) {
  const imeiToImsis = new Map();
  const imsiToImeis = new Map();

  records.forEach(r => {
    const imei = (r.imei || '').trim();
    const imsi = (r.imsi || '').trim();
    const phone = (r.callingNumber || '').trim();

    if (imei) {
      if (!imeiToImsis.has(imei)) {
        imeiToImsis.set(imei, {
          imei,
          imsis: new Set(),
          phones: new Set(),
          records: [],
          firstSeen: r.timestamp,
          lastSeen: r.timestamp
        });
      }
      const item = imeiToImsis.get(imei);
      if (imsi) item.imsis.add(imsi);
      if (phone) item.phones.add(phone);
      item.records.push(r);
      if (new Date(r.timestamp) < new Date(item.firstSeen)) item.firstSeen = r.timestamp;
      if (new Date(r.timestamp) > new Date(item.lastSeen)) item.lastSeen = r.timestamp;
    }

    if (imsi) {
      if (!imsiToImeis.has(imsi)) {
        imsiToImeis.set(imsi, {
          imsi,
          imeis: new Set(),
          phones: new Set(),
          records: [],
          firstSeen: r.timestamp,
          lastSeen: r.timestamp
        });
      }
      const item = imsiToImeis.get(imsi);
      if (imei) item.imeis.add(imei);
      if (phone) item.phones.add(phone);
      item.records.push(r);
      if (new Date(r.timestamp) < new Date(item.firstSeen)) item.firstSeen = r.timestamp;
      if (new Date(r.timestamp) > new Date(item.lastSeen)) item.lastSeen = r.timestamp;
    }
  });

  const imeiList = Array.from(imeiToImsis.values()).map(entry => ({
    imei: entry.imei,
    simCount: entry.imsis.size,
    imsisArray: Array.from(entry.imsis),
    phoneCount: entry.phones.size,
    phonesArray: Array.from(entry.phones),
    callCount: entry.records.length,
    firstSeen: entry.firstSeen,
    lastSeen: entry.lastSeen,
    isSwapped: entry.imsis.size > 1,
    riskBadge: entry.imsis.size >= 3 ? 'CRITICAL BURST SWAP' : (entry.imsis.size === 2 ? 'SUSPECT HOPPING' : 'SINGLE SIM')
  }));

  const imsiList = Array.from(imsiToImeis.values()).map(entry => ({
    imsi: entry.imsi,
    handsetCount: entry.imeis.size,
    imeisArray: Array.from(entry.imeis),
    phonesArray: Array.from(entry.phones),
    callCount: entry.records.length,
    firstSeen: entry.firstSeen,
    lastSeen: entry.lastSeen,
    isMultiHandset: entry.imeis.size > 1
  }));

  return {
    imeiList: imeiList.sort((a, b) => b.simCount - a.simCount),
    imsiList: imsiList.sort((a, b) => b.handsetCount - a.handsetCount),
    swapAlertCount: imeiList.filter(i => i.isSwapped).length
  };
}

export function analyzeTopContacts(records, primaryTargetNumber = null) {
  const contactMap = new Map();

  records.forEach(r => {
    const isTargetCalling = primaryTargetNumber ? r.callingNumber === primaryTargetNumber : true;
    const partnerNumber = isTargetCalling ? r.calledNumber : r.callingNumber;
    const partnerName = isTargetCalling ? (r.calledName || r.calledNumber) : (r.callingName || r.callingNumber);

    if (!partnerNumber) return;

    if (!contactMap.has(partnerNumber)) {
      contactMap.set(partnerNumber, {
        phoneNumber: partnerNumber,
        name: partnerName,
        totalCalls: 0,
        incomingCalls: 0,
        outgoingCalls: 0,
        smsCount: 0,
        totalDurationSec: 0,
        nocturnalCalls: 0,
        firstContact: r.timestamp,
        lastContact: r.timestamp,
        towers: new Set()
      });
    }

    const c = contactMap.get(partnerNumber);
    c.totalCalls += 1;
    if (r.callType && r.callType.toLowerCase().includes('in')) {
      c.incomingCalls += 1;
    } else if (r.callType && r.callType.toLowerCase().includes('sms')) {
      c.smsCount += 1;
    } else {
      c.outgoingCalls += 1;
    }
    c.totalDurationSec += (r.durationSec || 0);
    if (r.isNocturnal) c.nocturnalCalls += 1;
    if (r.firstCellTower) c.towers.add(r.firstCellTower);
    if (new Date(r.timestamp) < new Date(c.firstContact)) c.firstContact = r.timestamp;
    if (new Date(r.timestamp) > new Date(c.lastContact)) c.lastContact = r.timestamp;
  });

  const contacts = Array.from(contactMap.values()).map(c => {
    const nocturnalRatio = c.totalCalls > 0 ? (c.nocturnalCalls / c.totalCalls) : 0;
    let risk = 'Low';
    if (c.totalCalls >= 5 || c.nocturnalCalls >= 2 || nocturnalRatio >= 0.4) risk = 'High';
    else if (c.totalCalls >= 2) risk = 'Medium';

    return {
      ...c,
      totalDurationFormatted: formatDuration(c.totalDurationSec),
      towersList: Array.from(c.towers),
      nocturnalRatio: Math.round(nocturnalRatio * 100),
      risk
    };
  });

  return contacts.sort((a, b) => b.totalCalls - a.totalCalls);
}

export function analyzeTowerCoLocation(records) {
  const towerMap = new Map();

  records.forEach(r => {
    const towerId = r.firstCellId || 'TOWER-UNKNOWN';
    if (!towerMap.has(towerId)) {
      towerMap.set(towerId, {
        cellId: towerId,
        towerName: r.firstCellTower || 'Cell Tower Site',
        sector: r.firstCellSector || '0°',
        circle: r.circle || 'Pune',
        lat: r.lat || 18.5204,
        lng: r.lng || 73.8567,
        totalPings: 0,
        dayPings: 0,
        nightPings: 0,
        associatedNumbers: new Set()
      });
    }

    const t = towerMap.get(towerId);
    t.totalPings += 1;
    if (r.isNocturnal) t.nightPings += 1;
    else t.dayPings += 1;
    if (r.callingNumber) t.associatedNumbers.add(r.callingNumber);
    if (r.calledNumber) t.associatedNumbers.add(r.calledNumber);
  });

  return Array.from(towerMap.values())
    .map(t => ({
      ...t,
      associatedNumbersArray: Array.from(t.associatedNumbers),
      nightDwellScore: t.totalPings > 0 ? Math.round((t.nightPings / t.totalPings) * 100) : 0
    }))
    .sort((a, b) => b.totalPings - a.totalPings);
}

export function generateSection91PreservationNotice({
  targetNumber,
  imei,
  imsi,
  tspName = 'Bharti Airtel / Reliance Jio / Vodafone Idea',
  caseNumber = 'FIR-2026-CR-0891',
  policeStation = 'Cyber Crime Police Station, Shivajinagar, Pune',
  officerName = 'Inspector Ashutosh Patil',
  dateFrom = '2026-01-01',
  dateTo = '2026-03-31'
}) {
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `OFFICE OF THE INVESTIGATING OFFICER
${policeStation.toUpperCase()}
PUNE POLICE COMMISSIONERATE, MAHARASHTRA

LEGAL NOTICE UNDER SECTION 91 Cr.P.C. / SECTION 94 BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023
URGENT: TELECOM EVIDENCE PRESERVATION & DATA DISCLOSURE ORDER

Date: ${generatedDate}
Ref Case No: ${caseNumber} / Cyber Cell / 2026

To,
The Nodal Officer / Law Enforcement Liaison Officer,
${tspName},
Maharashtra & Goa Telecom Circle.

Subject: Requisition and Preservation of Call Detail Records (CDR), IPDR, GPRS Session Logs, IMEI Handset History, and Customer Application Form (CAF) with e-KYC.

Sir / Madam,

WHEREAS an investigation into criminal conspiracy, online financial fraud, extortion, and cyber syndicate operations is currently in progress under IPC / Bharatiya Nyaya Sanhita (BNS) and Information Technology Act, 2000 in FIR No: ${caseNumber}.

In exercise of the powers conferred upon me under Section 91 of the Code of Criminal Procedure, 1973 (read with Section 94 of Bharatiya Nagarik Suraksha Sanhita, 2023), you are hereby directed to immediately PRESERVE and TRANSMIT the certified electronic records specified below within 48 hours:

1. TARGET IDENTIFIERS:
   - Target MSISDN / Mobile Number: ${targetNumber || 'ALL ASSOCIATED NUMBERS'}
   - Associated Handset IMEI: ${imei || 'NOT SPECIFIED'}
   - Subscriber SIM IMSI: ${imsi || 'NOT SPECIFIED'}

2. SPECIFIED TIME PERIOD:
   - From: ${dateFrom} 00:00:00 IST
   - To:   ${dateTo} 23:59:59 IST

3. MANDATORY ELECTRONIC EVIDENCE FORMATS:
   a) Complete Inbound and Outbound CDR with Calling Party, Called Party, Duration, First/Last Cell IDs, and Azimuth Sector Angles.
   b) Complete IP Detail Records (IPDR) with Source IP, Destination IP, Source Port, NAT Translated Port, and MAC Address.
   c) Handset IMEI Swapping History for the last 180 days.
   d) Duly certified Customer Application Form (CAF), Proof of Identity (PoI), Proof of Address (PoA), and e-KYC Geo-tag timestamp.
   e) Certificate under Section 65B of Indian Evidence Act, 1872 / Section 63 of Bharatiya Sakshya Adhiniyam, 2023.

Failure to preserve or transmit the requested telecom evidence within the stipulated time frame shall attract penal proceedings under Section 175 IPC / Section 221 BNS for non-compliance with lawful orders of an investigating officer.

Yours faithfully,

${officerName}
Investigating Officer / Police Inspector
${policeStation}
Pune City Police, Maharashtra`;
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0s';
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${remainingSec}s`;
  if (minutes > 0) return `${minutes}m ${remainingSec}s`;
  return `${remainingSec}s`;
}
