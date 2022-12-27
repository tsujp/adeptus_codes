import React from 'react'
import { createSteamURL } from 'src/config'
import { LoadingScreen } from 'src/components'

const SteamLogin: React.FC = () => {
    React.useEffect(() => {
        window.location.replace(createSteamURL('login'))
    }, [])

    return <LoadingScreen />
}

export default SteamLogin
