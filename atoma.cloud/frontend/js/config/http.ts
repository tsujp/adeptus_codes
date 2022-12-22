import ky from 'ky'
import type { HalBasics } from 'code/title/api/api-dto/'

export type WebLoginResponse = HalBasics & {
    AccessToken?: string
    ExpiresIn?: number
    Sub?: string
    AccountName?: string
    LinkingToken?: string
}

type Api = {
    env: string
    service: string
    url: string | undefined
}

type ApiConfig = {
    authApi: Api
    storeApi: Api
    titleApi: Api
}

const apiConfig: ApiConfig = {
    authApi: {
        env: process.env.REACT_APP_ENV_NAME ?? 'dev',
        service: process.env.REACT_APP_AUTH_SERVICE ?? 'auth',
        url: process.env.REACT_APP_ENV_AUTH_API_URL
    },
    storeApi: {
        env: process.env.REACT_APP_ENV_NAME ?? 'dev',
        service: process.env.REACT_APP_STORE_SERVICE ?? 'td',
        url: process.env.REACT_APP_ENV_STORE_API_URL
    },
    titleApi: {
        env: process.env.REACT_APP_ENV_NAME ?? 'dev',
        service: process.env.REACT_APP_TITLE_SERVICE ?? 'td',
        url: process.env.REACT_APP_ENV_TITLE_API_URL
    }
}

const domain: string = process.env.REACT_APP_HOSTED_ZONE_NAME ?? 'fatsharkgames.se'

function createApiUrl(api: keyof ApiConfig): string {
    const { env, service, url } = apiConfig[api]
    return url ?? `https://bsp-${service}-${env}.${domain}`
}

export function createHTTPClient(api: keyof ApiConfig, authorization?: string): typeof ky {
    return ky.create({
        timeout: 20000,
        prefixUrl: createApiUrl(api),
        headers: { 'Content-Type': 'application/json' },
        hooks: authorization
            ? {
                  beforeRequest: [
                      (request: Request) => request.headers.set('Authorization', `${authorization}`)
                  ],
                  beforeRetry: [
                      ({ request }: { request: Request }) =>
                          request.headers.set('Authorization', `${authorization}`)
                  ]
              }
            : undefined
    })
}
