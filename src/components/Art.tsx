import { useState } from 'react'
import { artSource, eventArt, portraitArt, sceneArt } from '../data/art'
import type { Art as ArtId, Gender, Stage } from '../game/types'

export function Picture({base,path,fallback,alt='',className='',scene='classroom'}:{
  base:string;path:string;fallback?:string;alt?:string;className?:string;scene?:ArtId
}) {
  const [failed,setFailed] = useState<string[]>([])
  const paths = [path,fallback].filter((entry): entry is string=>Boolean(entry && !failed.includes(entry)))
  const source = paths[0]
  return <div className={'lu-picture lu-scene-'+scene+' '+className}>
    {source ? <img src={artSource(base,source)} alt={alt} onError={()=>setFailed(previous=>[...previous,source])} />
      : <div className="lu-fallback" role={alt?'img':undefined} aria-label={alt||undefined}><i/><b/><span/></div>}
  </div>
}

export function Scene({base,scene,id,gender,stage}:{base:string;scene:ArtId;id:string;gender:Gender;stage:Stage}) {
  const override = eventArt[id]
  return <div className="lu-event-art">
    <Picture base={base} path={override?.path ?? sceneArt[scene]} fallback={sceneArt[scene]} scene={scene}/>
    {override?.character && <Picture base={base} path={portraitArt(gender,stage)} className="lu-art-portrait" alt="주인공"/>}
  </div>
}
