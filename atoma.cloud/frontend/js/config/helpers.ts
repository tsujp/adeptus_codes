import { AuthAction } from 'src/types'

const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID ?? ''
const XBOX_CLIENT_ID = process.env.REACT_APP_XBOX_CLIENT_ID ?? ''

function createRedirectURL(): string {
    return window.location.origin + '/linking'
}

export function createSteamURL(action: AuthAction): string {
    let url = 'https://steamcommunity.com/openid/login'
    url += '?openid.mode=checkid_setup'
    url += '&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0'
    url += '&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select'
    url += '&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select'
    url += `&openid.assoc_handle=steam_${action}`
    url += `&openid.return_to=${createRedirectURL()}`

    return url
}

export function createTwitchURL(action: AuthAction): string {
    let url = 'https://id.twitch.tv/oauth2/authorize'
    url += `?client_id=${TWITCH_CLIENT_ID}`
    url += `&redirect_uri=${createRedirectURL()}`
    url += '&response_type=code'
    url += `&state=twitch_${action}`

    return url
}

export function createXboxURL(action: AuthAction): string {
    let url = 'https://login.live.com/oauth20_authorize.srf'
    url += `?client_id=${XBOX_CLIENT_ID}`
    url += `&redirect_uri=${createRedirectURL()}`
    url += '&response_type=code'
    url += `&state=xbox_${action}`
    url += '&approval_prompt=auto'
    url += '&scope=Xboxlive.signin Xboxlive.offline_access'

    return url
}
