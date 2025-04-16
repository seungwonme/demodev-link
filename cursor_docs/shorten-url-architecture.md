# 월부의 자체 단축 URL 개발기

## 1. 개요

- Bitly와 같은 외부 서비스의 한계
  - 메시지 개인화 수요 증가
  - 실시간 마케팅 필요성
  - 수천 건 단위의 링크 대량 생성 요구
  - 네트워크 통신으로 인한 속도와 비용 문제
  - 커스터마이징 기능의 제약

## 2. 기술적 해결 방안

### 2.1 ID 생성 전략: Snowflake ID

- 구성
  - Timestamp (41bit)
  - Worker ID (10bit)
  - Sequence (12bit)

### 2.2 Worker ID 할당 방식

- Subnet + Private IP 조합으로 10bit Worker ID 생성
  - 2bit: Subnet 구분 (AZ 또는 대역)
  - 8bit: Private IP 마지막 옥텟 (0~255)
- 예시
  ```
  10.10.30.1 (subnet A, ip=1)
  Subnet Bit: 00
  IP Bit: 00000001
  최종 Worker ID: 0000000001 (10bit)
  ```

### 2.3 아키텍처 흐름

1. ALB에서 /s/{key} 패턴 인식
2. Lambda 서버가 key로 원본 URL 조회
3. 없으면 기본 URL 반환
4. 301 Redirection으로 URL 리다이렉트

## 3. 장점

- 대량 발송 처리 가능 (초당 수만 개 처리 가능)
- 자체 도메인 사용으로 신뢰도 향상
- 가독성 개선
- 비용 효율성
- 커스터마이징 자유도 증가

## 4. 참고 자료

- 『가상 면접 사례로 배우는 대규모 시스템 설계』
- 분산 환경에서의 고유 ID 생성 전략
- Snowflake ID 알고리즘
