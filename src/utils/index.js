import WXP from 'minapp-api-promise';

function formatNumber(n) {
  const str = n.toString();
  return str[1] ? str : `0${str}`;
}

/* eslint-disable */
export function base64Encode(input) {
  var charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var str = String(input);
  var map = charMap;
  var block = 0,
    output = '';
  var prx = [2, 4, 6, 8];
  for (var code, idx = 3 / 4, uarr;
    // 能取到字符时、block未处理完时、长度不足时
       !isNaN(code = str.charCodeAt(idx)) || 63 & block || (map = '=', (idx - 3 / 4) % 1); idx += 3 / 4) {
    if (code > 0x7F) {
      // utf8字符处理
      (uarr = encodeURI(str.charAt(idx)).split('%')).shift();
      for (var hex, idx2 = idx % 1; hex = uarr[idx2 | 0]; idx2 += 3 / 4) {
        block = block << 8 | parseInt(hex, 16);
        output += map.charAt(63 & block >> 8 - idx2 % 1 * 8);
      }
      idx = idx === 3 / 4 ? 0 : idx; // 修复首字符为utf8字符时出错的BUG
      idx += 3 / 4 * uarr.length % 1; // idx补偿
    } else {
      block = block << 8 | code;
      output += map.charAt(63 & block >> 8 - idx % 1 * 8);
    }
  }
  return output;
}

export function base64Decode(input) {
  var charMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var str = String(input),
    map = charMap.slice(0, -1),
    prx = [6, 4, 2, 0],
    output = '',
    block = 0,
    code,
    buffer = 0,
    hex = '';
  try {
    for (var i = 0; (code = map.indexOf(str[i])) > -1; i++) {
      block = block << 6 | code;
      if (i % 4) {
        buffer = 255 & block >> prx[i % 4];
        if (buffer < 128) {
          output += hex ? decodeURI(hex) : '';
          output += String.fromCharCode(buffer);
          hex = '';
        } else {
          hex += '%' + ('0' + buffer.toString(16)).slice(-2);
        }
      }
    }
    output += hex ? decodeURI(hex) : '';
    return output;
  } catch (err) {
    // console.log(err);
    throw new Error('base64 malformed!');
  }
}

/* eslint-enable */

export function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const t1 = [year, month, day].map(formatNumber).join('/');
  const t2 = [hour, minute, second].map(formatNumber).join(':');

  return `${t1} ${t2}`;
}

export function formatPrice(price) {
  return `￥ ${(price / 100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1, ')}`;
}

export function formatCategory(cats) {
  let formatedCats = [];
  if (cats) {
    formatedCats = cats.map((cat) => {
      let formatedCat = {};
      formatedCat = {
        cid: cat.cid,
        parentId: cat.parentid,
        name: cat.name,
        price: cat.price,
        priceFix: formatPrice(cat.price),
        priceDiscount: cat.price_discount,
        priceDiscountFix: formatPrice(cat.price_discount),
        sold: cat.sold,
        level: cat.level,
        preview: cat.preview,
        content: cat.content,
        stock: cat.stock,
        ownerId: cat.owner_uid,
        owner: cat.owner,
      };
      if (cat.subcat) {
        formatedCat.subcat = formatCategory(cat.subcat);
      }
      return formatedCat;
    });
  }
  return formatedCats;
}

export function parseJwtBody(token) {
  return JSON.parse(base64Decode(token.split('.')[1].replace('-', '+').replace('_', '/')));
}

export function jump(path, type) {
  if (!path) {
    return;
  }

  switch (type) {
    case 'tab':
      WXP.switchTab({ url: path });
      break;
    case 'redirect':
      WXP.redirectTo({ url: path });
      break;
    case 'navigate':
    default:
      WXP.navigateTo({ url: path });
      break;
  }
}

export function setClipboard(data, tip) {
  WXP.setClipboardData({ data });
  if (tip) {
    WXP.showToast({
      title: tip,
      icon: 'none',
    });
  }
}
