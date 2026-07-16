const APP_CONFIG = Object.freeze({
  spreadsheetId: '1RTuAggBKLTtfqy7ux3Xh63dWsoYYHFnzdAjYVD8IGNc',
  timeZone: 'Asia/Tokyo',
  sheets: {
    reservations: '予約データ',
    slots: '撮影枠',
    settings: '設定',
    logs: '操作ログ',
    closures: '休止日',
  },
});

const RESERVATION_HEADERS = Object.freeze([
  '予約ID', '受付日時', '予約原文', '撮影希望日', '希望プラン', 'お名前',
  '大人人数', '子ども人数', '携帯番号', '宿泊施設名', '滞在期間', '送迎',
  'カメラマン指名', '場所指定', '深夜料金確認', 'Instagram', 'ストーリータグ',
  '候補時間①', '候補時間②', '候補時間③', '確定時間', '集合場所',
  'ステータス', '最終更新日時', '更新者', 'メモ', '参加者の性別内訳',
  '希望時間帯', 'カレンダーイベントID',
]);

const CALENDAR_CONFIG = Object.freeze({
  eventMinutes: 60,
  titlePrefix: '🌌',
  settingsColumn: 7,
});

const REQUIRED_FIELDS = Object.freeze([
  ['shootDate', '撮影希望日'],
  ['preferredTimeWindow', '希望時間帯'],
  ['plan', '希望プラン'],
  ['name', 'お名前'],
  ['gender', '参加者の性別内訳'],
  ['phone', '携帯番号'],
  ['lateFee', '深夜料金への同意'],
]);

const PLAN_PRICES = Object.freeze({
  'カジュアルプラン': { kind: 'perPerson', adult: 7000, child: 3000 },
  'スタンダードプラン': { kind: 'perPerson', adult: 9000, child: 5000 },
  'ファミリープラン': { kind: 'perGroup', amount: 18000, maxParticipants: 10 },
  'クリエイティブプラン': { kind: 'perGroup', amount: 28000 },
});

const OPTION_PRICES = Object.freeze({
  pickup: 6000,
  inadaNomination: 2000,
  midnightPerPerson: 1000,
  afterOnePerPerson: 2000,
});

const DEFAULT_MEETING_PLACES = Object.freeze([
  '前浜｜https://maps.app.goo.gl/w5t9SFKB2XPkWXHU9?g_st=ic',
  '友利博愛｜https://maps.app.goo.gl/cD3yeskG3Usnn5wPA?g_st=ic',
  '白鳥岬｜https://maps.app.goo.gl/Fxq45hfTpmNtQxpU9?g_st=ic',
]);

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('星空フォト予約管理')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

function getInitialData() {
  return {
    reservations: listReservations_(),
    settings: getSettings_(),
    closureDates: Array.from(getClosureSet_()).sort(),
    staff: getStaffName_(),
    generatedAt: formatDateTime_(new Date()),
  };
}

function previewBookingText(rawText) {
  const booking = parseBookingText_(rawText);
  return {
    booking: booking,
    missing: getMissingFields_(booking),
    isClosureDate: booking.shootDate ? getClosureSet_().has(booking.shootDate) : false,
  };
}

function saveReservation(payload) {
  payload = payload || {};
  const rawText = cleanMultiline_(payload.rawText);
  if (!rawText) throw new Error('LINEの予約内容を貼り付けてください。');

  const parsed = parseBookingText_(rawText);
  const booking = Object.assign({}, parsed, sanitizeBookingPayload_(payload.booking || {}));
  const confirmedTime = normalizeTimeValue_(payload.confirmedTime);
  const missing = getMissingFields_(booking);
  if (missing.length) {
    throw new Error('必須項目が不足しています：' + missing.join('、'));
  }
  if (getClosureSet_().has(booking.shootDate)) {
    throw new Error(booking.shootDate + 'は満月期間の撮影休止日です。日程を確認してください。');
  }
  if (!confirmedTime) {
    throw new Error('確定する撮影開始時間を選択してください。');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_(APP_CONFIG.sheets.reservations);
    ensureReservationColumns_(sheet);
    const now = new Date();
    const id = createReservationId_(now);
    const staff = getStaffName_();
    assertSlotAvailable_(booking.shootDate, confirmedTime, id);
    const row = [
      id,
      now,
      rawText,
      dateFromKey_(booking.shootDate),
      booking.plan,
      booking.name,
      toNumber_(booking.adults),
      toNumber_(booking.children),
      booking.phone,
      booking.hotel,
      booking.stay,
      booking.pickup,
      booking.photographer,
      booking.locationRequest,
      booking.lateFee,
      booking.instagram,
      booking.storyTag,
      '',
      '',
      '',
      confirmedTime,
      '',
      '時間確定',
      now,
      staff,
      cleanText_(payload.memo),
      booking.gender,
      booking.preferredTimeWindow,
      '',
    ];
    const rowNumber = sheet.getLastRow() + 1;
    sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
    const reservation = rowToReservation_(row, rowNumber);
    syncConfirmedSlot_({}, reservation);
    appendLog_(staff, id, '予約取込', '', booking.name + ' / ' + booking.shootDate);
    const calendarWarning = applyCalendarSync_(sheet, reservation, staff);
    return {
      reservation: reservation,
      messages: generateMessages(reservation),
      calendarWarning: calendarWarning,
    };
  } finally {
    lock.releaseLock();
  }
}

