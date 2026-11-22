import { allStages } from '../game/config'
import type { Activity, NPC } from '../game/types'

const school = allStages.slice(1)
const teens = allStages.slice(2)
const adults = allStages.slice(4)

export const activities: Activity[] = [
  { id: 'study', title: '공부하기', description: '배운 내용을 복습하고 기초를 다져요.', stages: school, effects: { stats: { intelligence: 2, diligence: 1 }, vitals: { grades: 4, stress: 5 }, skills: { math: 2, language: 2, science: 1 } } },
  { id: 'read', title: '독서하기', description: '책을 읽으며 낯선 세상을 만나요.', stages: allStages, effects: { stats: { intelligence: 1.5, creativity: 1 }, vitals: { mood: 2, grades: 1 }, skills: { language: 3 } } },
  { id: 'exercise', title: '운동하기', description: '몸을 움직이고 기분을 환기해요.', stages: allStages, effects: { stats: { fitness: 2.8, resilience: .7 }, vitals: { health: 4, stress: -3 }, skills: { sports: 4 } } },
  { id: 'friends', title: '친구 만나기', description: '가까운 사람과 시간을 보내요.', stages: school, effects: { stats: { social: 2.3 }, vitals: { mood: 5, stress: -3 }, skills: { people: 3 } } },
  { id: 'family', title: '가족과 시간 보내기', description: '식탁에 둘러앉아 일상을 나눠요.', stages: allStages, effects: { stats: { resilience: 1.7, social: .8 }, vitals: { mood: 5, stress: -3 }, skills: { care: 3, craft: 1 }, relationship: { id: 'family', affinity: 3, trust: 2 } } },
  { id: 'hobby', title: '취미 활동', description: '좋아하는 일을 내 방식으로 해봐요.', stages: allStages, effects: { stats: { creativity: 2.6 }, vitals: { mood: 4, stress: -2 }, skills: { art: 4, craft: 2 } } },
  { id: 'project', title: '개인 프로젝트', description: '작은 결과물을 끝까지 만들어 봐요.', stages: teens, effects: { stats: { intelligence: 1.1, creativity: 1.7, diligence: .8 }, vitals: { stress: 4 }, skills: { code: 4, craft: 2, business: 1 } } },
  { id: 'club', title: '동아리 활동', description: '함께 목표를 정하고 활동해요.', stages: teens, effects: { stats: { social: 1.7, creativity: 1 }, vitals: { mood: 3, stress: 1 }, skills: { people: 2, art: 2, business: 1.5 } } },
  { id: 'work', title: '아르바이트', description: '일을 배우고 생활비를 마련해요.', stages: allStages.slice(3), effects: { stats: { diligence: 1.9, social: .8 }, vitals: { money: 38000, stress: 5, health: -2 }, skills: { business: 4, craft: 3 } } },
  { id: 'rest', title: '휴식하기', description: '충분히 쉬고 다음 시기를 준비해요.', stages: allStages, effects: { stats: { resilience: .8 }, vitals: { health: 7, mood: 5, stress: -11 } } },
  { id: 'major', title: '전공 공부', description: '전공 지식을 쌓고 학기 평가를 준비해요.', stages: adults, effects: { stats: { intelligence: 1.8, diligence: 1.2 }, vitals: { grades: 5, stress: 4 }, skills: { research: 2 } } },
  { id: 'research', title: '연구하기', description: '질문을 세우고 근거를 기록해요.', stages: adults, effects: { stats: { intelligence: 1.8, diligence: 1.1 }, vitals: { grades: 2, stress: 5 }, skills: { research: 5, science: 2 } } },
  { id: 'volunteer', title: '봉사 활동', description: '이웃을 만나 필요한 일을 함께 해요.', stages: school, effects: { stats: { social: 1.3, resilience: 1 }, vitals: { mood: 4, stress: 1 }, skills: { care: 4, people: 1.5 } } },
]

export const npcs: NPC[] = [
  { id: 'family', name: '가족', age: 31, role: '가족', personality: '조심스럽고 다정함', goal: '서로의 하루를 아는 가족이 되기', situation: '식탁에서 당신의 이야기를 기다려요.', stages: allStages, affinity: 65, trust: 60, values: ['일상', '관계'] },
  { id: 'nari', name: '오나리', age: 0, role: '소꿉친구', personality: '솔직하고 호기심이 많음', goal: '동네 라디오를 만들기', situation: '늘 재미있는 소리를 찾아다녀요.', stages: ['early', 'elementary', 'college', 'graduate'], affinity: 18, trust: 12, values: ['관계', '성장'] },
  { id: 'yujin', name: '한유진', age: 7, role: '초등학교 친구', personality: '신중하고 다투기를 싫어함', goal: '동네 새를 모두 관찰하기', situation: '학교 화단 옆에서 수첩을 펼쳐요.', stages: ['elementary'], affinity: 12, trust: 14, values: ['학교', '관계'] },
  { id: 'jun', name: '서준', age: 13, role: '중학교 친구', personality: '경쟁심이 강하고 공정함을 중시함', goal: '자기 팀과 함께 대회 완주하기', situation: '운동장에 가장 먼저 나와 있어요.', stages: ['middle'], affinity: 10, trust: 10, values: ['학교', '성장'] },
  { id: 'hayun', name: '정하윤', age: 16, role: '고등학교 동아리 친구', personality: '대담하고 약속을 중요하게 여김', goal: '친구들과 첫 작품을 완성하기', situation: '동아리방에서 기획 노트를 정리해요.', stages: ['high', 'college'], affinity: 16, trust: 12, values: ['관계', '진로'] },
  { id: 'teacher', name: '김도현', age: 33, role: '담임 선생님', personality: '엄격하고 관찰력이 좋음', goal: '학생이 자기 기준으로 진로를 고르게 돕기', situation: '아직 제출되지 않은 진로 카드를 챙겨요.', stages: ['elementary', 'middle', 'high'], affinity: 12, trust: 18, values: ['학교', '진로'] },
  { id: 'mina', name: '윤민아', age: 19, role: '대학 동기', personality: '계획적이고 경계가 분명함', goal: '교내 프로젝트를 지역에 공개하기', situation: '학생회관 게시판에 모임 공고를 붙여요.', stages: ['college'], affinity: 14, trust: 13, values: ['진로', '경제'] },
  { id: 'prof', name: '이수현', age: 44, role: '지도 교수', personality: '회의적이고 근거를 중시함', goal: '재현할 수 있는 연구를 남기기', situation: '실험 기록을 꼼꼼하게 검토해요.', stages: ['college', 'graduate'], affinity: 12, trust: 16, values: ['진로', '성장'] },
  { id: 'sol', name: '문솔', age: 24, role: '연구실 동료', personality: '직설적이고 협업에 적극적임', goal: '혼자서는 풀 수 없는 문제 해결하기', situation: '랩 미팅 준비를 서두르고 있어요.', stages: ['graduate'], affinity: 13, trust: 12, values: ['관계', '진로'] },
]
