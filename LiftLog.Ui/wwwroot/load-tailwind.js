import {tw} from './tailwind.js'

fetch('/_content/LiftLog.Ui/twconf.json').then(async (configRes) => {
    const config = await configRes.json()
    tw()
    tailwind.config = config
})
