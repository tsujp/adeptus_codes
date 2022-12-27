import React from 'react'
import { useHistory } from 'react-router-dom'
import { useAccountContext, useSnackbarContext } from 'src/context'
import { LoadingScreen } from 'src/components'
import { routes } from 'src/config'
import { handleSignIn } from './shared'

const SteamLinkingHandler: React.FC = () => {
    const { replace } = useHistory()
    const { dispatch } = useSnackbarContext()
    const { setAccount, signOut } = useAccountContext()
    const ref = React.useRef<boolean>(true)

    const runAsync = React.useCallback(
        async (mounted: boolean): Promise<void> => {
            await handleSignIn({
                authorizationHeader: `SteamWeb ${window.location.href}`,
                mounted,
                setAccount: (data) => setAccount(data),
                dispatch: (message) => dispatch(message),
                getUserErrorHandle: (message) => signOut({ message, route: 'twitchDrops' }),
                getUserSuccessRedirect: () => replace(routes.twitchDrops),
                signInErrorRedirect: () => replace(routes.twitchDrops)
            })
        },
        [dispatch, replace, setAccount, signOut]
    )

    React.useEffect(() => {
        runAsync(ref.current)

        return () => {
            ref.current = false
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <LoadingScreen title="Signing in" />
}

export default SteamLinkingHandler
