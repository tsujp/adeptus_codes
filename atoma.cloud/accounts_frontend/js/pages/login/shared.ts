import { expiryToTimestamp, setAuthData } from 'src/utils'
import { getUser, signIn } from 'src/transfer'
import { SnackbarMessage } from 'src/context'
import { AccountData } from 'src/types'

type HandleSignInArgs = {
    authorizationHeader: string
    mounted: boolean
    setAccount: (data: AccountData) => void
    dispatch: (message: SnackbarMessage) => void
    getUserErrorHandle: (message: string) => void
    getUserSuccessRedirect: () => void
    signInErrorRedirect: () => void
}

export async function handleSignIn({
    authorizationHeader,
    mounted,
    setAccount,
    dispatch,
    getUserErrorHandle,
    getUserSuccessRedirect,
    signInErrorRedirect
}: HandleSignInArgs): Promise<void> {
    await signIn({
        authorizationHeader,
        mounted,
        next: async (signInResponse) => {
            if (
                signInResponse.data?.Sub &&
                signInResponse.data?.AccessToken &&
                !signInResponse.error
            ) {
                setAuthData({
                    ...signInResponse.data,
                    RefreshAt: expiryToTimestamp(signInResponse.data.ExpiresIn)
                })

                await getUser({
                    sub: signInResponse.data.Sub,
                    accessToken: signInResponse.data.AccessToken,
                    mounted,
                    next: async (getUserResponse) => {
                        if (getUserResponse.error || !getUserResponse.data) {
                            getUserErrorHandle('Failed to load account data')
                        } else {
                            setAccount(getUserResponse.data)
                            getUserSuccessRedirect()
                        }
                    }
                })
            } else {
                dispatch({
                    severity: 'error',
                    content: 'Failed to sign in'
                })

                signInErrorRedirect()
            }
        }
    })
}

