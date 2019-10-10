import axios from 'axios'
import * as cleanStack from 'clean-stack'
import * as ip from 'ip'
import * as rax from 'retry-axios'

// init request
const request = axios.create() as any
request.defaults.raxConfig = {instance: request}
request.defaults.headers.common['X-SHA1-APPKEY'] = '53ce9ed1f8631045ca098a0949b0278e72bcc00f' // APP_KEY SHA1加密
request.defaults.headers.common['X-CLIENT-IP'] = ip.address()
rax.attach(request)
// Hubble config
// const serverUrl = 'https://hubble.netease.com/track/s/'
const isDebug = false

const logTrack = msg => {
  isDebug && console.log(msg) // tslint:disable-line
}

// tslint:disable-next-line:no-unused
export const uploadHubble = (opt = {}) => {
}

export function TStart(target, key, descriptor) {
  return {...descriptor,
    async value(...params) {
      try {
        logTrack(`\n开始执行----->: ${key} in ${target.constructor.name}\n`)
        uploadHubble({executor: `${key} in ${target.constructor.name}`})
        await descriptor.value.apply(this, params)
      } catch (err) {
        throw Error(err)
      }
    }}
}

export const TError = (params: any = {}) => {
  return (target, key, descriptor) => {
    // if(descriptor === undefined) {
    //     descriptor = Object.getOwnPropertyDescriptor(target, key);
    // }
    const oldValue = descriptor.value
    descriptor.value = async function (...args) {
      try {
        const result = await oldValue.apply(this, args)
        logTrack(`完成执行${key} in ${target.constructor.name}----->: ${result || '无返回结果'}`)
        await uploadHubble({executor: `${key} in ${target.constructor.name}`, result})
        return result
      } catch (err) {
        logTrack(`\n捕获错误----->: ${key} in ${target.constructor.name}, ${args}`)
        logTrack(`\n步骤${key} in ${target.constructor.name}发生错误: ${cleanStack(err.stack)},
        \n收集上报的额外参数:${JSON.stringify(params)}\n`)
        await uploadHubble({executor: `${key} in ${target.constructor.name}`, errors: String(err)})
        throw Error(err)
      }
    }
    return descriptor
  }
}
