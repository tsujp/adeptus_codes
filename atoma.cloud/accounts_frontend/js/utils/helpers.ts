import { CharacterData } from 'src/types'

import ogryn from 'src/assets/archetype-ogryn.png'
import psyker from 'src/assets/archetype-psyker.png'
import veteran from 'src/assets/archetype-veteran.png'
import zealot from 'src/assets/archetype-zealot.png'

type Archetype = 'ogryn' | 'psyker' | 'veteran' | 'zealot'

const archetypeIcons: { [K in Archetype]: string } = {
    ogryn,
    psyker,
    veteran,
    zealot
}

export function characterArchetypeIcon(character: CharacterData): string {
    return character.archetype in archetypeIcons
        ? archetypeIcons[character.archetype as Archetype]
        : ''
}

const specializationNames: { [key: string]: string } = {
    ogryn_1: 'Gun Lugger',
    ogryn_2: 'Skullbreaker',
    ogryn_3: 'Unknown',
    psyker_1: 'Unknown',
    psyker_2: 'Psykinetic',
    psyker_3: 'Protectorate',
    veteran_1: 'Unknown',
    veteran_2: 'Sharpshooter',
    veteran_3: 'Squad Leader',
    zealot_1: 'Unknown',
    zealot_2: 'Preacher',
    zealot_3: 'Unknown'
}

export function characterSpecializationName(character: CharacterData): string {
    const specialization = character?.specialization ?? 'Unknown'
    return specialization in specializationNames
        ? specializationNames[specialization]
        : specialization
}

export async function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function tryParseJSON<T>(jsonString: string): T | undefined {
    let parsed: T | undefined

    try {
        parsed = JSON.parse(jsonString)
    } catch (_) {
        parsed = undefined
    }

    return parsed
}

export function expiryToMillis(expiresIn: number | undefined): number {
    return ((expiresIn ?? 1800) - 300) * 1000
}

export function expiryToTimestamp(expiresIn: number | undefined): number {
    return new Date(new Date().getTime() + expiryToMillis(expiresIn)).getTime()
}
