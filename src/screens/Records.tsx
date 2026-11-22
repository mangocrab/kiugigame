import { ArrowLeft, BookOpen, BriefcaseBusiness, CalendarDays, Check, Heart, History, LockKeyhole, Settings2, Sparkles, Trophy } from 'lucide-react'
import { Picture } from '../components/Art'
import { Empty, SectionHead, TimeLabel } from '../components/ui'
import { achievements } from '../data/achievements'
import { endingArt } from '../data/art'
import { careerById, careers } from '../data/careers'
import { fieldNames, majors } from '../game/config'
import { educationNames, importantBonds } from '../game/journal'
import type { Run, Save, Settings } from '../game/types'
import { LogList, StatGrid, TraitList } from './Simulation'

const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR')
export function Collection({base,runs,detail,select}:{base:string;runs:Run[];detail:string|null;select:(id:string|null)=>void}) {
  const found = new Set(runs.map(run=>run.career))
  const current = detail && careerById(detail)
  const matches = runs.filter(run=>run.career===detail)
  if (current && matches.length) return <section className="lu-archive lu-narrow">
    <button className="lu-plain lu-back" onClick={()=>select(null)}><ArrowLeft size={17}/> 엔딩 도감</button>
    <SectionHead tag={fieldNames[current.field]+' · 발견한 엔딩'} title={current.title} sub={current.description}/>
    <Picture className="lu-record-art" base={base} path={endingArt(current.art)} fallback="backgrounds/street.jpg"/>
    <div className="lu-panel lu-record-box"><h2>최초 발견 기록</h2><p>{matches.at(-1)?.number}회차 · {formatDate(matches.at(-1)!.date)} · 총 {matches.length}회 달성</p><p>{matches.at(-1)?.story.at(-1)}</p></div>
  </section>
  return <section className="lu-archive">
    <SectionHead tag="엔딩 도감" title="어떤 미래를 만났나요?" sub={found.size+' / '+careers.length+'개 직업을 발견했어요.'} icon="book"/>
    <div className="lu-collection-grid">{careers.map(career=>{
      const count = runs.filter(run=>run.career===career.id).length
      const children = <><div className="lu-collection-visual">{count?<Picture base={base} path={endingArt(career.art)} fallback="backgrounds/street.jpg"/>:<LockKeyhole size={25}/>}</div>
        <div className="lu-collection-copy"><small>{fieldNames[career.field]}</small><strong>{count?career.title:'미발견 직업'}</strong>{count>0 && <span>{count}회 달성</span>}</div></>
      return count ? <button className="lu-collection-card" key={career.id} onClick={()=>select(career.id)}>{children}</button> :
        <div className="lu-collection-card lu-locked" key={career.id}>{children}</div>
    })}</div>
  </section>
}

export function Achievements({save}:{save:Save}) {
  const count = Object.keys(save.profile.achievements).length
  return <section className="lu-archive">
    <SectionHead tag="업적" title="선택이 남긴 발자취" sub={count+' / '+achievements.length+'개 업적을 달성했어요.'}/>
    <div className="lu-archive-progress"><i style={{width:100*count/achievements.length+'%'}}/></div>
    <div className="lu-achievements-grid">{achievements.map(achievement=>{
      const unlocked = save.profile.achievements[achievement.id]
      return <article className={'lu-panel lu-achievement '+(unlocked?'lu-unlocked':'')} key={achievement.id}>
        <span className="lu-award-icon">{unlocked?<Trophy size={22}/>:<LockKeyhole size={20}/>}</span><div>
          <h2>{achievement.title}</h2><p>{achievement.description}</p>{unlocked && <small>{formatDate(unlocked)} 달성</small>}
        </div>{unlocked && <Check className="lu-award-check" size={18}/>}
      </article>
    })}</div>
  </section>
}

export function HistoryList({runs,select}:{runs:Run[];select:(id:string)=>void}) {
  return <section className="lu-archive lu-narrow">
    <SectionHead tag="인생 기록" title="살아온 이야기들" icon="book" sub="완료한 회차의 선택과 기억을 다시 펼쳐 보세요."/>
    {runs.length ? <div className="lu-history-list">{runs.map(run=><button key={run.id} className="lu-panel" onClick={()=>select(run.id)}>
      <span className="lu-award-icon"><History size={21}/></span><div><small>{run.number}회차 · {formatDate(run.date)}</small><strong>{careerById(run.career)?.title}</strong><p>{run.age}세 · {educationNames[run.education]}</p></div>
      <span>기록 보기</span>
    </button>)}</div> : <Empty>아직 완료한 인생이 없어요. 직업 엔딩을 고르면 이곳에 기록됩니다.</Empty>}
  </section>
}

