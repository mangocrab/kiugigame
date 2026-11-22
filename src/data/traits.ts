import type { Acquired, Field, Rarity, Skill, Stat, Trait } from '../game/types'

type InnateRow = [string, string, string, Stat, number, string?, number?, Field?, number?, number?, Record<string, number>?]
const catalog: Record<Rarity, InnateRow[]> = {
  common: [
    ['curious','호기심','이유를 묻는 걸 두려워하지 않아요.','intelligence',3,'read',.18],
    ['sunny','낙천적','잘 풀리지 않는 날에도 기분을 추슬러요.','resilience',4,'rest',.16],
    ['orderly','성실함','하루의 작은 약속을 지켜요.','diligence',4,'study',.17],
    ['warm','다정한 손길','누군가의 사정을 먼저 살펴요.','social',3,'family',.15,'health',0,1],
    ['nimble','가벼운 발걸음','뛰어놀며 방향을 바꾸는 데 익숙해요.','fitness',4,'exercise',.16],
    ['dreamer','공상가','사소한 장면에서도 새 이야기를 떠올려요.','creativity',4,'hobby',.16,'art',.008],
    ['keen','기민함','작은 움직임도 재빨리 알아차려요.','luck',3,'project',.13],
    ['listener','경청하는 귀','한 걸음 물러서서 끝까지 들어요.','social',3,'friends',.16,'education',0,1],
    ['patient','느긋한 페이스','시간이 걸려도 무리하지 않아요.','resilience',3,'rest',.19],
    ['maker','손재주','일단 손으로 만들어 보면 알 수 있어요.','creativity',3,'project',.19,'practical'],
  ],
  rare: [
    ['quick','빠른 이해력','낯선 개념의 요점을 금방 짚어요.','intelligence',6,'study',.21,'tech'],
    ['steel','강인한 정신','실수 뒤에 돌아와 다시 시작할 수 있어요.','resilience',7,'rest',.24],
    ['palette','예술적 감각','색과 소리 사이의 관계를 잘 느껴요.','creativity',7,'hobby',.24,'art'],
    ['runner','탄탄한 몸','체력 훈련에 수월하게 적응해요.','fitness',7,'exercise',.22,'practical'],
    ['mediator','중재자의 기질','다른 의견 사이에서 공통점을 찾아요.','social',6,'club',.20,'public',0,1,{friends:.12}],
    ['focus','깊은 집중력','관심 있는 문제에 오래 머물 수 있어요.','diligence',6,'research',.22,'science',undefined,undefined,{study:.12}],
    ['serendipity','작은 우연','평범한 순간에 뜻밖의 기회가 따라와요.','luck',6,'read',.14,undefined,.024],
    ['planner','정리의 재능','일의 순서를 정하면 복잡한 문제도 풀려요.','diligence',6,'work',.22,'business',undefined,undefined,{project:.13}],
    ['mentor','설명의 재능','어려운 이야기를 쉽게 풀어 설명해요.','social',6,'volunteer',.22,'education'],
    ['precise','섬세한 관찰','수치의 미세한 차이를 눈여겨봐요.','intelligence',6,'major',.21,'health',undefined,undefined,{read:.12}],
  ],
  legendary: [
    ['genius','천재','프레임을 바꿔 문제의 새 해법을 떠올려요.','intelligence',9,'study',.29,'science'],
    ['fate','운명의 아이','몇몇 우연은 당신에게만 다른 얼굴을 보여요.','luck',9,undefined,undefined,undefined,.105],
    ['versatile','다재다능','새 분야에 발을 들이는 일이 즐거워요.','creativity',8,'project',.29,'tech'],
    ['heart','마음을 읽는 사람','말이 되기 전의 감정까지 알아차려요.','social',8,'friends',.26,'education',0,2],
    ['marathon','한계 너머','몸에 맞는 페이스를 찾는 데 타고났어요.','fitness',9,'exercise',.29,'practical'],
    ['composure','폭풍 속의 고요','흔들릴 때에도 자기 호흡을 찾을 수 있어요.','resilience',9,'rest',.34,'health'],
    ['architect','끝까지 만드는 손','작은 계획을 쌓아 큰 결과를 만들어요.','diligence',8,'work',.29,'business'],
    ['afterimage','꿈의 잔상','꿈에서 본 장면을 현실의 표현으로 바꿔요.','creativity',8,'hobby',.27,'art',.06],
    ['magnet','사람을 잇는 별','낯선 사람들 사이에 먼저 다리를 놓아요.','social',8,'club',.29,'public',0,1],
    ['frontier','미지의 개척자','답보다 좋은 질문에 먼저 관심이 가요.','intelligence',8,'research',.32,'science',.028],
  ],
}
export const traits: Trait[] = (Object.keys(catalog) as Rarity[]).flatMap(rarity => catalog[rarity].map(
  ([id,title,description,stat,value,activity,rate,field,special,bond,secondary]) =>
  ({ id,title,description,rarity,initial:{ [stat]:value },activityRates:{ ...secondary, ...(activity && rate ? { [activity]:rate } : {}) },field,special,bond })
))