function updateReservation(payload) {
  payload = payload || {};
  const id = cleanText_(payload.id);
  if (!id) throw new Error('予約IDがありません。');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_(APP_CONFIG.sheets.reservations);
    ensureReservationColumns_(sheet);
    const found = findReservationRow_(sheet, id);
    if (!found) throw new Error('対象の予約が見つかりません。再読み込みしてください。');

    const oldRow = sheet.getRange(found.rowNumber, 1, 1, RESERVATION_HEADERS.length).getValues()[0];
    const oldReservation = rowToReservation_(oldRow, found.rowNumber);
    const next = normalizeReservationUpdate_(payload, oldReservation);

    if (!next.shootDate) throw new Error('撮影希望日を入力してください。');
    if (getClosureSet_().has(next.shootDate) && next.status !== 'キャンセル') {
      throw new Error(next.shootDate + 'は満月期間の撮影休止日です。');
    }
    if (statusNeedsConfirmedTime_(next.status) && !next.confirmedTime) {
      throw new Error('このステータスでは確定時間が必要です。');
    }
    if (statusNeedsMeetingPlace_(next.status) && !next.meetingPlace) {
      throw new Error('当日案内を送る前に、集合場所をプルダウンから選択してください。');
    }

    if (next.confirmedTime && next.status !== 'キャンセル') {
      assertSlotAvailable_(next.shootDate, next.confirmedTime, id);
    }

    const staff = getStaffName_();
    const now = new Date();
    const newRow = oldRow.slice();
    newRow[3] = dateFromKey_(next.shootDate);
    newRow[4] = next.plan;
    newRow[5] = next.name;
    newRow[6] = toNumber_(next.adults);
    newRow[7] = toNumber_(next.children);
    newRow[8] = next.phone;
    newRow[9] = next.hotel;
    newRow[10] = next.stay;
    newRow[11] = next.pickup;
    newRow[12] = next.photographer;
    newRow[13] = next.locationRequest;
    newRow[14] = next.lateFee;
    newRow[15] = next.instagram;
    newRow[16] = next.storyTag;
    newRow[17] = next.candidateTimes[0] || '';
    newRow[18] = next.candidateTimes[1] || '';
    newRow[19] = next.candidateTimes[2] || '';
    newRow[20] = next.confirmedTime;
    newRow[21] = next.meetingPlace;
    newRow[22] = next.status;
    newRow[23] = now;
    newRow[24] = staff;
    newRow[25] = next.memo;
    newRow[26] = next.gender;
    newRow[27] = next.preferredTimeWindow;

    sheet.getRange(found.rowNumber, 1, 1, newRow.length).setValues([newRow]);
    const updated = rowToReservation_(newRow, found.rowNumber);
    syncConfirmedSlot_(oldReservation, updated);
    appendLog_(staff, id, '予約更新', summarizeReservation_(oldReservation), summarizeReservation_(updated));
    const calendarWarning = applyCalendarSync_(sheet, updated, staff);

    return {
      reservation: updated,
      messages: generateMessages(updated),
      calendarWarning: calendarWarning,
    };
  } finally {
    lock.releaseLock();
  }
}

