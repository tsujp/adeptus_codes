import React from 'react'
import { useHistory } from 'react-router-dom'
import {
    clearAuthData,
    delay,
    expiryToMillis,
    expiryToTimestamp,
    getAuthData,
    setAuthData
} from 'src/utils'
import { getUser, reAuthenticate } from 'src/transfer'
import { useSnackbarContext } from 'src/context'
import { AccountData, Route } from 'src/types'

interface ContextProps {
    authorized: boolean
    registered: boolean
    account: AccountData | undefined
    setAccount: (data: AccountData) => void
    loading: boolean
    setLoading: (loading: boolean) => void
    signOut: ({ route, message }: { route?: Route; message?: string }) => void
}

const initialProps: ContextProps = {
    authorized: false,
    registered: false,
    account: undefined,
    setAccount: () => {},
    loading: false,
    setLoading: () => {},
    signOut: () => {}
}

const AccountContext = React.createContext<ContextProps>(initialProps)

export const AccountContextProvider: React.FC = ({ children }) => {
    const history = useHistory()
    const { dispatch } = useSnackbarContext()
    const [account, setAccount] = React.useState<AccountData | undefined>(undefined)
    const [loading, setLoading] = React.useState<boolean>(true)
    const ref = React.useRef<boolean>(true)

    const authorized = React.useMemo(
        (): boolean =>
            ['sub', 'accessToken', 'username', 'name', 'discriminator'].every(
                (property) => account && property in account
            ),
        [account]
    )

    const registered = React.useMemo(
        (): boolean => !!account?.marketingPreferences?.termsAgreed,
        [account]
    )

    const signOut = React.useCallback(
        ({ route, message }: { route?: Route; message?: string }): void => {
            clearAuthData()
            setAccount(undefined)

            if (message) {
                dispatch({
                    severity: 'error',
                    content: message
                })
            }

            if (route) {
                history.push(route)
            }
        },
        [dispatch, history]
    )

    const restoreSession = React.useCallback(async (refreshToken: string): Promise<void> => {
        await reAuthenticate({
            refreshToken,
            mounted: ref.current,
            next: async ({ error, data }) => {
                if (data?.Sub && data?.AccessToken && !error) {
                    setAuthData({ ...data, RefreshAt: expiryToTimestamp(data.ExpiresIn) })

                    await getUser({
                        sub: data.Sub,
                        accessToken: data.AccessToken,
                        mounted: ref.current,
                        next: (getUserResponse) => {
                            if (getUserResponse.data && !getUserResponse.error) {
                                setAccount(getUserResponse.data)
                            } else {
                                clearAuthData()
                            }
                        }
                    })
                } else {
                    clearAuthData()
                }
            }
        })
    }, [])

    const keepSessionAlive = React.useCallback(
        async (
            refreshToken: string,
            callback: (timeout: NodeJS.Timeout | null) => void
        ): Promise<void> => {
            await reAuthenticate({
                refreshToken,
                mounted: true,
                next: ({ error, data }) => {
                    if (!error && data?.Sub && data?.RefreshToken && data?.AccessToken) {
                        setAccount((prev) => ({ ...prev!, accessToken: data.AccessToken! }))

                        setAuthData({ ...data, RefreshAt: expiryToTimestamp(data.ExpiresIn) })

                        callback(
                            setTimeout(
                                () => keepSessionAlive(data.RefreshToken as string, callback),
                                expiryToMillis(data.ExpiresIn)
                            )
                        )
                    } else {
                        signOut({ message: 'Session expired' })
                    }
                }
            })
        },
        [signOut]
    )

    React.useEffect(() => {
        const authData = getAuthData()
        let timeout: NodeJS.Timeout | null = null

        async function runAsync(): Promise<void> {
            if (authData?.RefreshToken) {
                if (authorized) {
                    timeout = setTimeout(
                        () =>
                            keepSessionAlive(authData.RefreshToken as string, (t) => (timeout = t)),
                        ((authData.ExpiresIn ?? 1800) - 300) * 1000
                    )
                } else if (authData?.RefreshAt && new Date().getTime() <= authData?.RefreshAt) {
                    await restoreSession(authData.RefreshToken)
                    await delay(500)
                } else {
                    clearAuthData()
                }
            }

            setLoading(false)
        }

        runAsync()

        return () => {
            ref.current = false

            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }, [authorized, keepSessionAlive, restoreSession])

    return (
        <AccountContext.Provider
            value={{
                account,
                authorized,
                registered,
                setAccount: (value) => setAccount(value),
                loading,
                setLoading: (value) => setLoading(value),
                signOut
            }}
        >
            {children}
        </AccountContext.Provider>
    )
}

export function useAccountContext(): ContextProps {
    return React.useContext<ContextProps>(AccountContext)
}
