import { BookOpen, ChevronRight, History, Play, Settings2, Sparkles, Trophy } from 'lucide-react'
import { artSource } from '../data/art'
import { calendar } from '../game/config'
import type { Save } from '../game/types'

export type Archive = 'collection'|'achievements'|'history'|'settings'
export function Home({base,save,start,resume,open}:{base:string;save:Save;start:()=>void;resume:()=>void;open:(page:Archive)=>void}) {
  const tiles = [
    {page:'collection',icon:BookOpen,title:'엔딩 도감',text:'발견한 직업과 아직 모르는 미래'},
    {page:'achievements',icon:Trophy,title:'업적',text:'선택으로 남긴 작은 발자취'},
    {page:'history',icon:History,title:'인생 기록',text:'지금까지 살아온 이야기'},
    {page:'settings',icon:Settings2,title:'설정',text:'글자 크기와 화면 효과'},
  ] as const
  return <div className="lu-home">
    <section className="lu-hero" style={{backgroundImage:'url("'+artSource(base,'backgrounds/menu.jpg')+'")'}}>
      <div className="lu-hero-content">
        <span className="lu-hero-chip"><Sparkles size={15}/> 선택형 인생 시뮬레이션</span>
        <h1>인생미정<span>.</span></h1>
        <p className="lu-hero-tagline">당신의 미래는<br className="lu-mobile-break"/> 아직 정해지지 않았습니다.</p>
        <p className="lu-hero-description">처음 눈을 뜬 날부터 나만의 일을 찾는 날까지.<br/> 오늘의 선택으로 당신의 이야기를 써 내려가세요.</p>
        <div className="lu-hero-actions">
          <button className="lu-button lu-primary" onClick={start}><Sparkles size={18}/> 새 게임</button>
          <button className="lu-button lu-hero-secondary" onClick={resume} disabled={!save.life}><Play size={17}/> 이어하기</button>
        </div>
        {save.life && <p className="lu-hero-save">{save.life.number}회차 · {save.life.career ? '완료된 인생' : calendar(save.life).label}</p>}
      </div>
    </section>
    <nav className="lu-home-links" aria-label="게임 메뉴">{tiles.map(({page,icon:Icon,title,text})=>
      <button key={page} onClick={()=>open(page)} className={'lu-home-link lu-tile-'+page}><span className="lu-tile-icon"><Icon size={22}/></span><span className="lu-tile-copy"><strong>{title}</strong><small>{text}</small></span><ChevronRight size={16} className="lu-tile-chevron"/></button>)}</nav>
    <footer className="lu-footer"><BookOpen size={15}/><span>인생미정</span><span className="lu-footer-dot"/><span>선택으로 쓰는 나의 이야기</span></footer>
  </div>
}
