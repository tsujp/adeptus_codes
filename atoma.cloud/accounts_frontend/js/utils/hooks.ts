import React from 'react'
import { useLocation } from 'react-router-dom'

type UseURLSearchParams = Omit<URLSearchParams, 'get'> & { get: (param: string) => string }

export function useURLSearchParams(): UseURLSearchParams {
    let params: URLSearchParams = new URLSearchParams()

    if (window.location.hash) {
        params = new URLSearchParams(window.location.hash.substr(1))
    } else if (window.location.search) {
        params = new URLSearchParams(window.location.search)
    }

    function get(param: string): string {
        return params.get(param) ?? ''
    }

    return { ...params, get }
}

type CopyState = {
    status: 'success' | 'error' | 'passive'
    message: string | undefined
}

const initialCopyState: CopyState = {
    status: 'passive',
    message: undefined
}

export function useCopyToClipboard(): [CopyState, (text: string) => Promise<void>, () => void] {
    const [copyState, setCopyState] = React.useState<CopyState>(initialCopyState)

    function copyClear(): void {
        setCopyState(initialCopyState)
    }

    async function copyText(text: string): Promise<void> {
        if (!navigator?.clipboard) {
            setCopyState({
                status: 'error',
                message: 'Clipboard not supported'
            })

            return
        }

        try {
            await navigator.clipboard.writeText(text)
            setCopyState({
                status: 'success',
                message: 'Copied to clipboard'
            })
        } catch (_error) {
            setCopyState({
                status: 'error',
                message: 'Unable to copy to clipboard'
            })
        }
    }

    return [copyState, copyText, copyClear]
}

export function usePath(): string {
    const { pathname } = useLocation()
    return (
        pathname
            .split('/')
            .filter((p) => p)
            .pop() ?? ''
    )
}
