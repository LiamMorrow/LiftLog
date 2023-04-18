
import {tw} from './tailwind.js'
fetch('/twconf.json').then(async (configRes)=>{
    const config = await configRes.json()
    tw()
    tailwind.config = config 
})
