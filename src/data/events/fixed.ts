import { balance, fieldNames, majors } from '../../game/config'
import type { Art, Changes, Choice, Event, Field, Life } from '../../game/types'
import { careers } from '../careers'
import { meetCareer } from '../../game/qualifications'

const choice = (id: string, label: string, result: string, effects?: Changes, action?: string): Choice => ({ id,label,result,effects,action })
const fixed = (id: string, title: string, description: string, art: Art, choices: Choice[], importance = 4): Event =>
  ({ id,title,description,art,choices,category:'고정',importance,record:importance>=3 })
const fieldChoices = (action: string, fields = Object.keys(fieldNames) as Field[]) => fields.map(field =>
  choice(field, action==='major' ? majors[field].title : fieldNames[field],
    action==='major' ? majors[field].title+' 전공을 선택했습니다.' : fieldNames[field]+' 분야에 마음이 기울었습니다.',
    { skills:{ [majors[field].skill]:3 } }, action+':'+field))

const milestones: Record<string, Event> = {
  birth:fixed('birth','세상에 온 날','창문에 빛이 번집니다. 누군가 조심스럽게 손가락 하나를 당신의 손에 얹습니다.','home',[
    choice('hold','손가락을 꼭 쥔다','작은 손이 당신을 기다리던 손을 찾았습니다.',{ stats:{ resilience:2 },relationship:{id:'family',affinity:3,trust:2} }),
    choice('light','따뜻한 빛 쪽을 바라본다','눈꺼풀에 처음으로 따뜻한 빛이 닿았습니다.',{ stats:{ creativity:2 },vitals:{ mood:4 } }),
  ],5),
  earlyGrowth:fixed('earlyGrowth','처음으로 또렷하게 한 말','가족이 아이의 작은 소리에 잠깐 하던 일을 멈춥니다. 이제 명확히 한 단어를 말할 수 있습니다.','home',[
    choice('name','익숙한 사람을 부른다','말소리가 오가는 방향을 알게 됐습니다.',{stats:{social:2},skills:{language:3}}),
    choice('question','눈앞의 물건이 무엇인지 묻는다','이름을 알고 나니 다른 물건도 궁금해졌습니다.',{stats:{intelligence:2},skills:{language:2,science:1}}),
  ]),
  elementaryIn:fixed('elementaryIn','처음 멘 책가방','새 책가방을 메고 학교 정문을 지나갑니다. 당신보다 먼저 교실을 찾은 아이들이 있습니다.','elementary',[
    choice('hello','옆자리 친구에게 먼저 인사한다','유진이 연필을 빌려주며 자기 이름을 알려줬습니다.',{relationship:{id:'yujin',affinity:5,trust:3},stats:{social:2}}),
    choice('look','교실을 천천히 둘러본다','칠판 왼쪽의 작은 학급 문고부터 기억했습니다.',{skills:{language:4},vitals:{mood:3}}),
  ],5),
  elementaryOut:fixed('elementaryOut','작아 보이는 교문','6년 전에는 한참 높아 보이던 교문이 이제는 손을 뻗으면 닿을 것처럼 보입니다.','elementary',[
    choice('class','교실을 마지막으로 정리한다','책상 속에 놓고 갈 물건이 없는지 한 번씩 살폈습니다.',{stats:{diligence:2},vitals:{stress:-3}}),
    choice('friend','교문에서 친구들과 사진을 찍는다','각자 첫날에 어떤 기분이었는지 이야기했습니다.',{relationship:{id:'yujin',affinity:5,trust:3},vitals:{mood:5}}),
  ],5),
  middleIn:fixed('middleIn','새로 읽는 시간표','같은 교실에 있어도 수업마다 새로운 선생님이 들어옵니다. 시간표를 보며 하루를 상상합니다.','classroom',[
    choice('schedule','과목마다 공책을 나눈다','첫 주의 준비물을 시간표 옆에 정리했습니다.',{stats:{diligence:2},vitals:{grades:3}}),
    choice('peer','길을 헤매는 학생에게 말을 건다','서준과 나란히 교실을 찾아 들어갔습니다.',{relationship:{id:'jun',affinity:5,trust:3},stats:{social:2}}),
  ],5),
  middleOut:fixed('middleOut','다음 교복을 고르는 날','정든 교복을 옷걸이에 거는 마지막 날입니다. 학교를 옮기면 만나는 사람도 배우는 과목도 달라집니다.','field',[
    choice('keep','즐거웠던 일을 적어 둔다','다음 학교에서도 계속할 일을 한 줄 적었습니다.',{stats:{resilience:3},vitals:{mood:3}}),
    choice('thank','도움을 받았던 사람에게 인사한다','서준이 다음 경기에도 와 달라고 했습니다.',{relationship:{id:'jun',affinity:5,trust:4},skills:{people:3}}),
  ],5),
  highIn:fixed('highIn','봄의 첫 교실','고등학교 교실의 창을 열자 아직 차가운 바람이 들어옵니다. 새로운 교과서에서 먼저 읽을 페이지를 고릅니다.','classroom',[
    choice('books','관심 있는 수업을 살핀다','첫 수업 전에 교과서 차례를 다 읽었습니다.',{vitals:{grades:4},skills:{math:3}}),
    choice('club','복도에 붙은 동아리 포스터를 읽는다','포스터에 번호를 적던 하윤과 이야기했습니다.',{relationship:{id:'hayun',affinity:5,trust:3},skills:{people:3}}),
  ],5),
  explore:fixed('explore','빈 진로 카드','희망 직업을 쓰는 카드가 놓여 있습니다. 한 분야를 써 봐도 나중에 선택을 바꿀 수 있습니다.','classroom',[
    ...fieldChoices('aspiration'),choice('undecided','조금 더 탐색한다','새로운 가능성을 적을 자리를 남겨 두었습니다.',{stats:{resilience:2}},'aspiration:none'),
  ],5),
  preparation:fixed('preparation','졸업 뒤를 준비하는 법','담임과 남은 학기를 어떻게 보낼지 이야기합니다. 내신과 면접을 보는 전형, 수능 중심 전형, 취업 준비가 안내되어 있습니다.','library',[
    choice('school','학생부와 면접을 준비한다','수업과 탐구 과정의 기록을 모았습니다.',{vitals:{grades:3},skills:{people:3}},'route:school'),
    choice('csat','수능 중심 전형을 준비한다','시험을 대비해 시간 관리와 취약 과목을 점검했습니다.',{skills:{math:4,language:3},vitals:{stress:3}},'route:csat'),
    choice('work','취업과 실무를 준비한다','지금 할 수 있는 일과 급여 조건을 찾아봤습니다.',{skills:{business:5,craft:3}},'route:work'),
  ],5),
  csat:fixed('csat','11월, 수능이 있는 날','등교하지 않는 날이지만 학교 앞은 이른 시간부터 분주합니다. 응시할지 마지막으로 결정합니다.','classroom',[
    choice('sit','수능에 응시한다','시험장에서 마지막 종소리까지 문제를 풀었습니다.',undefined,'exam:sit'),
    choice('skip','응시하지 않는다','그날은 자신의 일정대로 보냈습니다. 학생부 전형과 취업 준비는 계속할 수 있습니다.',{vitals:{stress:-7},stats:{resilience:2}},'exam:skip'),
  ],5),
  highOut:fixed('highOut','한 번 더 울리는 종','교실에서 나가기 전 누군가 창을 열어 둡니다. 끝내지 못한 이야기와 끝까지 해낸 일들이 떠오릅니다.','classroom',[
    choice('photo','마지막 풍경을 사진에 남긴다','햇빛이 책상 아래까지 길게 들어온 순간을 찍었습니다.',{vitals:{mood:6},skills:{art:3}}),
    choice('letter','떠나기 전에 감사 인사를 건넨다','담임은 다음에 하는 일이 궁금하다며 웃었습니다.',{relationship:{id:'teacher',affinity:5,trust:5},vitals:{stress:-4}}),
  ],5),
  collegeAccepted:fixed('collegeAccepted','합격 통지를 열다','선택한 대학 전형의 합격 통지가 왔습니다. 서류를 확인하고 첫 학기의 생활을 준비합니다.','campus',[
    choice('save','등록 기한과 안내를 적어 둔다','등록금과 준비해야 할 서류 목록을 정리했습니다.',{skills:{business:3},stats:{diligence:2}}),
    choice('share','기다리던 가족에게 소식을 전한다','식탁 위에 저녁이 놓일 때까지 기쁜 이야기를 나눴습니다.',{relationship:{id:'family',affinity:5,trust:4},vitals:{mood:5}}),
  ],5),
  collegeIn:fixed('collegeIn','캠퍼스를 처음 걷다','앞으로 몇 년을 보낼 캠퍼스에 도착했습니다. 많은 사람이 서로 다른 방향으로 걸어갑니다.','campus',[
    choice('walk','건물과 걸리는 시간을 확인한다','강의실 사이의 큰 계단을 피하는 길을 찾았습니다.',{skills:{craft:3},stats:{diligence:2}}),
    choice('meet','같은 안내문을 보는 사람과 인사한다','윤민아와 학교 게시판을 함께 살폈습니다.',{relationship:{id:'mina',affinity:6,trust:4},stats:{social:2}}),
  ],5),
  collegeOut:fixed('collegeOut','학위복을 빌리는 아침','길던 학기가 차례로 끝났습니다. 졸업장을 받기 전 무엇을 함께 배웠는지 떠올립니다.','campus',[
    choice('thanks','수업에서 도움받은 사람을 찾아간다','알고 있는 것을 혼자 배운 것이 아니었음을 기억했습니다.',{relationship:{id:'prof',affinity:4,trust:5},vitals:{mood:4}}),
    choice('portfolio','완성한 과제와 기록을 정리한다','몇 년 전 과제와 지금의 과제가 달라진 이유를 적었습니다.',{skills:{research:3}}),
  ],5),
  gradAccepted:fixed('gradAccepted','대학원 합격 소식','연구 계획과 지금까지의 성과가 검토됐습니다. 지원했던 과정에 합격했습니다.','lab',[
    choice('plan','제출한 계획서에서 첫 질문을 고른다','무엇을 확인할지 한 문장으로 좁혔습니다.',{skills:{research:4}}),
    choice('meet','먼저 연구실에 인사한다','지도 교수와 첫 미팅 시간이 잡혔습니다.',{relationship:{id:'prof',affinity:4,trust:5}}),
  ],5),
  gradIn:fixed('gradIn','연구실의 빈 책상','지정된 책상에 노트 하나가 놓여 있습니다. 옆자리 동료가 공용 공간을 안내합니다.','lab',[
    choice('notes','연구 노트에 날짜를 적는다','결과와 가설을 따로 남길 자리를 마련했습니다.',{skills:{research:4},stats:{diligence:2}}),
    choice('team','동료에게 진행 중인 일을 묻는다','문솔이 함께 검토할 자료를 보여 주었습니다.',{relationship:{id:'sol',affinity:6,trust:5},skills:{people:3}}),
  ],5),
  gradWork:fixed('gradWork','첫 학기의 연구 계획','교수와 동료 앞에 짧은 연구 계획을 펼쳐 놓았습니다. 처음부터 무엇까지 다룰지 합의해야 합니다.','lab',[
    choice('scope','질문을 작게 좁히고 자료를 모은다','지금 가진 자료로 답할 수 있는 범위가 분명해졌습니다.',{skills:{research:6},stats:{diligence:2}},'research:8'),
    choice('collaborate','동료와 변수 하나를 함께 점검한다','다른 사람이 같은 결과를 얻을 수 있는지부터 확인했습니다.',{skills:{research:4},relationship:{id:'sol',affinity:5,trust:5}},'research:6'),
  ]),
  gradOut:fixed('gradOut','연구실의 마지막 불','제출한 논문과 자료를 정리하고 마지막으로 연구실 문을 닫습니다. 내일도 이곳의 불은 다른 사람을 위해 켜질 겁니다.','lab',[
    choice('notes','다음 연구자에게 주의점을 남긴다','처음 쓰는 사람도 참고할 설명을 공용 폴더에 남겼습니다.',{skills:{research:4},relationship:{id:'sol',affinity:5,trust:6}}),
    choice('quiet','가장 오래 걸렸던 결과를 한 번 더 본다','아무 일도 되지 않던 날들이 결국 어디까지 왔는지 살폈습니다.',{stats:{resilience:3},vitals:{mood:5}}),
  ],5),
  final:fixed('final','지금, 어떤 일을 할까요?','살아오며 쌓인 경험을 돌아봅니다. 준비해 온 분야와 지금 선택할 수 있는 일을 확인할 시간입니다.','street',[
    choice('next','내가 할 수 있는 일을 확인한다','그동안의 경험을 정리해 직업 후보를 확인했습니다.',{stats:{resilience:1}},'final:open'),
  ],5),
}