function generateMessages(payload) {
  const reservation = normalizeReservationUpdate_(payload || {}, payload || {});
  const name = reservation.name || 'お客様';
  const dateLabel = formatDateLabel_(reservation.shootDate);
  const price = calculateConfirmedPrice_(reservation);
  const participantCount = reservation.adults + reservation.children;
  const participantLabel = '合計' + participantCount + '名' +
    '（大人' + reservation.adults + '名・子ども' + reservation.children + '名）';
  const genderBreakdown = formatGenderBreakdown_(reservation.gender);
  const pickupLabel = reservation.pickup || 'なし';
  const photographerLabel = reservation.photographer || '指名なし（おまかせ）';
  const confirmedTimeLabel = reservation.confirmedTime || '［確定時間］';
  const couponLabel = extractCouponLabel_(reservation.rawText);
  const lateFeeConsentLabel = isLateFeeConsentConfirmed_(reservation.lateFee)
    ? '了承済み（0:00〜0:59は＋1,000円／人、1:00以降は＋2,000円／人）'
    : (reservation.lateFee || '未確認');
  const confirmedPriceLabel = price.total == null
    ? '別途お見積り'
    : formatCurrency_(price.total);
  const lateNightPriceLine = price.lateNightFee > 0
    ? '\n深夜料金：' + formatCurrency_(price.lateNightFee) +
      '（' + participantCount + '名分・合計料金に含まれています）'
    : '';
  const meetingPlaceGuide = formatMeetingPlaceGuide_(reservation.meetingPlace);

  return {
    confirmation:
      name + '様、ご返信ありがとうございます。\n\n' +
      '撮影時間が確定いたしましたので、下記の内容でご予約を確定いたします。\n' +
      'お手数ですが、内容にお間違いがないかご確認をお願いいたします。\n\n' +
      '【ご予約確定内容】\n' +
      '撮影日：' + dateLabel + '\n' +
      '撮影開始時間：' + confirmedTimeLabel + '\n' +
      '撮影プラン：' + (reservation.plan || '［撮影プラン］') + '\n' +
      '参加人数：' + participantLabel + '\n' +
      genderBreakdown + '\n' +
      'お名前：' + name + '様\n' +
      '携帯番号：' + optionalLabel_(reservation.phone) + '\n' +
      '宿泊施設名：' + optionalLabel_(reservation.hotel) + '\n' +
      '滞在期間：' + optionalLabel_(reservation.stay) + '\n\n' +
      '【オプション・確認事項】\n' +
      '送迎：' + pickupLabel + '\n' +
      'カメラマン：' + photographerLabel + '\n' +
      'クーポン：' + couponLabel + '\n' +
      '深夜料金：' + lateFeeConsentLabel + '\n' +
      'Instagram：' + optionalLabel_(reservation.instagram) + '\n' +
      'ストーリータグ付け：' + optionalLabel_(reservation.storyTag) + '\n\n' +
      '【お支払い金額】\n' +
      '合計料金：' + confirmedPriceLabel + lateNightPriceLine + '\n' +
      'お支払い方法：撮影当日に現地での現金決済\n\n' +
      '【集合場所について】\n' +
      '主な撮影候補地：前浜・友利博愛・白鳥岬\n' +
      '候補地の地図：https://keyphotomiyakojima.com/access#shooting-locations\n\n' +
      '集合場所は、当日の雲や風などの星空コンディションを確認したうえで、その日に最もきれいに撮影できる場所をご案内いたします。\n' +
      '撮影当日にこちらのLINEへお送りしますので、必ずご確認をお願いいたします。\n\n' +
      '撮影データは、撮影後24時間以内を目安にオンラインでお届けいたします。\n\n' +
      '内容に間違いや変更がございましたら、このLINEへご連絡ください。\n' +
      '当日はどうぞよろしくお願いいたします。',
    sameDay:
      name + '様、本日の星空フォト撮影についてご案内いたします。\n' +
      '下記の内容をご確認のうえ、集合場所までお気をつけてお越しください。\n\n' +
      '【本日の撮影案内】\n' +
      '撮影日：' + dateLabel + '\n' +
      '集合時間：' + (reservation.confirmedTime || '［確定時間］') + '\n' +
      '集合場所：' + meetingPlaceGuide + '\n\n' +
      '【現地到着時のご注意】\n' +
      '安全で最高の星空撮影を行うため、以下の2点をお守りください。\n\n' +
      '1．安全に停車後、車のライトは必ず消灯してください\n' +
      '光が漏れると星空の撮影に影響が出てしまいます。安全な場所へ停車したあと、ヘッドライトや車内灯を消し、周囲へのご配慮をお願いいたします。\n\n' +
      '2．合図があるまで車内でお待ちください\n' +
      '前のお客様の撮影が終了次第、スタッフからお声がけいたします。それまでは車内での待機をお願いいたします。\n\n' +
      '【当日の開催判断について】\n' +
      '星空撮影は雲の動きに左右されるため、天候が怪しい場合は、開催可否の判断を当日18:00頃に行います。\n\n' +
      '※天候の心配がないと判断した場合、18:00頃のご連絡はいたしません。\n' +
      '※中止の場合は、ほかの日程への振替も可能です。\n' +
      '※中止のご連絡後に天候が回復した場合は、改めてご連絡する場合がございます。\n\n' +
      '【当日の服装・準備】\n' +
      '・服装：白い服や明るい色のお洋服は、夜の背景にとてもきれいに映えます。\n' +
      '・足元：暗い場所を歩くため、歩きやすい靴がおすすめです。\n' +
      '・防寒：夜の屋外は冷え込むことがあります。羽織るものを1枚お持ちいただくことをおすすめします。\n\n' +
      '【緊急連絡について】\n' +
      '当日の「道に迷った」「少し遅れそう」などのご連絡は、現場スタッフが直接確認できるショートメッセージ（SMS）がスムーズです。\n\n' +
      '【当日の緊急連絡先】\n' +
      '090-9279-9586（稲田）\n' +
      '※SMSでのご連絡も可能です。\n\n' +
      'それでは、本日はどうぞよろしくお願いいたします。',
  };
}

function parseBookingText_(rawText) {
  const text = cleanMultiline_(rawText);
  const sections = splitNumberedSections_(text);
  const people = sections['④'] || '';
  const options = sections['⑧'] || '';
  const instagram = sections['⑨'] || '';

  return {
    shootDate: parseDateKey_(firstValue_(sections['①'])),
    preferredTimeWindow: extractLabeledValue_(sections['①'], ['希望時間帯', '希望時間枠']),
    plan: firstValue_(sections['②']),
    name: firstValue_(sections['③']),
    gender:
      extractLabeledValue_(people, ['参加者の性別内訳', '性別内訳']) ||
      extractLabeledValue_(sections['③'], ['ご予約者の性別', '性別']),
    adults: extractCount_(people, ['大人', 'おとな']),
    children: extractCount_(people, ['子ども', 'こども', '子供']),
    phone: firstValue_(sections['⑤']).replace(/\s+/g, ''),
    hotel: firstValue_(sections['⑥']),
    stay: cleanMultiline_(sections['⑦']),
    pickup: extractLabeledValue_(options, ['送迎']),
    photographer: extractLabeledValue_(options, ['カメラマン指名', 'カメラマン']),
    locationRequest: extractLabeledValue_(options, ['場所指定', '撮影場所']),
    lateFee: extractLabeledValue_(options, ['深夜料金', '追加料金']),
    instagram: extractInstagramValue_(instagram),
    storyTag: extractLabeledValue_(instagram, ['ストーリータグ付け', 'ストーリータグ', 'ストーリーでタグ付け', 'タグ付け']),
  };
}

