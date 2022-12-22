import ky from 'ky'
import { createHTTPClient } from 'src/config'
import { delay } from 'src/utils'
import {
    AccountData,
    AccountNameResponse,
    AccountSummaryResponse,
    AuthData,
    CharacterExportResponse,
    DeleteEmailArgs,
    GetUserArgs,
    JoinQueueArgs,
    LinkingStartArgs,
    LinkingStartResponse,
    PollQueueArgs,
    PostCharacterExportArgs,
    PostMarketingPreferencesArgs,
    PostRegistrationArgs,
    PutAccountLinkingArgs,
    PutAccountNameArgs,
    PutEmailArgs,
    QueueResponse,
    ReAuthenticateArgs,
    RedeemCodeArgs,
    RedeemCodeResponse,
    SignInArgs,
    UnlinkPlatformAccountArgs
} from 'src/types'

function voidResponse(client: typeof ky): typeof ky {
    return client.extend({
        hooks: {
            afterResponse: [
                (_request, _options, response) => {
                    if (response.ok) {
                        return new Response(
                            new Blob([JSON.stringify({ success: true })], {
                                type: 'application/json'
                            }),
                            { status: 200 }
                        )
                    }
                }
            ]
        }
    })
}

async function pollQueue({ queueResponse, mounted, next }: PollQueueArgs): Promise<void> {
    let queueTicket: string | undefined = queueResponse.queueTicket
    let pollInterval: number | undefined = queueResponse.retrySuggestion
    let authData: AuthData | undefined = undefined
    let error: boolean = false

    async function poll(): Promise<void> {
        const client = createHTTPClient('authApi', `Bearer ${queueTicket}`)

        await client
            .get('queue/check')
            .json<QueueResponse>()
            .then((response) => {
                if ('AccessToken' in response) {
                    authData = {
                        AccessToken: response.AccessToken,
                        RefreshToken: response.RefreshToken,
                        ExpiresIn: response.ExpiresIn,
                        Sub: response.Sub,
                        AccountName: response.AccountName
                    }
                }

                queueTicket = response.queueTicket
                pollInterval = response.retrySuggestion
            })
            .catch(() => {
                error = true
            })
    }

    while (!error && mounted && queueTicket && pollInterval) {
        await delay(pollInterval)
        await poll()
    }

    if (mounted) {
        next({ error, data: authData })
    }
}

async function joinQueue({ authorizationHeader, mounted, next }: JoinQueueArgs): Promise<void> {
    let queueResponse: QueueResponse | undefined = undefined
    let error: boolean = false

    const client = createHTTPClient('authApi', authorizationHeader)

    await client
        .get('queue/join')
        .json<QueueResponse>()
        .then((response) => {
            queueResponse = response
        })
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: queueResponse })
    }
}

export async function signIn({ authorizationHeader, mounted, next }: SignInArgs): Promise<void> {
    await joinQueue({
        authorizationHeader,
        mounted,
        next: async ({ error, data }) => {
            if (data && !error) {
                await pollQueue({
                    queueResponse: data,
                    mounted,
                    next
                })
            } else {
                next({ error, data })
            }
        }
    })
}

export async function reAuthenticate({
    refreshToken,
    mounted,
    next
}: ReAuthenticateArgs): Promise<void> {
    let authData: AuthData | undefined = undefined
    let error: boolean = false

    const client = createHTTPClient('authApi', `Bearer ${refreshToken}`)

    await client
        .get('queue/refresh')
        .json<AuthData>()
        .then((response) => {
            authData = response
        })
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: authData })
    }
}

export async function getUser({ sub, accessToken, mounted, next }: GetUserArgs): Promise<void> {
    let accountData: AccountData | undefined = undefined
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await client
        .get(`web/${sub}/summary`)
        .json<AccountSummaryResponse>()
        .then(({ _links, ...rest }) => {
            accountData = { sub, accessToken, ...rest }
        })
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: accountData })
    }
}

export async function postCharacterExport({
    sub,
    accessToken,
    characterId,
    mounted,
    next
}: PostCharacterExportArgs): Promise<void> {
    let token: CharacterExportResponse = undefined
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await client
        .post(`data/${sub}/characters/${characterId}/createexport`)
        .json<CharacterExportResponse>()
        .then((response) => {
            token = response
        })
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: token })
    }
}

export async function putEmail({
    sub,
    accessToken,
    email,
    mounted,
    next
}: PutEmailArgs): Promise<void> {
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await voidResponse(client)
        .put(`linking/accounts/${sub}/email`, { json: { email } })
        .json<{}>()
        .then(() => {})
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: {} })
    }
}

