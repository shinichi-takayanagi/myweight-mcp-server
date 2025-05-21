import axios from 'axios';
import moment from 'moment';

/**
 * 体重データを表す型定義
 * @typedef {Object} WeightData
 * @property {String} date - 測定日（YYYY/MM/DD形式）
 * @property {number} weight - 体重（kg単位）
 */
export type WeightData = {
  date: String;
  weight: number;
};

/**
 * Health PlanetのAPIから返される日付形式（YYYYMMDD）をYYYY/MM/DD形式に変換する
 * @param {string} dateString - YYYYMMDD形式の日付文字列
 * @returns {string} YYYY/MM/DD形式の日付文字列
 * @private
 */
const _parseDate = (dateString: string): string => {
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1;
  const day = parseInt(dateString.slice(6, 8), 10);
  return moment(new Date(year, month, day)).format('YYYY/MM/DD');
};

/**
 * Health PlanetのAPIで体重データを識別するためのタグ
 * 6021: 体重を表すタグID
 */
const TAG_WEIGHT = '6021';

/**
 * Health Planet APIから指定期間の体重データを取得する
 * @param {string} from - 取得開始日時（YYYYMMDDHHmmss形式）
 * @param {string} to - 取得終了日時（YYYYMMDDHHmmss形式）
 * @returns {Promise<WeightData[]>} 体重データの配列
 * @throws {Error} APIリクエストが失敗した場合
 * 
 * @example
 * // 2024年1月1日から2024年1月31日までのデータを取得
 * const data = await fetchInnerScanData('20240101000000', '20240131235959');
 * // 返却値の例:
 * // [
 * //   { date: "2024/01/01", weight: 65.2 },
 * //   { date: "2024/01/02", weight: 65.1 }
 * // ]
 */
export const fetchInnerScanData = async (
  from: string,
  to: string
): Promise<WeightData[]> => {
  const accessToken = '1713215418763/lRdcV5GuHjwvuJ9LiTW4Se0oCaDNNpA6CdVRvDh2';
  const url = 'https://www.healthplanet.jp/status/innerscan.json';
  const params = new URLSearchParams();
  params.append('access_token', accessToken);
  params.append('date', '1');
  params.append('tag', TAG_WEIGHT);
  params.append('from', from);
  params.append('to', to);

  try {
    console.log(url);
    console.log(params);
    const response = await axios.post(url, params);
    // データを新しい順に並び替え、WeightData形式に変換
    console.log(response.data.data);
    return response.data.data.reverse().map((record: { date: string; keydata: string }) => ({
      date: _parseDate(record.date),
      weight: Number(record.keydata),
    }));
  } catch (error) {
    console.error('Error fetching inner scan data:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
        if (error.response.status === 401) {
          throw new Error("Unauthorized: Invalid access token.");
        }
        throw new Error(`API request failed with status ${error.response.status}`);
      }
      console.error("Request failed:", error.message);
      throw new Error("Network Error: Could not connect to the server.");
    }
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      throw error;
    }
    console.error("An unexpected error occurred:", error);
    throw new Error("An unexpected error occurred.");
  }
};