function splitNumberedSections_(text) {
  const result = {};
  const aliases = {
    '①': ['撮影希望日'],
    '②': ['希望プラン', 'プラン'],
    '③': ['お名前', '名前'],
    '④': ['人数'],
    '⑤': ['携帯番号', '電話番号'],
    '⑥': ['宿泊施設名', '宿泊先'],
    '⑦': ['滞在期間'],
    '⑧': ['オプション'],
    '⑨': ['Instagram', 'インスタグラム'],
  };
  let current = '';
  text.split('\n').forEach(function (line) {
    const match = line.match(/^\s*([①②③④⑤⑥⑦⑧⑨])\s*(.*)$/);
    if (match) {
      current = match[1];
      result[current] = result[current] || '';
      let rest = match[2] || '';
      (aliases[current] || []).some(function (alias) {
        if (rest.indexOf(alias) === 0) {
          rest = rest.slice(alias.length).replace(/^\s*(?:（任意）|\(任意\))?\s*[:：\-]?\s*/, '');
          return true;
        }
        return false;
      });
      if (rest) result[current] += rest;
      return;
    }
    if (current) {
      result[current] += (result[current] ? '\n' : '') + line;
    }
  });
  Object.keys(result).forEach(function (key) {
    result[key] = cleanMultiline_(result[key]);
  });
  return result;
}

function extractCount_(text, labels) {
  for (let i = 0; i < labels.length; i += 1) {
    const escaped = escapeRegExp_(labels[i]);
    const match = normalizeDigits_(text).match(
      new RegExp(escaped + '(?:\\s*[（(][^）)]*[）)])?\\s*[:：]?\\s*(\\d+)'),
    );
    if (match) return Number(match[1]);
  }
  return 0;
}

function extractLabeledValue_(text, labels) {
  const lines = cleanMultiline_(text).split('\n').filter(Boolean);
  for (let i = 0; i < labels.length; i += 1) {
    const escaped = escapeRegExp_(labels[i]);
    const pattern = new RegExp('^(?:[・●■□✓✔︎\\-]\\s*)?' + escaped + '\\s*[:：]\\s*(.+)$', 'i');
    for (let j = 0; j < lines.length; j += 1) {
      const match = lines[j].trim().match(pattern);
      if (match) return cleanText_(match[1]);
    }
  }
  return '';
}

function extractInstagramValue_(text) {
  const labeled = extractLabeledValue_(text, ['Instagram', 'インスタグラム', 'アカウント']);
  if (labeled) return labeled;
  const line = cleanMultiline_(text).split('\n').map(function (item) {
    return cleanText_(item);
  }).find(function (item) {
    return /^@[^\s]+/.test(item);
  });
  return line || '';
}

function sanitizeBookingPayload_(booking) {
  return {
    shootDate: parseDateKey_(booking.shootDate),
    preferredTimeWindow: cleanText_(booking.preferredTimeWindow),
    plan: cleanText_(booking.plan),
    name: cleanText_(booking.name),
    gender: cleanText_(booking.gender),
    adults: toNumber_(booking.adults),
    children: toNumber_(booking.children),
    phone: cleanText_(booking.phone),
    hotel: cleanText_(booking.hotel),
    stay: cleanMultiline_(booking.stay),
    pickup: cleanText_(booking.pickup),
    photographer: cleanText_(booking.photographer),
    locationRequest: cleanText_(booking.locationRequest),
    lateFee: cleanText_(booking.lateFee),
    instagram: cleanText_(booking.instagram),
    storyTag: cleanText_(booking.storyTag),
  };
}

function normalizeReservationUpdate_(payload, fallback) {
  fallback = fallback || {};
  const candidates = Array.isArray(payload.candidateTimes)
    ? payload.candidateTimes
    : (fallback.candidateTimes || []);
  return {
    id: cleanText_(payload.id || fallback.id),
    rawText: cleanMultiline_(payload.rawText != null ? payload.rawText : fallback.rawText),
    shootDate: parseDateKey_(payload.shootDate || fallback.shootDate),
    preferredTimeWindow: cleanText_(
      payload.preferredTimeWindow != null
        ? payload.preferredTimeWindow
        : fallback.preferredTimeWindow,
    ),
    plan: cleanText_(payload.plan != null ? payload.plan : fallback.plan),
    name: cleanText_(payload.name != null ? payload.name : fallback.name),
    gender: cleanText_(payload.gender != null ? payload.gender : fallback.gender),
    adults: toNumber_(payload.adults != null ? payload.adults : fallback.adults),
    children: toNumber_(payload.children != null ? payload.children : fallback.children),
    phone: cleanText_(payload.phone != null ? payload.phone : fallback.phone),
    hotel: cleanText_(payload.hotel != null ? payload.hotel : fallback.hotel),
    stay: cleanMultiline_(payload.stay != null ? payload.stay : fallback.stay),
    pickup: cleanText_(payload.pickup != null ? payload.pickup : fallback.pickup),
    photographer: cleanText_(payload.photographer != null ? payload.photographer : fallback.photographer),
    locationRequest: cleanText_(payload.locationRequest != null ? payload.locationRequest : fallback.locationRequest),
    lateFee: cleanText_(payload.lateFee != null ? payload.lateFee : fallback.lateFee),
    instagram: cleanText_(payload.instagram != null ? payload.instagram : fallback.instagram),
    storyTag: cleanText_(payload.storyTag != null ? payload.storyTag : fallback.storyTag),
    candidateTimes: normalizeCandidateTimes_(candidates),
    confirmedTime: normalizeTimeValue_(payload.confirmedTime != null ? payload.confirmedTime : fallback.confirmedTime),
    meetingPlace: cleanText_(payload.meetingPlace != null ? payload.meetingPlace : fallback.meetingPlace),
    status: cleanText_(payload.status != null ? payload.status : fallback.status) || '未返信',
    memo: cleanMultiline_(payload.memo != null ? payload.memo : fallback.memo),
  };
}

