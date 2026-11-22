import type { Career, Education, Field, Skill, Stat } from '../game/types'
type CareerRow = [string,string,string,Education,Skill?,number?,Stat?,number?,Field?,string?,number?]
const groups: Record<Field, CareerRow[]> = {
  tech: [
    ['programmer','프로그래머','문제를 한 줄씩 풀어내며, 매일 쓰이는 도구를 만듭니다.','high','code',43,'intelligence',33],
    ['gamedev','게임 개발자','상상 속 규칙을 누구나 만질 수 있는 세계로 옮깁니다.','high','code',55,'creativity',48],
    ['security','정보보안 전문가','서비스를 지키고 이용자가 안전하게 기술을 쓰도록 돕습니다.','college','code',57,'diligence',45,'tech','보안 실무'],
    ['engineer','소프트웨어 엔지니어','동료와 함께 오래 쓸 수 있는 시스템을 설계합니다.','college','code',63,'intelligence',52,'tech'],
    ['uxengineer','웹 접근성 전문가','더 많은 사람이 기술의 문을 열 수 있도록 검토하고 설계합니다.','high','code',35,'social',42],
  ],
  science: [
    ['research','연구원','작은 질문을 검증하고 새로운 근거를 남깁니다.','graduate','research',60,'diligence',44],
    ['astronomer','천문학자','별빛에서 먼 우주의 과거를 읽습니다.','graduate','science',67,'intelligence',55,'science','천체 관측'],
    ['physicist','물리학 연구자','현상의 규칙을 수식과 관측으로 검증합니다.','graduate','math',66,'intelligence',60,'science'],
    ['chemist','화학 연구원','물질의 변화를 실험하고 기록합니다.','graduate','science',59,'diligence',50,'science'],
  ],
  education: [
    ['elementaryteacher','초등학교 교사','자라는 아이들의 첫 질문을 교실에서 만납니다.','college','people',48,'social',49,'education','초등 교원'],
    ['teacher','중등학교 교사','학생들이 스스로 답을 찾는 수업을 만듭니다.','college','people',44,'diligence',47,'education','중등 교원'],
    ['professor','교수','박사 과정과 면접을 지나 연구와 가르침을 잇습니다.','graduate','research',77,'intelligence',64,undefined,'박사·교원'],
    ['librarian','사서','사람과 자료를 연결하고 도서관의 기억을 정리합니다.','college','language',52,'diligence',40,'education','사서 실무'],
    ['educator','교육 프로그램 기획자','배움이 필요한 장소에 새로운 수업을 설계합니다.','high','people',48,'creativity',40],
  ],
  health: [
    ['doctor','의사','의학 교육과 수련을 거쳐 환자의 진료를 맡습니다.','college','care',68,'intelligence',62,'health','의학 전문'],
    ['nurse','간호사','환자에게 필요한 시간을 살피고 회복의 곁을 지킵니다.','college','care',58,'resilience',42,'health','간호 전문'],
    ['pharmacist','약사','약학 과정을 거쳐 약을 조제하고 안전한 복용을 돕습니다.','college','science',65,'diligence',55,'health','약학 전문'],
    ['careworker','돌봄 코디네이터','일상에 도움이 필요한 사람과 지원을 연결합니다.','high','care',48,'social',39],
  ],
  art: [
    ['author','소설가','보통의 순간에 머물며 당신만의 문장을 씁니다.','high','language',65,'creativity',49],
    ['illustrator','일러스트레이터','이야기를 빛과 색으로 장면에 담습니다.','high','art',55,'creativity',53],
    ['musician','음악가','일상의 소리를 자기만의 연주로 바꿉니다.','high','art',63,'resilience',41,undefined,'공연'],
    ['designer','디자이너','보이는 형태와 사람들이 쓰는 방식을 함께 고민합니다.','high','art',48,'creativity',42],
    ['broadcaster','방송 제작자','다른 사람의 이야기가 들리는 화면을 만듭니다.','high','people',54,'creativity',44],
  ],
  business: [
    ['accountant','회계사','실무 수습을 거쳐 숫자로 조직의 상황을 읽고 검증합니다.','college','business',57,'diligence',55,'business','회계 전문'],
    ['founder','창업가','작은 질문에서 시작해 사람들에게 필요한 일을 꾸립니다.','high','business',53,'creativity',38],
    ['manager','경영 기획자','자원과 일정 사이에서 사업의 방향을 잡습니다.','college','business',53,'social',43,'business'],
    ['marketer','마케터','사람들의 생활을 관찰하고 제품이 닿을 자리를 찾습니다.','high','business',40,'social',41],
  ],
  public: [
    ['civil','공무원','채용 과정을 거쳐 지역의 일상과 행정을 돌봅니다.','high','language',46,'diligence',53,undefined,'행정 채용'],
    ['diplomat','외교관','선발 과정을 거쳐 다른 언어와 관점 사이에서 합의를 찾습니다.','college','language',66,'social',57,'public','외교 채용'],
    ['firefighter','소방관','체력과 현장 교육을 거쳐 시민들의 위급한 순간을 돕습니다.','high','sports',60,'fitness',61,undefined,'소방 채용'],
    ['socialworker','지역사회 활동가','동네의 사람과 자원을 연결해 생활을 바꿉니다.','high','care',46,'social',41],
  ],
  practical: [
    ['chef','요리사','바쁜 주방에서 사람을 떠올리며 한 접시를 완성합니다.','high','craft',53,'diligence',41],
    ['athlete','운동선수','자신에게 맞는 호흡으로 훈련하고 경기에 나섭니다.','high','sports',68,'fitness',59],
    ['farmer','농업인','날씨와 땅의 리듬을 읽으며 다음 계절을 준비합니다.','high','craft',34,'fitness',41],
    ['craftsman','생활 공예가','손으로 만든 물건을 사람들의 생활에 들입니다.','high','craft',46,'creativity',44],
    ['worker','일반 사무·현장 실무','일터를 경험하며 앞으로 더 해보고 싶은 일을 찾아갑니다.','high'],
    ['exploring','진로 탐색 중','다음 기회를 알아보면서 자기 속도로 새 생활을 시작합니다.','high'],
  ],
}
const arts: Record<Field,string> = { tech:'tech',science:'science',education:'science',health:'health',art:'art',business:'business',public:'business',practical:'practical' }
export const careers: Career[] = (Object.keys(groups) as Field[]).flatMap(field => groups[field].map(
  ([id,title,description,minimum,skill,level,stat,statLevel,major,track,practice]) =>
  ({ id,title,description,minimum,skill,level,stat,statLevel,major,track,practice,field,art:arts[field] })
))
export const careerById = (id: string) => careers.find(item => item.id === id)
