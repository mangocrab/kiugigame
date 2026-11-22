import { createRoot } from 'react-dom/client'
import { LifeGame } from './LifeGame'
import type { LifeGameOptions } from './LifeGame'

export { LifeGame }
export type { LifeGameOptions }
export type { GameStorage } from '../services/storage'

export function mountLifeGame(target: Element, options: LifeGameOptions = {}) {
  const root = createRoot(target)
  root.render(<LifeGame {...options}/>)
  return () => root.unmount()
}