function listReservations_() {
  const sheet = getSheet_(APP_CONFIG.sheets.reservations);
  ensureReservationColumns_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, RESERVATION_HEADERS.length).getValues();
  return values
    .map(function (row, index) { return rowToReservation_(row, index + 2); })
    .filter(function (item) { return item.id; })
    .sort(function (a, b) {
      return String(b.receivedAt).localeCompare(String(a.receivedAt));
    });
}

function rowToReservation_(row, rowNumber) {
  return {
    rowNumber: rowNumber,
    id: cleanText_(row[0]),
    receivedAt: formatDateTime_(row[1]),
    rawText: cleanMultiline_(row[2]),
    shootDate: cellDateToKey_(row[3]),
    plan: cleanText_(row[4]),
    name: cleanText_(row[5]),
    adults: toNumber_(row[6]),
    children: toNumber_(row[7]),
    phone: cleanText_(row[8]),
    hotel: cleanText_(row[9]),
    stay: cleanMultiline_(row[10]),
    pickup: cleanText_(row[11]),
    photographer: cleanText_(row[12]),
    locationRequest: cleanText_(row[13]),
    lateFee: cleanText_(row[14]),
    instagram: cleanText_(row[15]),
    storyTag: cleanText_(row[16]),
    candidateTimes: [cleanText_(row[17]), cleanText_(row[18]), cleanText_(row[19])],
    confirmedTime: cleanText_(row[20]),
    meetingPlace: cleanText_(row[21]),
    status: cleanText_(row[22]) || '未返信',
    updatedAt: formatDateTime_(row[23]),
    updatedBy: cleanText_(row[24]),
    memo: cleanMultiline_(row[25]),
    gender: cleanText_(row[26]),
    preferredTimeWindow: cleanText_(row[27]),
    calendarEventId: cleanText_(row[28]),
  };
}

function findReservationRow_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < ids.length; i += 1) {
    if (ids[i][0] === id) return { rowNumber: i + 2 };
  }
  return null;
}

function getSettings_() {
  const sheet = getSheet_(APP_CONFIG.sheets.settings);
  const values = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 6).getDisplayValues();
  return {
    plans: columnValues_(values, 0),
    times: columnValues_(values, 1),
    statuses: columnValues_(values, 2),
    slotStatuses: columnValues_(values, 3),
    photographers: columnValues_(values, 4),
    meetingPlaces: Array.from(new Set(DEFAULT_MEETING_PLACES.concat(columnValues_(values, 5)))),
  };
}

function getClosureSet_() {
  const sheet = getSheet_(APP_CONFIG.sheets.closures);
  const lastRow = sheet.getLastRow();
  const set = new Set();
  if (lastRow < 2) return set;
  sheet.getRange(2, 1, lastRow - 1, 1).getValues().forEach(function (row) {
    const key = cellDateToKey_(row[0]);
    if (key) set.add(key);
  });
  return set;
}

function assertSlotAvailable_(shootDate, time, reservationId) {
  const sheet = getSheet_(APP_CONFIG.sheets.slots);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const timeKey = normalizeTimeKey_(time);
  rows.forEach(function (row) {
    const sameDate = cellDateToKey_(row[0]) === shootDate;
    const sameTime = normalizeTimeKey_(row[1]) === timeKey;
    const active = ['仮押さえ', '確定'].indexOf(cleanText_(row[2])) !== -1;
    const anotherReservation = cleanText_(row[3]) !== reservationId;
    if (sameDate && sameTime && active && anotherReservation) {
      throw new Error(shootDate + ' ' + timeKey + 'は別の予約で埋まっています。');
    }
  });
}

function syncConfirmedSlot_(oldReservation, nextReservation) {
  const sheet = getSheet_(APP_CONFIG.sheets.slots);
  const lastRow = sheet.getLastRow();
  let existingRow = 0;
  if (lastRow >= 2) {
    const ids = sheet.getRange(2, 4, lastRow - 1, 1).getDisplayValues();
    for (let i = 0; i < ids.length; i += 1) {
      if (ids[i][0] === nextReservation.id) {
        existingRow = i + 2;
        break;
      }
    }
  }

  const shouldHold = nextReservation.confirmedTime && nextReservation.status !== 'キャンセル';
  if (!shouldHold) {
    if (existingRow) sheet.getRange(existingRow, 1, 1, 7).clearContent();
    return;
  }

  const slotRow = [[
    dateFromKey_(nextReservation.shootDate),
    nextReservation.confirmedTime,
    '確定',
    nextReservation.id,
    nextReservation.name,
    normalizePhotographer_(nextReservation.photographer),
    nextReservation.memo,
  ]];
  if (existingRow) {
    sheet.getRange(existingRow, 1, 1, 7).setValues(slotRow);
  } else {
    sheet.appendRow(slotRow[0]);
  }
}

