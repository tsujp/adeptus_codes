import { AuthData, LinkingData } from 'src/types'
import { tryParseJSON } from './helpers'

function getLocalStorage<T>(key: string): T | undefined {
    const encoded = localStorage.getItem(key)
    const decoded = encoded ? tryParseJSON<T>(Buffer.from(encoded, 'base64').toString()) : undefined

    return decoded
}

function setLocalStorage<T>(key: string, data: T): void {
    const encoded = Buffer.from(JSON.stringify(data), 'binary').toString('base64')
    localStorage.setItem(key, encoded)
}

function clearLocalStorage(key: string): void {
    localStorage.removeItem(key)
}

export function getAuthData(): AuthData | undefined {
    return getLocalStorage<AuthData>('user')
}

export function setAuthData(authData: AuthData): void {
    setLocalStorage<AuthData>('user', authData)
}

export function clearAuthData(): void {
    clearLocalStorage('user')
}

export function getLinkingData(): LinkingData | undefined {
    return getLocalStorage('linking')
}

export function setLinkingData(linkingData: LinkingData): void {
    setLocalStorage('linking', linkingData)
}

export function clearLinkingData(): void {
    clearLocalStorage('linking')
}
