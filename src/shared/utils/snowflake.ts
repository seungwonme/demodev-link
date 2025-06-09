/**
 * Snowflake 알고리즘을 사용한 고유 ID 생성기
 * 타임스탬프, 워커 ID, 시퀀스 번호를 조합하여 고유한 ID를 생성합니다.
 */
export class Snowflake {
  private static EPOCH = 1609459200000; // 2021-01-01 기준
  private static WORKER_ID = Math.floor(Math.random() * 1024); // 0-1023 사이의 랜덤 워커 ID
  private static SEQUENCE = 0;
  private static LAST_TIMESTAMP = -1;
  private static SEQUENCE_MASK = 4095; // 12비트 마스크 (0xFFF)
  private static TIMESTAMP_SHIFT = 22;
  private static WORKER_ID_SHIFT = 12;

  // Base62 문자셋 (0-9, a-z, A-Z)
  private static BASE62 =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /**
   * 고유한 Base62 인코딩된 ID를 생성합니다.
   * @returns A unique string identifier (base62 encoded)
   */
  static async generate(): Promise<string> {
    const timestamp = Date.now();

    if (timestamp === Snowflake.LAST_TIMESTAMP) {
      Snowflake.SEQUENCE = (Snowflake.SEQUENCE + 1) & Snowflake.SEQUENCE_MASK;
      if (Snowflake.SEQUENCE === 0) {
        // Wait for next millisecond
        while (Date.now() <= timestamp) {
          // Busy wait
        }
      }
    } else {
      Snowflake.SEQUENCE = 0;
    }

    Snowflake.LAST_TIMESTAMP = timestamp;

    // Generate 64-bit ID (as BigInt for precision)
    const id =
      (BigInt(timestamp - Snowflake.EPOCH) <<
        BigInt(Snowflake.TIMESTAMP_SHIFT)) |
      (BigInt(Snowflake.WORKER_ID) << BigInt(Snowflake.WORKER_ID_SHIFT)) |
      BigInt(Snowflake.SEQUENCE);

    try {
      return Snowflake.toBase62(id);
    } catch {
      throw new Error("Failed to generate unique ID");
    }
  }

  /**
   * 숫자를 Base62로 인코딩합니다.
   */
  private static toBase62(num: bigint): string {
    if (num === BigInt(0)) {
      return "0"; // 0 처리
    }
    let result = "";
    let value = num;
    while (value > BigInt(0)) {
      result = Snowflake.BASE62[Number(value % BigInt(62))] + result;
      value = value / BigInt(62);
    }
    return result;
  }
}