// ===== Googleカレンダー連携 =====
// 設定シートのG2に共有カレンダーIDを入れると、確定した予約が自動でカレンダーに登録されます。
// エディタから setupSharedCalendar を1回実行すると、専用カレンダーの作成とID設定を自動で行います。

function setupSharedCalendar() {
  const existing = getCalendarId_();
  if (existing) {
    Logger.log('共有カレンダーは設定済みです。ID: ' + existing);
    return existing;
  }
  const calendar = CalendarApp.createCalendar('星空フォト予約', { timeZone: APP_CONFIG.timeZone });
  const sheet = getSheet_(APP_CONFIG.sheets.settings);
  if (sheet.getMaxColumns() < CALENDAR_CONFIG.settingsColumn) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), CALENDAR_CONFIG.settingsColumn - sheet.getMaxColumns());
  }
  sheet.getRange(1, CALENDAR_CONFIG.settingsColumn).setValue('共有カレンダーID');
  sheet.getRange(2, CALENDAR_CONFIG.settingsColumn).setValue(calendar.getId());
  Logger.log('共有カレンダー「星空フォト予約」を作成しました。ID: ' + calendar.getId());
  Logger.log('Googleカレンダーの設定から、このカレンダーをスタッフのアカウントへ共有してください。');
  return calendar.getId();
}

function syncAllReservationsToCalendar() {
  if (!getCalendarId_()) {
    throw new Error('先に setupSharedCalendar を実行するか、設定シートのG2セルに共有カレンダーIDを入力してください。');
  }
  const sheet = getSheet_(APP_CONFIG.sheets.reservations);
  const reservations = listReservations_();
  let synced = 0;
  reservations.forEach(function (reservation) {
    const warning = applyCalendarSync_(sheet, reservation, '一括同期');
    if (warning) Logger.log(reservation.id + ': ' + warning);
    if (reservation.calendarEventId) synced += 1;
  });
  Logger.log(reservations.length + '件を確認し、' + synced + '件をカレンダーへ同期しました。');
}

function getCalendarId_() {
  const sheet = getSheet_(APP_CONFIG.sheets.settings);
  if (sheet.getMaxColumns() < CALENDAR_CONFIG.settingsColumn) return '';
  return cleanText_(sheet.getRange(2, CALENDAR_CONFIG.settingsColumn).getDisplayValue());
}

function applyCalendarSync_(sheet, reservation, staff) {
  let warning = '';
  try {
    const sync = syncCalendarEvent_(reservation);
    if (sync.eventId !== reservation.calendarEventId) {
      sheet.getRange(reservation.rowNumber, RESERVATION_HEADERS.length).setValue(sync.eventId);
      reservation.calendarEventId = sync.eventId;
    }
    warning = sync.warning;
  } catch (error) {
    warning = 'カレンダーへの反映に失敗しました：' + error.message;
  }
  if (warning) appendLog_(staff, reservation.id, 'カレンダー同期警告', '', warning);
  return warning;
}

function syncCalendarEvent_(reservation) {
  const calendarId = getCalendarId_();
  if (!calendarId) return { eventId: reservation.calendarEventId || '', warning: '' };
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    return {
      eventId: reservation.calendarEventId || '',
      warning: '共有カレンダーが見つかりません。設定シートG2のIDとカレンダーの共有権限を確認してください。',
    };
  }

  const existing = reservation.calendarEventId ? getCalendarEventSafe_(calendar, reservation.calendarEventId) : null;
  const shouldHold = reservation.confirmedTime && reservation.status !== 'キャンセル';
  if (!shouldHold) {
    if (existing) existing.deleteEvent();
    return { eventId: '', warning: '' };
  }

  const start = shootStartDateTime_(reservation.shootDate, reservation.confirmedTime);
  const end = new Date(start.getTime() + CALENDAR_CONFIG.eventMinutes * 60000);
  const title = calendarEventTitle_(reservation);
  const description = calendarEventDescription_(reservation);
  const location = cleanText_(String(reservation.meetingPlace || '').replace('｜', ' '));

  if (existing) {
    existing.setTime(start, end);
    existing.setTitle(title);
    existing.setDescription(description);
    existing.setLocation(location);
    return { eventId: reservation.calendarEventId, warning: '' };
  }
  const event = calendar.createEvent(title, start, end, { description: description, location: location });
  return { eventId: event.getId(), warning: '' };
}

function getCalendarEventSafe_(calendar, eventId) {
  try {
    return calendar.getEventById(eventId);
  } catch (_) {
    return null;
  }
}

function shootStartDateTime_(shootDateKey, time) {
  const parts = String(shootDateKey || '').split('-').map(Number);
  const match = normalizeTimeValue_(time).match(/(\d{2}):(\d{2})/);
  if (parts.length !== 3 || parts.some(isNaN) || !match) {
    throw new Error('カレンダー登録用の日時を作成できませんでした。');
  }
  const date = new Date(parts[0], parts[1] - 1, parts[2], Number(match[1]), Number(match[2]), 0);
  // 0〜5時台は「撮影日の夜」が日をまたいだ深夜帯なので、カレンダー上は翌日の日時にする
  if (Number(match[1]) < 6) date.setDate(date.getDate() + 1);
  return date;
}