export function RunStory({base,run,back,newGame,returnHome}:{base:string;run:Run;back?:()=>void;newGame?:()=>void;returnHome?:()=>void}) {
  const career = careerById(run.career)
  const bonds = importantBonds(run.relationships)
  return <section className="lu-archive lu-narrow lu-ending">
    {back&&<button className="lu-plain lu-back" onClick={back}><ArrowLeft size={16}/> 인생 기록</button>}
    <SectionHead tag={back?run.number+'회차 · 인생 기록':'새로운 직업 엔딩'} title={career?.title ?? '직업 엔딩'} sub={career?.description}/>
    <div className="lu-ending-art"><Picture base={base} path={endingArt(career?.art ?? 'practical')} fallback="backgrounds/street.jpg" className="lu-record-art"/><TimeLabel>{run.age}세 · {educationNames[run.education]}</TimeLabel></div>
    <div className="lu-panel lu-record-box"><div className="lu-row-head"><h2><BookOpen size={20}/> 당신이 살아온 이야기</h2><span>{run.number}회차</span></div>
      {run.story.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
    </div>
    <div className="lu-ending-grid">
      <div className="lu-panel lu-record-box"><h2><BriefcaseBusiness size={19}/> 마지막 모습</h2>
        <p>{run.gender==='male'?'남성 주인공':'여성 주인공'} · {run.age}세</p>
        <p>{educationNames[run.education]}{run.major?' · '+majors[run.major].title:''}</p><StatGrid stats={run.stats}/>
      </div>
      <div className="lu-panel lu-record-box"><h2><Heart size={19}/> 함께한 사람들</h2>
        {bonds.slice(0,5).map(({npc,bond})=><div className="lu-ending-bond" key={npc.id}><b>{npc.name}</b><span>친밀도 {bond.affinity} · 신뢰 {bond.trust}</span></div>)}
        <h2><Sparkles size={18}/> 지나온 시간의 특성</h2><TraitList innate={run.innate} acquired={run.acquired}/>
      </div>
    </div>
    <div className="lu-panel lu-record-box"><h2><CalendarDays size={19}/> 인생의 전환점</h2><LogList logs={run.log.filter(log=>log.important)} limit={run.log.length}/>
      <details className="lu-full-log"><summary>전체 사건 기록 펼치기</summary><LogList logs={run.log} limit={run.log.length}/></details>
    </div>
    <div className="lu-panel lu-record-box"><h2><Trophy size={19}/> 도감과 업적</h2><p>엔딩 도감에 {career?.title} 달성이 저장됐습니다.</p>
      <div className="lu-tag-list">{run.achievements.length ? run.achievements.map(id=><span className="lu-tag" key={id}>{achievements.find(item=>item.id===id)?.title ?? id}</span>) : <p>이 회차에서 새로 달성한 업적이 없습니다.</p>}</div>
    </div>
    {newGame && <div className="lu-setup-actions"><button className="lu-button lu-secondary" onClick={returnHome}>메인 메뉴</button><button className="lu-button lu-primary" onClick={newGame}><Sparkles size={18}/> 새 게임</button></div>}
  </section>
}

export function SettingsScreen({settings,change}:{settings:Settings;change:(settings:Settings)=>void}) {
  return <section className="lu-archive lu-narrow">
    <SectionHead tag="설정" title="편안한 플레이" sub="읽기 편한 화면을 고를 수 있어요."/>
    <div className="lu-panel lu-settings"><Settings2 size={22}/>
      <label><span><strong>글자 크기</strong><small>이야기와 생활 활동의 본문 크기를 조절합니다.</small></span>
        <select value={settings.text} onChange={event=>change({...settings,text:event.currentTarget.value as Settings['text']})}><option value="normal">기본</option><option value="large">크게</option></select></label>
      <label><span><strong>화면 전환 효과</strong><small>화면이 나타날 때 짧은 애니메이션을 사용합니다.</small></span>
        <input type="checkbox" checked={settings.motion} onChange={event=>change({...settings,motion:event.currentTarget.checked})}/></label>
    </div>
  </section>
}