type EarnedRow = [string,string,string,string,number,Skill,Field?]
const earned: EarnedRow[] = [
  ['bookworm','독서광','책을 곁에 두는 습관이 생겼어요.','read',5,'language','education'],
  ['essay','문장 수집가','마음에 남는 문장을 자기 언어로 옮겨요.','read',13,'language','art'],
  ['active','운동 습관','몸을 움직이는 일이 일과가 되었어요.','exercise',5,'sports','practical'],
  ['athlete','페이스 메이커','오래 달리는 호흡을 알아요.','exercise',15,'sports','practical'],
  ['network','넓은 인맥','서로 다른 사람들을 한자리에 모을 수 있어요.','friends',7,'people','public'],
  ['counsel','단단한 우정','기쁜 순간과 힘든 순간을 함께 나눠요.','friends',15,'people','education'],
  ['persistent','끈기','복습이 쌓여 실력을 바꾸기 시작했어요.','study',6,'math'],
  ['scholar','탐구하는 학생','공식 너머의 원리를 찾는 즐거움을 알아요.','study',17,'science','science'],
  ['artlover','예술 애호가','보이는 풍경을 자기 방식으로 그려요.','hobby',6,'art','art'],
  ['studio','창작 루틴','영감이 없는 날에도 작업대 앞에 앉아요.','hobby',15,'art','art'],
  ['developer','개발 경험','만들고 고쳐 배포하는 과정을 알아요.','project',5,'code','tech'],
  ['producer','프로젝트 완주자','작업의 범위를 정하고 마무리할 수 있어요.','project',13,'code','tech'],
  ['leader','팀의 연결점','서로의 일을 잘 이어주는 법을 배웠어요.','club',5,'people','public'],
  ['stagehand','무대 뒤의 사람','드러나지 않는 준비의 가치를 알아요.','club',12,'art','art'],
  ['worker','일머리','바쁜 시간대에 무엇을 먼저 해야 할지 알아요.','work',5,'business','business'],
  ['finances','생활 재무','들어오고 나가는 돈을 계획해요.','work',12,'business','business'],
  ['caregiver','돌봄의 손','필요할 때 손을 내미는 습관이 생겼어요.','family',8,'care','health'],
  ['kindness','이웃의 얼굴','낯선 이의 어려움을 돌아보는 습관이 있어요.','volunteer',6,'care','health'],
  ['researcher','연구자 기질','관찰과 해석을 구분해서 기록해요.','research',4,'research','science'],
  ['observer','뛰어난 관찰력','빠뜨린 변수부터 다시 점검해요.','research',9,'science','science'],
  ['expert','전공의 언어','전공 원리를 일상에 설명할 수 있어요.','major',6,'research'],
  ['rested','회복의 기술','지치기 전에 일정에 여백을 남겨요.','rest',9,'care'],
]
export const acquiredTraits: Acquired[] = earned.map(([id,title,description,activity,count,skill,field]) => ({ id,title,description,activity,count,skill,rate:.09,field }))
export const traitById = (id: string) => traits.find(trait => trait.id === id)
export const acquiredById = (id: string) => acquiredTraits.find(trait => trait.id === id)
