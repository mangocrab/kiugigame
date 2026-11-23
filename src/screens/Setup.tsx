import { ArrowLeft, Check, Leaf, Sparkles, Star } from 'lucide-react'
import { Picture } from '../components/Art'
import { SectionHead } from '../components/ui'
import { activities } from '../data/activities'
import { portraitArt } from '../data/art'
import { fieldNames, rarityNames, stages, statNames } from '../game/config'
import type { Gender, Stat, Trait } from '../game/types'

export function CharacterCreation({base,gender,select,next,back}:{base:string;gender:Gender;select:(gender:Gender)=>void;next:()=>void;back:()=>void}) {
  return <section className="lu-setup">
    <SectionHead title="이야기의 주인공" sub="당신의 이야기를 살아갈 주인공을 선택하세요."/>
    <div className="lu-character-grid">{(['male','female'] as const).map(key=>
      <button key={key} className={'lu-character-card '+(gender===key?'lu-selected':'')} aria-pressed={gender===key} onClick={()=>select(key)}>
        <Picture key={key} base={base} path={portraitArt(key,'high')} alt={key==='male'?'남성 주인공 미리보기':'여성 주인공 미리보기'}/>
        <span>{key==='male'?'남성':'여성'} {gender===key && <Check size={19}/>}</span>
      </button>)}</div>
    <p className="lu-setup-note">능력치와 진로 조건은 성별에 관계없이 같습니다.</p>
    <div className="lu-setup-actions"><button className="lu-button lu-secondary" onClick={back}><ArrowLeft size={17}/> 돌아가기</button><button className="lu-button lu-primary" onClick={next}>특성 선택</button></div>
  </section>
}

export function TraitSelection({selected,cards,pick,back}:{selected:Trait[];cards:Trait[];pick:(trait:Trait)=>void;back:()=>void}) {
  const icons = {common:Leaf,rare:Star,legendary:Sparkles}
  return <section className="lu-setup">
    <SectionHead title="타고난 작은 가능성" sub="세 가지 특성 중 하나를 고르세요. 같은 희귀도를 여러 번 선택할 수 있어요."/>
    <div className="lu-rounds" role="img" aria-label={`특성 선택 ${selected.length+1} / 3`}>{[0,1,2].map(index=><span key={index} className={index<=selected.length?'lu-active':''}/>)}</div>
    <div className="lu-trait-grid">{cards.map(trait=>{
      const Icon = icons[trait.rarity]
      const boosted = activities.filter(activity=>trait.activityRates[activity.id]!==undefined)
      return <article key={trait.id} className={'lu-trait lu-rarity-'+trait.rarity}>
        <div className="lu-trait-icon"><Icon size={26}/></div><div className="lu-rarity-label">{rarityNames[trait.rarity]}</div><h2>{trait.title}</h2><p>{trait.description}</p>
        <ul>
          {Object.entries(trait.initial).map(([key,value])=><li key={key}>{statNames[key as Stat]} +{value}</li>)}
          {boosted.map(activity=><li key={activity.id}>
            {activity.title} 능력·숙련 성장 +{Math.round(trait.activityRates[activity.id]!*100)}%
            {activity.stages[0]!=='early' && ' ('+stages[activity.stages[0]].label+'부터)'}
          </li>)}
          {trait.special ? <li>특수 사건 확률 +{(trait.special*100).toFixed(1)}%p</li> : null}
          {trait.bond ? <li>긍정적 관계 변화 +{trait.bond}</li> : null}
          {trait.field && <li>{fieldNames[trait.field]} 직업 적합도 보정</li>}
        </ul>
        <button className="lu-button lu-secondary" aria-label={`${trait.title} 선택`} onClick={()=>pick(trait)}>선택</button>
      </article>
    })}</div>
    <div className="lu-chosen">{selected.map(trait=><span className={'lu-rarity-'+trait.rarity} key={trait.id}><Check size={15}/>{trait.title}</span>)}</div>
    <button className="lu-plain" onClick={back}><ArrowLeft size={16}/> {selected.length?'이전 선택으로':'주인공 선택으로'}</button>
  </section>
}
