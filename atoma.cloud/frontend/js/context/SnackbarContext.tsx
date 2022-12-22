import React from 'react'

export interface SnackbarMessage {
    severity: 'info' | 'success' | 'error'
    content: string
}

interface ContextProps {
    open: boolean
    dispatch: (message: SnackbarMessage) => void
    dismiss: () => void
    cleanup: () => void
    message?: SnackbarMessage
}

const initialProps: ContextProps = {
    open: false,
    dispatch: () => {},
    dismiss: () => {},
    cleanup: () => {}
}

const SnackbarContext = React.createContext<ContextProps>(initialProps)

export const SnackbarContextProvider: React.FC = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<Array<SnackbarMessage>>([])
    const [message, setMessage] = React.useState<SnackbarMessage | undefined>(undefined)

    React.useEffect(() => {
        if (messages.length && !message) {
            setMessage({ ...messages[0] })
            setMessages((prev) => prev.slice(1))
            setOpen(true)
        } else if (messages.length && message && open) {
            setOpen(false)
        }
    }, [open, messages, message])

    function dispatch(msg: SnackbarMessage): void {
        setMessages((prev) => [...prev, msg])
    }

    function dismiss(): void {
        setOpen(false)
    }

    function cleanup(): void {
        setMessage(undefined)
    }

    return (
        <SnackbarContext.Provider value={{ open, dispatch, dismiss, cleanup, message }}>
            {children}
        </SnackbarContext.Provider>
    )
}

export function useSnackbarContext(): ContextProps {
    return React.useContext<ContextProps>(SnackbarContext)
}