const artFor = (life: Life): Art => life.stage==='early' ? 'home' : life.stage==='elementary' ? 'elementary' : life.stage==='college' ? 'campus' : life.stage==='graduate' ? 'lab' : 'classroom'
const routine: Record<string, [string,string,Choice[]]> = {
  birthday:['올해의 생일','하루의 끝에 무엇을 기억할지 생각합니다.',[
    choice('share','가까운 사람과 시간을 보낸다','조용히 서로의 하루를 들었습니다.',{vitals:{mood:4},relationship:{id:'family',affinity:2,trust:1}}),
    choice('wish','올해 하고 싶은 일을 적는다','기억하고 싶은 한 가지를 남겼습니다.',{stats:{resilience:1},vitals:{mood:2}})]],
  year:['새 학년 · 반 배정','바뀐 교실과 학생 명단을 확인합니다.',[
    choice('greet','처음 보는 사람에게 인사한다','이름을 두어 개 기억했습니다.',{skills:{people:2},vitals:{mood:2}}),
    choice('settle','시간표와 교실 위치를 정리한다','다음 교실을 빨리 찾을 수 있습니다.',{stats:{diligence:1},vitals:{stress:-2}})]],
  term:['새 학기의 첫 수업','교실에 들어서자 새 교과 과정의 안내문이 놓여 있습니다.',[
    choice('plan','마음에 걸리는 과목부터 살핀다','이번 학기에 확인할 질문을 정했습니다.',{vitals:{grades:2},skills:{language:1}}),
    choice('pace','시간표에 쉴 자리도 남긴다','무리하지 않고 시작할 수 있었습니다.',{vitals:{stress:-4},stats:{resilience:1}})]],
  middleExam:['중간고사','책상을 줄 맞춰 놓고 시험을 시작합니다.',[
    choice('solve','익숙한 문제를 먼저 푼다','시간을 남겨 놓친 부분을 살폈습니다.',{skills:{math:2}},'assessment:steady'),
    choice('calm','속도보다 정확성을 챙긴다','할 수 있는 문제부터 답을 냈습니다.',{vitals:{stress:-3}},'assessment:calm')]],
  finalExam:['기말고사','이번 학기에 배운 내용을 확인하는 마지막 시험입니다.',[
    choice('review','답안지를 한 번 더 확인한다','오래 생각한 풀이의 실수를 찾아 고쳤습니다.',{skills:{language:2}},'assessment:steady'),
    choice('pause','페이스를 지키며 시험을 마친다','마지막까지 답을 하나씩 확인했습니다.',{vitals:{stress:-3}},'assessment:calm')]],
  grades:['성적표와 학기 마무리','한 학기를 마치며 다음에 바꿔 볼 일을 생각합니다.',[
    choice('feedback','틀린 문제의 종류를 확인한다','다음에 시간을 더 쓸 부분이 보였습니다.',{vitals:{grades:2},stats:{diligence:1}}),
    choice('closure','노트를 정리하고 잠시 쉰다','몸과 마음에 다음 학기를 위한 여유가 생겼습니다.',{vitals:{stress:-5,mood:3}})]],
  vacation:['방학의 첫날','몇 주 동안 알람을 조금 늦게 맞춰도 됩니다.',[
    choice('rest','밀린 잠을 보충한다','며칠 만에 알람이 울리기 전에 눈을 떴습니다.',{vitals:{health:4,stress:-6}}),
    choice('try','미뤄 둔 취미 하나를 해 본다','결과를 보여 줄 필요가 없으니 오래 즐길 수 있었습니다.',{skills:{art:3},vitals:{mood:4}})]],
  course:['수강 신청','한정된 수업 시간에 무엇을 더 배우고 싶은지 정합니다.',[
    choice('core','전공 기초 과목을 우선 신청한다','전공의 다음 단계에 필요한 강의를 등록했습니다.',{skills:{research:2},vitals:{grades:2}},'credits:4'),
    choice('choice','평소 궁금했던 교양 수업을 듣는다','다른 전공의 학생들이 질문을 해석하는 방식이 달랐습니다.',{skills:{people:3},vitals:{mood:4}},'credits:2')]],
  termEval:['대학 학기 평가','과제와 시험, 출석을 모아 학기 성과를 계산합니다.',[
    choice('consult','과제 피드백을 읽는다','놓쳤던 평가 기준 하나를 확인했습니다.',{skills:{research:2}},'term:review'),
    choice('balance','학기 계획이 무리였는지 살핀다','다음에는 쉬는 시간을 조금 더 남겨 두기로 했습니다.',{vitals:{stress:-6}},'term:balance')]],
  gradEval:['연구 성과 평가','모든 가설이 증명됐는지보다 무엇을 확인했는지 묻는 자리입니다.',[
    choice('record','근거와 제한점을 정리한다','다음에 검증할 질문을 포함해 결과를 기록했습니다.',{skills:{research:4}},'research:9'),
    choice('colleague','동료에게 분석을 점검해 달라고 한다','빠뜨린 변수를 찾고 검토 내용을 남겼습니다.',{skills:{science:3},relationship:{id:'sol',affinity:3,trust:4}},'research:7')]],
}

