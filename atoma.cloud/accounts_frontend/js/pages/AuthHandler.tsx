import React from 'react'
import { Redirect } from 'react-router-dom'
import { useSnackbarContext } from 'src/context'
import { useURLSearchParams } from 'src/utils'
import { routes } from 'src/config'
import {
    SteamLinkingHandler,
    SteamLoginHandler,
    TwitchLinkingHandler,
    XboxLinkingHandler,
    XboxLoginHandler
} from './login'

const AuthHandler: React.FC = () => {
    const { get } = useURLSearchParams()
    const { dispatch } = useSnackbarContext()
    const action = get('openid.invalidate_handle') || get('state')

    switch (action) {
        case 'steam_login':
            return <SteamLoginHandler />
        case 'xbox_login':
            return <XboxLoginHandler />
        case 'steam_linking':
            return <SteamLinkingHandler />
        case 'twitch_linking':
            return <TwitchLinkingHandler />
        case 'xbox_linking':
            return <XboxLinkingHandler />
        default:
            dispatch({
                severity: 'error',
                content: 'Authentication method not supported'
            })

            return <Redirect to={routes.home} />
    }
}

export default AuthHandler
