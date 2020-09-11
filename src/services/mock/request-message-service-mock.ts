/* eslint-disable @typescript-eslint/camelcase */
import { createLogger } from '@/helpers/logger'
import { RequestMessageServiceBase } from '../request-message-service'
import { sleep } from '@/helpers/util'
const logger = createLogger('request-message-service-mock.ts')

export default class RequestMessageServiceMock
  implements RequestMessageServiceBase {
  getText(url: string, options?: RequestInit) {
    logger.debug('getText', url, options)
    return Promise.resolve('')
  }

  getJson<T>(url: string, options?: RequestInit) {
    logger.debug('getJson', url, options)
    return Promise.resolve({} as T)
  }

  async getDict(word: string) {
    logger.debug('getJson', word)
    await sleep(1000)
    return Promise.resolve({
      definitions: [
        {
          type: 'noun',
          definition:
            '(in some sports) an official who watches a game or match closely to enforce the rules and arbitrate on matters arising from the play.',
          example:
            'the crowd were clamouring for the umpire to reverse the decision',
          image_url: null,
          emoji: null,
        },
        {
          type: 'verb',
          definition: 'act as an umpire in a game or match.',
          example: 'he could be seen regularly umpiring for the club',
          image_url: null,
          emoji: null,
        },
      ],
      word,
      pronunciation: 'ˈəmˌpī(ə)r',
    })
  }
}
