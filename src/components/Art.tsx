import { useState } from 'react'
import { artSource, endingArt, eventArt, portraitArt, sceneArt } from '../data/art'
import { careerEndingArt } from '../data/endingArt'
import type { ImagePanel } from '../data/endingArt'
import type { Art as ArtId, Gender, Stage } from '../game/types'

export function Picture({base,path,fallback,alt='',className='',scene='classroom',panel,loading}:{
  base:string;path:string;fallback?:string;alt?:string;className?:string;scene?:ArtId;panel?:ImagePanel;loading?:'lazy'
}) {
  const [failed,setFailed] = useState<string[]>([])
  const paths = [path,fallback].filter((entry): entry is string=>Boolean(entry && !failed.includes(entry)))
  const source = paths[0]
  const crop = source === path ? panel : undefined
  const picture = source && <img src={artSource(base,source)} alt={alt} loading={loading} onError={()=>setFailed(previous=>[...previous,source])}
    style={crop && {width:100/crop.width+'%', height:100/crop.height+'%', left:-100*crop.left/crop.width+'%', top:-100*crop.top/crop.height+'%'}}/>
  return <div className={'lu-picture lu-scene-'+scene+' '+className}>
    {picture ? crop ? <div className="lu-picture-crop" style={{aspectRatio:crop.aspectRatio}}>{picture}</div> : picture
      : <div className="lu-fallback" role={alt?'img':undefined} aria-label={alt||undefined}><i/><b/><span/></div>}
  </div>
}

export function EndingPicture({base,career,gender,group='practical',className='',alt,loading}:{
  base:string;career:string;gender:Gender;group?:string;className?:string;alt?:string;loading?:'lazy'
}) {
  const custom = careerEndingArt(career,gender)
  const groupPath = endingArt(group)
  return <Picture base={base} path={custom?.path ?? groupPath} panel={custom?.panel} fallback={custom ? groupPath : 'backgrounds/street.jpg'} className={className} alt={alt} loading={loading}/>
}

export function Scene({base,scene,id,gender,stage}:{base:string;scene:ArtId;id:string;gender:Gender;stage:Stage}) {
  const override = eventArt[id]
  return <div className="lu-event-art">
    <Picture base={base} path={override?.path ?? sceneArt[scene]} fallback={sceneArt[scene]} scene={scene}/>
    {override?.character && <Picture base={base} path={portraitArt(gender,stage)} className="lu-art-portrait" alt="주인공"/>}
  </div>
}
