import { artSource } from '../data/art'
import { calendar } from '../game/config'
import type { Save } from '../game/types'

export type Archive = 'collection'|'achievements'|'history'|'settings'
export function Home({base,save,start,resume,open}:{base:string;save:Save;start:()=>void;resume:()=>void;open:(page:Archive)=>void}) {
  const tiles = [
    {page:'collection',title:'엔딩 도감'},
    {page:'achievements',title:'업적'},
    {page:'history',title:'인생 기록'},
    {page:'settings',title:'설정'},
  ] as const
  return <div className="lu-home">
    <section className="lu-hero" style={{backgroundImage:'url("'+artSource(base,'backgrounds/menu.jpg')+'")'}}>
      <div className="lu-hero-content">
        <div className="lu-hero-actions">
          <button className="lu-button lu-primary" onClick={start}>새 게임</button>
          <button className="lu-button lu-hero-secondary" onClick={resume} disabled={!save.life}>이어하기</button>
        </div>
        {save.life && <p className="lu-hero-save">{save.life.number}회차 · {save.life.career ? '완료된 인생' : calendar(save.life).label}</p>}
      </div>
    </section>
    <nav className="lu-home-links" aria-label="게임 메뉴">{tiles.map(({page,title})=>
      <button key={page} onClick={()=>open(page)} className="lu-home-link">{title}</button>)}</nav>
  </div>
}
