import { careers } from './careers'
import { traitById } from './traits'
import type { Life, Profile, Rarity } from '../game/types'

type Rule = (life: Life, profile: Profile) => boolean
type Row = [string, string, string, Rule]
const all = (life: Life, rarity: Rarity) => life.innate.every(id=>traitById(id)?.rarity===rarity)
const times = (id: string, count: number): Rule => life => (life.counts[id] ?? 0)>=count
const flag = (id: string): Rule => life=>life.flags.includes(id)
const rows: Row[] = [
  ['common','평범함의 가능성','일반 특성 세 개를 고르세요.',life=>all(life,'common')],
  ['rare','특별한 재능','희귀 특성 세 개를 고르세요.',life=>all(life,'rare')],
  ['legend','축복받은 인생','전설 특성 세 개를 고르세요.',life=>all(life,'legendary')],
  ['balance','균형 잡힌 시작','세 희귀도의 특성을 하나씩 고르세요.',life=>new Set(life.innate.map(id=>traitById(id)?.rarity)).size===3],
  ['effort','재능보다 노력','일반 특성 세 개로 학업 성취도 85점에 도달하세요.',life=>all(life,'common') && life.vitals.grades>=85],
  ['hero','평범한 영웅','일반 특성 세 개로 전문 자격 또는 석사 학위가 필요한 직업을 고르세요.',
    life=>all(life,'common') && careers.some(career=>career.id===life.career && (career.track || career.minimum==='graduate'))],
  ['first','첫 번째 미래','첫 직업 엔딩에 도달하세요.',life=>Boolean(life.career)],
  ['different','다양한 미래','서로 다른 직업 엔딩 열 개를 발견하세요.',(life,profile)=>new Set([...profile.runs.map(run=>run.career),life.career].filter(Boolean)).size>=10],
  ['old','오래된 인연','어린 시절 친구와 성인이 되어 재회하세요.',flag('reunion')],
  ['rebel','운명의 반역자','미래의 편지가 가리킨 길을 자기 방식으로 마무리하세요.',flag('fate-rebel')],
  ['potential','수많은 가능성','선천적 특성 30개를 모두 경험하세요.',(_,profile)=>profile.experienced.length>=30],
  ['birth','첫 숨','출생 사건을 마치세요.',life=>Boolean(life.seen.birth)],
  ['books','책장 너머','독서를 다섯 번 하세요.',times('read',5)],
  ['pace','내 호흡 찾기','운동을 열 번 하세요.',times('exercise',10)],
  ['bestfriend','곁에 있는 사람','가족 이외 인물의 친밀도와 신뢰도를 각각 75 이상으로 쌓으세요.',
    life=>Object.entries(life.relationships).some(([id,bond])=>id!=='family' && bond.affinity>=75 && bond.trust>=75)],
  ['traits','습관의 힘','한 회차에서 후천적 특성 다섯 개를 얻으세요.',life=>life.acquired.length>=5],
  ['csat','11월의 시험장','수능에 응시하세요.',life=>life.exam!==undefined],
  ['independent','또 다른 길','수능에 응시하지 않고 직업을 선택하세요.',life=>Boolean(life.career && life.exam===undefined)],
  ['high','마지막 교복','고등학교를 졸업하세요.',life=>Boolean(life.seen.highOut)],
  ['university','첫 강의실','대학교에 입학하세요.',life=>Boolean(life.seen.collegeIn)],
  ['college','학위복의 무게','대학교를 졸업하세요.',life=>Boolean(life.seen.collegeOut)],
  ['grad','질문을 업으로','대학원에 입학하세요.',life=>Boolean(life.seen.gradIn)],
  ['thesis','각주에 남은 시간','논문과 학위 심사를 통과하세요.',flag('thesis')],
  ['graduate','연구실 마지막 불','대학원을 졸업하세요.',life=>Boolean(life.seen.gradOut)],
  ['tinker','첫 빌드','개인 프로젝트를 다섯 번 진행하세요.',times('project',5)],
  ['stage','막이 올라간다','오디션에서 무대에 서세요.',flag('performance')],
  ['money','나의 생활비','소지금 30만 원을 모으세요.',life=>life.vitals.money>=300000],
  ['volunteer','함께 사는 동네','봉사를 여섯 번 하세요.',times('volunteer',6)],
  ['repair','꺼지지 않는 화면','태블릿을 수리하거나 기록 서버의 데이터를 복구하세요.',life=>['device-fix','data-recovery'].some(id=>life.flags.includes(id))],
  ['art','오래 보고 그리다','예술 숙련도 65에 도달하세요.',life=>life.skills.art>=65],
  ['calm','쉬어 가는 법','휴식을 아홉 번 하세요.',times('rest',9)],
  ['memory','살아온 장면들','서로 다른 사건 서른 개를 겪으세요.',life=>Object.keys(life.seen).length>=30],
  ['family','우리 집 식탁','가족과 시간 보내기를 여덟 번 하세요.',times('family',8)],
  ['night','종소리가 돌아온 날','같은 오후의 반복을 끝내세요.',flag('loop-broken')],
]
export const achievements = rows.map(([id,title,description,check])=>({id,title,description,check}))