function calendarEventTitle_(reservation) {
  const photographer = normalizePhotographer_(reservation.photographer);
  return CALENDAR_CONFIG.titlePrefix + ' ' + reservation.confirmedTime + ' ' + reservation.name + '様 ' +
    (reservation.plan || 'プラン未定') +
    '（大人' + reservation.adults + '・子ども' + reservation.children + '）' +
    (photographer === '指名なし' ? '' : '／' + photographer);
}

function calendarEventDescription_(reservation) {
  return [
    '予約ID：' + reservation.id,
    'ステータス：' + reservation.status,
    '撮影日：' + formatDateLabel_(reservation.shootDate),
    '撮影開始時間：' + reservation.confirmedTime,
    'プラン：' + optionalLabel_(reservation.plan),
    '参加人数：大人' + reservation.adults + '名・子ども' + reservation.children + '名',
    '性別内訳：' + optionalLabel_(reservation.gender),
    '携帯番号：' + optionalLabel_(reservation.phone),
    '宿泊施設名：' + optionalLabel_(reservation.hotel),
    '滞在期間：' + optionalLabel_(reservation.stay),
    '送迎：' + optionalLabel_(reservation.pickup),
    'カメラマン指名：' + optionalLabel_(reservation.photographer),
    '場所指定：' + optionalLabel_(reservation.locationRequest),
    '深夜料金：' + optionalLabel_(reservation.lateFee),
    'Instagram：' + optionalLabel_(reservation.instagram),
    '集合場所：' + (reservation.meetingPlace || '未定'),
    'メモ：' + optionalLabel_(reservation.memo),
    '',
    '※予約管理ツールから自動登録されたイベントです。予約の変更はツール側で行うと自動で反映されます。',
  ].join('\n');
}

function ensureReservationColumns_(sheet) {
  const needed = RESERVATION_HEADERS.length;
  let created = false;
  if (sheet.getMaxColumns() < needed) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), needed - sheet.getMaxColumns());
    created = true;
  }
  const lastHeader = cleanText_(sheet.getRange(1, needed).getDisplayValue());
  if (lastHeader !== RESERVATION_HEADERS[needed - 1]) {
    sheet.getRange(1, needed).setValue(RESERVATION_HEADERS[needed - 1]);
    created = true;
  }
  if (created) {
    // 挿入した列は隣の列（希望時間帯）の入力規則を引き継ぐため、イベントID列からは外す
    sheet.getRange(1, needed, sheet.getMaxRows(), 1).clearDataValidations();
  }
}

function appendLog_(staff, reservationId, action, before, after) {
  getSheet_(APP_CONFIG.sheets.logs).appendRow([
    new Date(), staff, reservationId, action, before, after,
  ]);
}

function getMissingFields_(booking) {
  return REQUIRED_FIELDS.filter(function (field) {
    const value = booking[field[0]];
    if (field[0] === 'lateFee') {
      const consent = cleanText_(value);
      return !consent || /未確認|未同意|了承していない/.test(consent) || !/了承|同意|確認済/.test(consent);
    }
    return value === '' || value == null;
  }).map(function (field) { return field[1]; });
}

function statusNeedsConfirmedTime_(status) {
  return ['時間確定', '当日案内済み', '撮影完了'].indexOf(status) !== -1;
}

function statusNeedsMeetingPlace_(status) {
  return ['当日案内済み', '撮影完了'].indexOf(status) !== -1;
}

function summarizeReservation_(reservation) {
  return [
    reservation.shootDate,
    reservation.confirmedTime || '未確定',
    reservation.status,
    reservation.meetingPlace || '集合場所未定',
  ].join(' / ');
}

function createReservationId_(date) {
  return 'SF-' + Utilities.formatDate(date, APP_CONFIG.timeZone, 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
}

let spreadsheetCache_;

function getSpreadsheet_() {
  if (!spreadsheetCache_) {
    spreadsheetCache_ = SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
  }
  return spreadsheetCache_;
}

function getSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('シート「' + name + '」が見つかりません。');
  return sheet;
}

function getStaffName_() {
  return Session.getActiveUser().getEmail() || 'スタッフ';
}

function firstValue_(value) {
  const lines = cleanMultiline_(value).split('\n').map(function (line) {
    return line.replace(/^\s*(?:[・●■□✓✔︎\-]|回答)\s*[:：]?\s*/, '').trim();
  }).filter(Boolean);
  return cleanText_(lines[0]);
}

function parseDateKey_(value) {
  const normalized = normalizeDigits_(cleanText_(value));
  const match = normalized.match(/(20\d{2})\s*[\/\.\-年]\s*(\d{1,2})\s*[\/\.\-月]\s*(\d{1,2})/);
  if (!match) return '';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
  return [year, pad2_(month), pad2_(day)].join('-');
}

function dateFromKey_(key) {
  const parts = String(key || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('日付の形式が正しくありません。');
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
}

function cellDateToKey_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, APP_CONFIG.timeZone, 'yyyy-MM-dd');
  }
  return parseDateKey_(value);
}

function formatDateTime_(value) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return cleanText_(value);
  return Utilities.formatDate(value, APP_CONFIG.timeZone, 'yyyy/MM/dd HH:mm');
}

function formatDateLabel_(key) {
  const parts = String(key || '').split('-');
  if (parts.length !== 3) return key || '［撮影日］';
  return Number(parts[0]) + '年' + Number(parts[1]) + '月' + Number(parts[2]) + '日';
}

function normalizeTimeKey_(value) {
  const match = normalizeDigits_(cleanText_(value)).match(/(\d{1,2}:\d{2})/);
  return match ? match[1].replace(/^0(?=\d:)/, '') : '';
}

