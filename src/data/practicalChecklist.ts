import type { PracticalCheckItem } from '../types';

export const PRACTICAL_CHECKLIST: PracticalCheckItem[] = [
  // 1. 장비 일반점검 - 외부점검 (15점)
  {
    id: 'ext-safety',
    majorCategory: '장비 일반점검',
    subCategory: '외부점검',
    label: '점검전 안전 확보 여부(고임목, 싸이드, 기어 중립및 파킹 상태 확인)',
    maxScore: 5,
  },
  {
    id: 'ext-body',
    majorCategory: '장비 일반점검',
    subCategory: '외부점검',
    label: '동체 손상여부, 와이퍼 마모상태, 연료캡, 소화기, 누유확인',
    maxScore: 5,
  },
  {
    id: 'ext-tire',
    majorCategory: '장비 일반점검',
    subCategory: '외부점검',
    label: '타이어 점검(마모, 공기압, 휠너트, 이물질 박힘여부, 휠손상 여부)',
    maxScore: 3,
  },
  {
    id: 'ext-hook',
    majorCategory: '장비 일반점검',
    subCategory: '외부점검',
    label: '견인고리 장력, 장착상태, Pin 상태',
    maxScore: 2,
  },

  // 1. 장비 일반점검 - 내부점검 (20점)
  {
    id: 'int-safety',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '점검전,후 안전 확보(엔진덮개 지지대, 닫힌 상태 확인)',
    maxScore: 5,
  },
  {
    id: 'int-oil',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '각종(엔진, 브레이크, 파워, 미션) 오일 점검 등',
    maxScore: 5,
  },
  {
    id: 'int-fuse',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '퓨즈박스 점검(배선정렬, 장착 상태)',
    maxScore: 2,
  },
  {
    id: 'int-belt',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '팬벨트 점검(마모, 장력, 균열)',
    maxScore: 2,
  },
  {
    id: 'int-hose',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '내부 배선 및 각종 호스 정렬/노후 상태',
    maxScore: 2,
  },
  {
    id: 'int-battery',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '배터리 단자의 위치 +/-, 용량, 고정상태 점검',
    maxScore: 2,
  },
  {
    id: 'int-coolant',
    majorCategory: '장비 일반점검',
    subCategory: '내부점검',
    label: '냉각계통 작동이해, 냉각수 점검',
    maxScore: 2,
  },

  // 1. 장비 일반점검 - 전기계통 (9점)
  {
    id: 'elec-lights',
    majorCategory: '장비 일반점검',
    subCategory: '전기계통',
    label: '각종 등화장치 및 와이퍼 작동 여부 점검',
    maxScore: 3,
  },
  {
    id: 'elec-horn',
    majorCategory: '장비 일반점검',
    subCategory: '전기계통',
    label: '경음기 작동 여부 점검',
    maxScore: 3,
  },
  {
    id: 'elec-cluster',
    majorCategory: '장비 일반점검',
    subCategory: '전기계통',
    label: '계기판 작동상태 및 전기계통 작동 여부 점검',
    maxScore: 3,
  },

  // 2. 시동·주행·주정차 - 출발준비 (10점)
  {
    id: 'start-chock',
    majorCategory: '시동 · 주행 · 주정차',
    subCategory: '출발준비',
    label: '고임목 제거, 시동전 기어 중립 및 파킹상태 확인',
    maxScore: 2,
  },
  {
    id: 'start-preheat',
    majorCategory: '시동 · 주행 · 주정차',
    subCategory: '출발준비',
    label: '시동(예열) 및 각종 안전 확보',
    maxScore: 3,
  },
  {
    id: 'start-check',
    majorCategory: '시동 · 주행 · 주정차',
    subCategory: '출발준비',
    label: '출발전 안전 점검(조향장치, 싸이드, 풋브레이크 점검)',
    maxScore: 5,
  },

  // 2. 시동·주행·주정차 - 주행및주차 (9점)
  {
    id: 'drive-shift',
    majorCategory: '시동 · 주행 · 주정차',
    subCategory: '주행및주차',
    label: '일단정지 후 기어 변속',
    maxScore: 3,
  },
  {
    id: 'drive-smooth',
    majorCategory: '시동 · 주행 · 주정차',
    subCategory: '주행및주차',
    label: '급정지 및 급회전 여부',
    maxScore: 3,
  },
  {
    id: 'drive-park',
    majorCategory: '시동 · 주행 · 주정차',
    subCategory: '주행및주차',
    label: '주차방법(정지, 기어P, 사이드브레이크, 엔진정지, 키제거, 고임목, 지적확인)',
    maxScore: 3,
  },

  // 3. 응시태도 (3점)
  {
    id: 'attitude',
    majorCategory: '응시태도',
    subCategory: '응시태도',
    label: '복장상태, 운전자세, 음주상태, 지각',
    maxScore: 3,
  },

  // 4. Dolly 견인 및 연결해제 (25점)
  {
    id: 'dolly-connect',
    majorCategory: 'Dolly 견인 및 연결해제',
    subCategory: 'Dolly 견인 및 연결해제',
    label: 'Dolly 견인고리 연결및 안전 점검(정확도, 연결상태확인, 견인 장비 안전 점검)',
    maxScore: 7,
  },
  {
    id: 'dolly-docking',
    majorCategory: 'Dolly 견인 및 연결해제',
    subCategory: 'Dolly 견인 및 연결해제',
    label: 'Dolly 접현 정확도(접촉, 수평, 이격거리, 평행)',
    maxScore: 15,
  },
  {
    id: 'dolly-release',
    majorCategory: 'Dolly 견인 및 연결해제',
    subCategory: 'Dolly 견인 및 연결해제',
    label: 'Dolly 연결해제 후 Tow Bar Up(이탈시, 바토바)',
    maxScore: 3,
  },

  // 5. 대처능력 (9점)
  {
    id: 'emerg-accident',
    majorCategory: '대처능력',
    subCategory: '대처능력',
    label: '사고발생시 대처 능력(초도보고, 현장보존, 통제)',
    maxScore: 3,
  },
  {
    id: 'emerg-breakdown',
    majorCategory: '대처능력',
    subCategory: '대처능력',
    label: '장비고장시 대처 능력(유류누출시, 주행중 이상시)',
    maxScore: 3,
  },
  {
    id: 'emerg-fire',
    majorCategory: '대처능력',
    subCategory: '대처능력',
    label: '장비 화재시 대처 능력(신조치후보고, 현장보존, 소화기작동법)',
    maxScore: 3,
  },
];

export const PASSING_SCORE = 90;