export function fixedEvent(life: Life, id: string): Event | undefined {
  if (milestones[id]) return milestones[id]
  if (id in routine) {
    const [title,description,choices] = routine[id]
    const current = id==='grades' ? description+' 현재 학업 성취도는 '+Math.round(life.vitals.grades)+'점입니다.' : description
    return {...fixed(id,title,current,artFor(life),choices,['termEval','gradEval'].includes(id) ? 2 : 1),repeat:true}
  }
  switch (id) {
    case 'admission': return fixed(id,'대학 입시 결과','지원 가능 지수 '+Math.round(life.admission ?? 0)+'점 · 학생부와 활동 기록'+(life.exam===undefined ? '을 반영했습니다. 수능 성적은 없습니다.' : ', 수능 '+life.exam+'점을 반영했습니다.')+(life.admission!>=balance.collegeMin ? ' 지원 가능한 전공을 졸업 뒤 확인할 수 있습니다.' : ' 올해 개설된 대학 전형의 기준에 미치지 못했습니다.'),'library',[
      choice('consider','진학 경로와 지원 기준을 살펴본다','현재 가능한 전공과 준비해 온 활동을 비교했습니다.',{skills:{people:2}}),
      choice('work','채용과 실무 경로를 다시 살펴본다','졸업 뒤 바로 일할 때 필요한 조건을 확인했습니다.',{skills:{business:3}}),
    ],5)
    case 'collegeGate': return fixed(id,'졸업 뒤 첫 선택','지금 취업할 수도 있고, 자격을 충족한 대학 전공에 진학할 수도 있습니다.','classroom',[
      ...Object.keys(majors).map(key=>{
        const field = key as Field
        return {...choice(field,majors[field].title+' 진학 · '+majors[field].minimum+'점 이상','합격이 확인된 전공에 등록하기로 했습니다.',{vitals:{mood:4}},'college:'+field),
          when:(current:Life)=>(current.admission ?? 0)>=majors[field].minimum}
      }),
      choice('direct','대학에 진학하지 않고 일자리를 알아본다','학교 밖에서 경험을 쌓기 위해 준비했습니다.',{skills:{business:3}},'direct:high'),
    ],5)
    case 'major': return fixed(id,'전공을 고르는 날','지원할 때 선택한 전공입니다. 입학 후 전공을 확정하면 활동에 전공 숙련도가 반영됩니다.','campus',
      fieldChoices('major',life.major ? [life.major] : undefined),5)
    case 'collegeReview': return fixed(id,'졸업 요건 심사','이수 '+life.credits+'학점 · 기준 '+balance.creditMinimum+'학점 · 평점 '+life.gpa.toFixed(2)+' / 4.50'+(life.credits>=balance.creditMinimum?' · 수료 기준을 충족했습니다.':' · 졸업 전 보충 이수가 필요합니다.'),'campus',[
      life.credits>=balance.creditMinimum ? choice('confirm','학점과 과제 기록을 확인한다','이수 내역을 확인하고 졸업 심사를 마쳤습니다.',{stats:{diligence:1}})
        : choice('extra','계절 수업에서 남은 학점을 이수한다','필요한 학점을 마저 채워 졸업 심사를 마쳤습니다.',{vitals:{stress:5}},'credits:'+Math.max(0,balance.creditMinimum-life.credits)),
    ],5)
    case 'gradGate': return fixed(id,'한 걸음 더 공부한다면','대학원 지원 지수 '+(life.graduateAdmission ?? 0)+'점 · 기준 '+balance.graduateAdmission+'점. 평점, 전공 활동, 연구 숙련도와 지도 교수의 신뢰를 반영했습니다.','campus',[
      {...choice('grad','대학원 연구 과정에 진학한다','연구 과정에 지원했습니다.',{skills:{research:2}},'graduate:apply'),when:current=>(current.graduateAdmission ?? 0)>=balance.graduateAdmission},
      choice('direct','대학을 마치고 일자리를 알아본다','지금까지 쌓은 전공 경험을 일에 연결해 보기로 했습니다.',{skills:{business:3}},'direct:college'),
    ],5)
    case 'researchField': return fixed(id,'답보다 먼저 고르는 질문','연구를 이어갈 분야와 주제를 정합니다. 학부 전공에서 이어가거나 가까운 새 주제를 선택할 수 있습니다.','lab',fieldChoices('researchField'),5)
    case 'thesis': return fixed(id,'논문과 학위 심사','연구 진행도 '+life.research+'점 · 기준 '+balance.thesisMinimum+'점. 심사에서 근거와 재현 가능성을 확인합니다.','lab',[
      life.research>=balance.thesisMinimum ? choice('defend','자료를 정리해 논문을 심사받는다','검토와 답변을 마치고 학위 요건을 충족했습니다.',{skills:{research:4},flag:'thesis'})
        : choice('revise','추가 검증을 거쳐 논문을 보완한다','부족했던 근거를 다시 확인해 학위 요건을 채웠습니다.',{vitals:{stress:7},flag:'thesis'},'research:'+(balance.thesisMinimum-life.research))
    ],5)
    case 'professional': {
      const options = careers.filter(career=>career.track && meetCareer(life, career, false))
      if (!options.length) return undefined
      return fixed(id,'전문 진로를 위한 다음 준비','일부 진로에는 별도 교육·자격 심사 또는 채용 과정이 필요합니다. 준비할 경로를 고를 수 있습니다.','street',[
        ...options.map(career=>choice(career.id,career.track!+' 과정 이수','필요한 교육과 자격 심사 또는 채용 절차를 통과하는 과정까지 밟았습니다.',{flag:'qualified:'+career.id},'qualify:'+career.id)),
        choice('skip','현재 자격으로 일을 알아본다','지금 지원할 수 있는 일부터 확인하기로 했습니다.',{stats:{resilience:1}}),
      ],5)
    }
  }
}