export async function deleteEmail({
    sub,
    accessToken,
    mounted,
    next
}: DeleteEmailArgs): Promise<void> {
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await voidResponse(client)
        .delete(`linking/accounts/${sub}/email`)
        .json<{}>()
        .then(() => {})
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: {} })
    }
}

export async function postMarketingPreferences({
    sub,
    accessToken,
    data,
    mounted,
    next
}: PostMarketingPreferencesArgs): Promise<void> {
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await voidResponse(client)
        .post(`web/${sub}/marketing`, { json: data })
        .json<{}>()
        .then(() => {})
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: {} })
    }
}

export async function postRegistration({
    sub,
    accessToken,
    data,
    mounted,
    next
}: PostRegistrationArgs): Promise<void> {
    let accountData: AccountData | undefined = undefined
    let error: boolean = false

    const { email, ...rest } = data

    if (email) {
        await putEmail({
            sub,
            accessToken,
            email,
            mounted,
            next: (response) => {
                if (response.error) {
                    error = true
                }
            }
        })
    }

    if (!error) {
        await postMarketingPreferences({
            sub,
            accessToken,
            data: rest,
            mounted,
            next: (response) => {
                if (response.error) {
                    error = true
                }
            }
        })
    }

    if (!error) {
        await getUser({
            sub,
            accessToken,
            mounted,
            next: (response) => {
                if (response.error || !response.data) {
                    error = true
                } else {
                    accountData = response.data
                }
            }
        })
    }

    if (mounted) {
        next({ error, data: accountData })
    }
}

export async function putAccountName({
    sub,
    accessToken,
    name,
    mounted,
    next
}: PutAccountNameArgs): Promise<void> {
    let accountName: AccountNameResponse | undefined = undefined
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await client
        .put(`data/${sub}/account/name/${name}`)
        .json<AccountNameResponse>()
        .then((response) => {
            accountName = response
        })
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: accountName })
    }
}

export async function linkingStart({
    token,
    platform,
    mounted,
    next
}: LinkingStartArgs): Promise<void> {
    let loginResponse: LinkingStartResponse | undefined = undefined
    let errorCode: number | undefined = undefined
    let error: boolean = false

    const client = createHTTPClient('titleApi')

    await client
        .get(`linking/start?token=${token}&platform=${platform}`)
        .json<LinkingStartResponse>()
        .then((response) => {
            loginResponse = response
        })
        .catch((err) => {
            errorCode = err?.response?.status
            error = true
        })

    if (mounted) {
        next({ error, data: loginResponse, errorCode })
    }
}

export async function putAccountLinking({
    sub,
    accessToken,
    linkingToken,
    mounted,
    next
}: PutAccountLinkingArgs): Promise<void> {
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await voidResponse(client)
        .put(`linking/accounts/${sub}`, { json: { linkingToken } })
        .json<{}>()
        .then(() => {})
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: {} })
    }
}

export async function unlinkPlatformAccount({
    sub,
    accessToken,
    platform,
    platformId,
    mounted,
    next
}: UnlinkPlatformAccountArgs): Promise<void> {
    let error: boolean = false

    const client = createHTTPClient('titleApi', `Bearer ${accessToken}`)

    await voidResponse(client)
        .delete(`linking/accounts/${sub}/${platform}/${platformId}`)
        .json<{}>()
        .then(() => {})
        .catch(() => {
            error = true
        })

    if (mounted) {
        next({ error, data: {} })
    }
}

export async function redeemCode({
    sub,
    accessToken,
    keyId,
    mounted,
    next
}: RedeemCodeArgs): Promise<void> {
    let redeemResponse: RedeemCodeResponse | undefined = undefined
    let errorCode: number | undefined = undefined
    let error: boolean = false

    const client = createHTTPClient('storeApi', `Bearer ${accessToken}`).extend({
        hooks: {
            afterResponse: [
                (_request, _options, response) => {
                    if (response.status === 202) {
                        return new Response(
                            new Blob([JSON.stringify({})], {
                                type: 'application/json'
                            }),
                            { status: 409 }
                        )
                    } else {
                        return response
                    }
                }
            ]
        }
    })

    await client
        .post(`store/golden-keys/${sub}/redemptions/${keyId}`)
        .json<RedeemCodeResponse>()
        .then((response) => {
            redeemResponse = response
        })
        .catch((err) => {
            errorCode = err?.response?.status
            error = true
        })

    if (mounted) {
        next({ error, data: redeemResponse, errorCode })
    }
}
