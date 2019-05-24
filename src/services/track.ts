import * as cleanStack from 'clean-stack'
import axios from 'axios'
import * as rax from 'retry-axios'
import * as ip  from 'ip'
import * as osName from 'os-name'

const request = axios.create() as any;
request.defaults.raxConfig = { instance: request }
request.defaults.headers.common['X-SHA1-APPKEY'] = '53ce9ed1f8631045ca098a0949b0278e72bcc00f' // APP_KEY SHA1加密
request.defaults.headers.common['X-CLIENT-IP'] = ip.address()
const interceptorId = rax.attach(request)
const serverUrl = 'https://hubble.netease.com/track/s/'
const appKey = 'MA-AC3D-F6D2C4E407FA'

const uploadHubble = async (info = {}) => {
  const params = {
    userId: 'test-docs',
    dataType: 'ie',
    sdkType: 'server',
    eventId: 'RdeTrack',
    time: (new Date as any).getTime(),
    appKey,
    deviceOs: osName(),
    deviceOsVersion: osName(),
    devicePlatform: osName(),
    attributes: { ...info, ...{ version: 'alpha2' } }
  }
  const data = Buffer.from(JSON.stringify(params)).toString('base64')
  const res = await request({
    method: 'get',
    url: serverUrl,
    params: { data },
    raxConfig: {
      onRetryAttempt: (err) => {
        const cfg = rax.getConfig(err);
        console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
      }
    }
  }).then(res => {
    debugger
    // console.log(res, 3333);
  }).catch(err => {
    console.log(err, 4444);
  })
}

export function TStart(target, key, descriptor) {
  return Object.assign({}, descriptor, {
    value: async function (...params) {
      try {
        console.log(`\n开始执行----->: ${key} in ${target.constructor.name}\n`)
        await uploadHubble({ executor: `${key} in ${target.constructor.name}` });
        await descriptor.value.apply(this, params)
      } catch(err) {
        throw Error(err)
      }
    }
  })
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
        console.log(`完成执行${key} in ${target.constructor.name}----->: ${result || '无返回结果'}`);
        await uploadHubble({ executor: `${key} in ${target.constructor.name}`, result });
        return result
      } catch (err) {
        console.log(`\n捕获错误----->: ${key} in ${target.constructor.name}, ${args}`);
        console.log(`\n步骤${key} in ${target.constructor.name}发生错误: ${cleanStack(err.stack)}, \n收集上报的额外参数:${JSON.stringify(params)}\n`);
        await uploadHubble({ executor: `${key} in ${target.constructor.name}`, errors: String(err) });
        throw Error(err)
      }
    };
    return descriptor
  }
}
