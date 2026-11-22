import type { Art, Gender, Stage } from '../game/types'
export const sceneArt: Record<Art,string> = {
  home:'backgrounds/home.jpg',elementary:'backgrounds/elementary.jpg',field:'backgrounds/field.jpg',
  library:'backgrounds/library.jpg',classroom:'backgrounds/classroom.jpg',street:'backgrounds/street.jpg',
  campus:'backgrounds/campus.jpg',lab:'backgrounds/lab.jpg',dream:'backgrounds/dream.jpg',
}
export const eventArt: Partial<Record<string,{ path:string; character?: boolean }>> = {
  highOut:{path:'events/last-bell.jpg'}, 'future-letter':{path:'events/future-letter.jpg'}, csat:{path:'events/csat.jpg'},
  'talent-show':{path:'events/talent-show.jpg'}, 'reading-room':{path:'events/reading-room.jpg'}, 'game-demo':{path:'events/game-demo.jpg'},
  birth:{path:'backgrounds/home.jpg',character:true},
}
export const portraitArt = (gender: Gender, stage: Stage) => 'characters/'+gender+'-'+(['college','graduate'].includes(stage)?'adult':stage)+'.png'
export const endingArt = (id: string) => 'endings/'+id+'.jpg'
export const artSource = (base: string, path: string) => base.replace(/\/?$/,'/')+path
