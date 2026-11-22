export type Gender = 'male' | 'female'
export type Stage = 'early' | 'elementary' | 'middle' | 'high' | 'college' | 'graduate'
export type Rarity = 'common' | 'rare' | 'legendary'
export type Stat = 'intelligence' | 'social' | 'fitness' | 'creativity' | 'resilience' | 'diligence' | 'luck'
export type Vitals = 'health' | 'mood' | 'stress' | 'money' | 'grades'
export type Skill = 'language' | 'math' | 'science' | 'code' | 'art' | 'sports' | 'people' | 'business' | 'research' | 'care' | 'craft'
export type Field = 'tech' | 'science' | 'education' | 'health' | 'art' | 'business' | 'public' | 'practical'
export type Education = 'high' | 'college' | 'graduate'
export type Category = '일상' | '학교' | '관계' | '성장' | '경제' | '진로' | '특수' | '고정'
export type Art = 'home' | 'elementary' | 'field' | 'library' | 'classroom' | 'street' | 'campus' | 'lab' | 'dream'
export type RelationshipChange = { id: string; affinity: number; trust: number }
export type Changes = {
  stats?: Partial<Record<Stat, number>>
  vitals?: Partial<Record<Vitals, number>>
  skills?: Partial<Record<Skill, number>>
  relationship?: RelationshipChange | RelationshipChange[]
  flag?: string
  trait?: string
  follows?: string
}
export type Condition = (life: Life) => boolean
export type Choice = { id: string; label: string; result: string; effects?: Changes; when?: Condition; action?: string }
export type Event = {
  id: string; title: string; description: string; category: Category; art: Art;
  choices: Choice[]; importance: number; record: boolean; stages?: Stage[];
  ages?: [number, number]; years?: number[]; weight?: number;
  when?: Condition; after?: string; repeat?: boolean; boosts?: Record<string, number>
}
export type NPC = { id: string; name: string; age: number; role: string; personality: string; goal: string; situation: string; stages: Stage[]; affinity: number; trust: number; values: Category[] }
export type Bond = { affinity: number; trust: number; interactions: string[] }
export type Trait = { id: string; title: string; rarity: Rarity; description: string; initial: Partial<Record<Stat, number>>; activityRates: Partial<Record<string, number>>; special?: number; field?: Field; bond?: number }
export type Acquired = { id: string; title: string; description: string; activity: string; count: number; skill: Skill; rate: number; field?: Field }
export type Activity = { id: string; title: string; description: string; stages: Stage[]; effects: Changes }
export type Career = {
  id: string; title: string; field: Field; description: string; minimum: Education; major?: Field;
  track?: string; skill?: Skill; level?: number; stat?: Stat; statLevel?: number; practice?: number; art: string
}
export type Log = {
  id: string; stage: Stage; tick: number; age: number; period: string; title: string;
  choice: string; result: string; category: Category; important: boolean; record: boolean
}
export type EventKey = { id: string }
export type Outcome = { title: string; text: string; changes: string[] }
export type Life = {
  id: string; number: number; gender: Gender; born: string; seed: number; stage: Stage;
  tick: number; total: number; stats: Record<Stat, number>; vitals: Record<Vitals, number>;
  skills: Record<Skill, number>; innate: string[]; acquired: string[]; counts: Record<string, number>;
  relationships: Record<string, Bond>; flags: string[]; log: Log[]; seen: Record<string, number>;
  queue: EventKey[]; outcome?: Outcome; summary?: Outcome; education: Education | null;
  aspiration?: Field; major?: Field; researchField?: Field; exam?: number; route?: string;
  newAchievements: string[]; pendingStage?: Stage; admission?: number; gpa: number; credits: number; research: number; terms: number;
  graduateAdmission?: number; final: boolean; career?: string
}
export type Run = {
  id: string; number: number; gender: Gender; age: number; career: string; date: string;
  education: Education; major?: Field; stats: Life['stats']; innate: string[]; acquired: string[];
  relationships: Life['relationships']; log: Log[]; story: string[]; achievements: string[]
}
export type Profile = { next: number; runs: Run[]; achievements: Record<string, string>; experienced: string[] }
export type Settings = { motion: boolean; text: 'normal' | 'large' }
export type Save = { version: 1; life: Life | null; profile: Profile; settings: Settings }
