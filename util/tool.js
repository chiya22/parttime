// 年月日（yyyymmdd形式）をもとに、日付区分（1->通常日、2->土、3-> 日祝）を返却する
const getDayKubun = (yyyymmdd) => {
  // 2020年から2022年までの祝日
  const holiday = [
    '20200101',
    '20200113',
    '20200211',
    '20200223',
    '20200224',
    '20200320',
    '20200429',
    '20200503',
    '20200504',
    '20200505',
    '20200506',
    '20200723',
    '20200724',
    '20200810',
    '20200921',
    '20200922',
    '20201103',
    '20201123',
    '20210101',
    '20210111',
    '20210211',
    '20210223',
    '20210320',
    '20210429',
    '20210503',
    '20210504',
    '20210505',
    '20210722',
    '20210723',
    '20210808',
    '20210809',
    '20210920',
    '20210923',
    '20211103',
    '20211123',
    '20220101',
    '20220110',
    '20220211',
    '20220223',
    '20220321',
    '20220429',
    '20220503',
    '20220504',
    '20220505',
    '20220718',
    '20220811',
    '20220919',
    '20220923',
    '20221010',
    '20221103',
    '20221123'
  ]

  const yyyy = yyyymmdd.slice(0,4);
  const mm = yyyymmdd.slice(4,6);
  const dd = yyyymmdd.slice(-2);
  const dayofweek = new Date(yyyy + '/' + mm + '/' + dd).getDay();

  // 0→日、1→月、2→火、3→水、4→木、5→金、6→土

  if (dayofweek === 0 || holiday.includes(yyyymmdd)) {
    return '0';
  } else {
    return String(dayofweek);
  }
}
//
// 日付よりyyyymmdd形式の文字列を返却する
//
const getYYYYMMDD = (date) => {
  let tmp;
  tmp = '' + date.getFullYear();
  tmp += '' + ('0' + (date.getMonth() + 1)).slice(-2);
  tmp += '' + ('0' + date.getDate()).slice(-2);
  return tmp
}

//
// 年月より年月日のリストを取得する
//
const getYyyymmddByYyyymm = (yyyymm) => {

  // 末日を取得
  const lastday = new Date(yyyymm.slice(0, 4), yyyymm.slice(-2), 0).getDate();

  let retYyyymmdd = [];
  for (let i = 1; i <= lastday; i++) {
    retYyyymmdd.push(yyyymm + ('0' + i).slice(-2))
  }
  return retYyyymmdd;
}


module.exports = {
  getDayKubun,
  getYYYYMMDD,
  getYyyymmddByYyyymm,
};