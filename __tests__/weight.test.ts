import axios from 'axios';
import moment from 'moment';
import { fetchInnerScanData, type WeightData } from '../src/weight';

// axiosのモック
jest.mock('axios', () => {
  return {
    post: jest.fn(),
    isAxiosError: jest.fn().mockReturnValue(true),
    default: {
      post: jest.fn(),
      isAxiosError: jest.fn().mockReturnValue(true)
    }
  };
});

// moment関数全体をモック
jest.mock('moment', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      format: () => '2024/01/01'
    }))
  };
});

// モックの参照を取得
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('fetchInnerScanData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should format data correctly when API returns valid response', async () => {
    // モックレスポンスの設定
    const mockResponse = {
      data: {
        data: [
          {
            date: '20240101',
            keydata: '50.5',
            model: 'model123',
            tag: '6021'
          }
        ]
      }
    };
    
    // モックの設定
    mockAxios.post.mockResolvedValue(mockResponse);

    // API呼び出し（from, toの2つの引数を渡す）
    const result = await fetchInnerScanData('20240101000000', '20240131235959');

    // 期待される結果
    const expected: WeightData[] = [
      {
        date: '2024/01/01',
        weight: 50.5
      }
    ];

    // 検証
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expected);
  });

  it('should throw an error when API returns 401', async () => {
    // エラーレスポンスの設定
    const errorResponse = {
      response: {
        status: 401,
        data: { error: 'Unauthorized' }
      },
      isAxiosError: true
    };

    // モックの設定
    mockAxios.post.mockRejectedValue(errorResponse);

    // エラーがスローされることを確認（from, toの2つの引数を渡す）
    await expect(fetchInnerScanData('20240101000000', '20240131235959')).rejects.toThrow('Unauthorized: Invalid access token.');
  });
}); 