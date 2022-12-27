import React from 'react'
import { createSteamURL } from 'src/config'
import { LoadingScreen } from 'src/components'

const SteamLinking: React.FC = () => {
    React.useEffect(() => {
        window.location.replace(createSteamURL('linking'))
    }, [])

    return <LoadingScreen />
}

export default SteamLinking
