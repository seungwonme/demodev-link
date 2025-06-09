import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  // Base62 문자셋 (0-9, a-z, A-Z)
  private static BASE62 =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // 뮤텍스 역할을 하는 락 객체
  private static mutex = {
    locked: false,
    queue: [] as (() => void)[],

    lock(): Promise<void> {
      return new Promise((resolve) => {
        if (!this.locked) {
          this.locked = true;
          resolve();
        } else {
          this.queue.push(resolve);
        }
      });
    },

    unlock(): void {
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      } else {
        this.locked = false;
      }
    },
  };

  /**
   * 고유한 Base62 인코딩된 ID를 생성합니다.
   * 동시성 제어를 위해 뮤텍스 패턴을 사용합니다.
   */
  static async generate(): Promise<string> {
    await this.mutex.lock();

    try {
      let timestamp = Date.now() - this.EPOCH;

      if (timestamp < this.LAST_TIMESTAMP) {
        console.warn(
          "Clock moved backwards. Waiting until the last timestamp.",
        );
        timestamp = this.LAST_TIMESTAMP;
      }

      if (timestamp === this.LAST_TIMESTAMP) {
        this.SEQUENCE = (this.SEQUENCE + 1) & this.SEQUENCE_MASK;
        if (this.SEQUENCE === 0) {
          // 시퀀스 번호가 소진되면 다음 밀리초까지 대기
          timestamp = this.tilNextMillis(this.LAST_TIMESTAMP);
        }
      } else {
        this.SEQUENCE = 0;
      }

      this.LAST_TIMESTAMP = timestamp;

      const id =
        (BigInt(timestamp) << BigInt(22)) |
        (BigInt(this.WORKER_ID) << BigInt(12)) |
        BigInt(this.SEQUENCE);

      return this.toBase62(id);
    } finally {
      this.mutex.unlock();
    }
  }

  /**
   * 주어진 타임스탬프보다 큰 다음 타임스탬프를 반환합니다.
   */
  private static tilNextMillis(lastTimestamp: number): number {
    let timestamp = Date.now() - this.EPOCH;
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now() - this.EPOCH;
    }
    return timestamp;
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
      result = this.BASE62[Number(value % BigInt(62))] + result;
      value = value / BigInt(62);
    }
    return result;
  }
}

/**
 * 요청 정보(IP, User-Agent 등)를 추출하는 유틸리티
 */
export const RequestUtils = {
  /**
   * 요청에서 IP 주소와 User-Agent 정보를 추출합니다.
   */
  getRequestInfo(req?: Request) {
    try {
      if (req) {
        // 직접 Request 객체가 전달된 경우 (API 라우트)
        const userAgent = req.headers.get("user-agent");
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        return { userAgent, ip };
      }

      // Request 객체가 없는 경우 기본값 반환
      return {
        userAgent: null,
        ip: "unknown",
      };
    } catch (error) {
      console.error("Error getting request info:", error);
      return {
        userAgent: null,
        ip: "unknown",
      };
    }
  },
};

/**
 * 문자열 조작과 관련된 유틸리티 함수들
 */
export const StringUtils = {
  /**
   * 문자열을 주어진 길이로 잘라내고 말줄임표를 추가합니다.
   */
  truncate(str: string, length: number): string {
    if (!str) return "";
    return str.length > length ? `${str.substring(0, length)}...` : str;
  },

  /**
   * URL에서 도메인 이름만 추출합니다.
   */
  extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return url;
    }
  },
};