function normalizeTimeValue_(value) {
  const match = normalizeDigits_(cleanText_(value)).match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  return pad2_(hour) + ':' + pad2_(minute);
}

function calculateConfirmedPrice_(reservation) {
  const extractedBase = extractEstimatedTotal_(reservation.rawText);
  const fallbackBase = calculateBasePrice_(reservation);
  const base = extractedBase != null ? extractedBase : fallbackBase;
  const rate = getLateNightRate_(reservation.confirmedTime);
  const participantCount = Math.max(0, reservation.adults + reservation.children);
  const lateNightFee = rate * participantCount;
  return {
    base: base,
    lateNightFee: lateNightFee,
    total: base == null ? null : base + lateNightFee,
  };
}

function extractEstimatedTotal_(rawText) {
  const text = normalizeDigits_(cleanMultiline_(rawText));
  if (!text) return null;
  const sectionMatch = text.match(/お会計（概算）\s*[:：]\s*\n?\s*(?:¥|￥)?\s*([0-9][0-9,]*)/);
  if (!sectionMatch) return null;
  const amount = Number(sectionMatch[1].replace(/,/g, ''));
  return isNaN(amount) ? null : amount;
}

function extractCouponLabel_(rawText) {
  const text = cleanMultiline_(rawText);
  const match = text.match(/(?:🎟\s*)?クーポン\s*[:：]\s*([^\n]+)/);
  return match ? cleanText_(match[1]) : '記入なし';
}

function formatGenderBreakdown_(value) {
  const text = normalizeDigits_(cleanText_(value));
  const adultMatch = text.match(/大人[^／/]*男性\s*(\d+)\s*人[^／/]*女性\s*(\d+)\s*人/);
  const childMatch = text.match(/子ども[^／/]*男の子\s*(\d+)\s*人[^／/]*女の子\s*(\d+)\s*人/);
  const lines = [];
  if (adultMatch) {
    lines.push('大人（16歳以上）：男性' + adultMatch[1] + '名・女性' + adultMatch[2] + '名');
  }
  if (childMatch) {
    lines.push('子ども（0〜15歳）：男の子' + childMatch[1] + '名・女の子' + childMatch[2] + '名');
  }
  if (lines.length) return lines.join('\n');
  return '参加者の性別内訳：' + optionalLabel_(value);
}

function isLateFeeConsentConfirmed_(value) {
  const text = cleanText_(value);
  return Boolean(text) && !/未確認|未同意|了承していない/.test(text) && /了承|同意|確認済/.test(text);
}

function optionalLabel_(value) {
  return cleanText_(value) || '記入なし';
}

function formatMeetingPlaceGuide_(value) {
  const text = cleanText_(value);
  if (!text) return '［集合場所］';
  const separatorIndex = text.indexOf('｜');
  if (separatorIndex === -1) return text;
  const name = cleanText_(text.slice(0, separatorIndex));
  const url = cleanText_(text.slice(separatorIndex + 1));
  return name + (url ? '\nGoogleマップ：' + url : '');
}

function calculateBasePrice_(reservation) {
  const price = PLAN_PRICES[reservation.plan];
  if (!price) return null;
  const participantCount = reservation.adults + reservation.children;
  if (price.maxParticipants && participantCount > price.maxParticipants) return null;

  let amount = price.kind === 'perPerson'
    ? reservation.adults * price.adult + reservation.children * price.child
    : price.amount;
  if (isPickupRequested_(reservation.pickup)) amount += OPTION_PRICES.pickup;
  if (/稲田/.test(reservation.photographer)) amount += OPTION_PRICES.inadaNomination;
  return amount;
}

function isPickupRequested_(value) {
  const text = cleanText_(value);
  if (!text || /なし|希望しない|不要/.test(text)) return false;
  return /希望|あり|する/.test(text);
}

function getLateNightRate_(value) {
  const normalized = normalizeTimeValue_(value);
  if (!normalized) return 0;
  const hour = Number(normalized.slice(0, 2));
  if (hour === 0) return OPTION_PRICES.midnightPerPerson;
  if (hour >= 1 && hour < 6) return OPTION_PRICES.afterOnePerPerson;
  return 0;
}

function formatCurrency_(value) {
  return '¥' + Math.round(Number(value) || 0).toLocaleString('ja-JP');
}

function normalizeCandidateTimes_(values) {
  const source = Array.isArray(values) ? values : [];
  return [
    normalizeTimeValue_(source[0]),
    normalizeTimeValue_(source[1]),
    normalizeTimeValue_(source[2]),
  ];
}

function normalizePhotographer_(value) {
  const text = cleanText_(value);
  if (/稲田/.test(text)) return '稲田';
  if (/Toon/i.test(text)) return 'Toon';
  if (/Sho/i.test(text)) return 'Sho';
  return '指名なし';
}

function columnValues_(rows, index) {
  return rows.map(function (row) { return cleanText_(row[index]); }).filter(Boolean);
}

function toNumber_(value) {
  const number = Number(normalizeDigits_(String(value == null ? '' : value)).replace(/[^0-9.-]/g, ''));
  return isNaN(number) ? 0 : number;
}

function cleanText_(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function cleanMultiline_(value) {
  return String(value == null ? '' : value)
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeDigits_(value) {
  return String(value || '').replace(/[０-９]/g, function (char) {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
}

function escapeRegExp_(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}
