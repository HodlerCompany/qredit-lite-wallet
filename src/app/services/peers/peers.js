
import _ from 'lodash'

import './peer'

const UPDATE_INTERVAL_CHECK = 10000

app.factory('$peers', ($peer, $timeout) => {
  class $peers {
    constructor () {
      this.stack = {
        official: [
          new $peer({ host: 'api.qredit.cloud', port: null, ssl: false }),
          new $peer({ host: '185.85.18.192', port: 4100, ssl: false }),
        ],
        public: [],
        testnet: [
          // new $peer({ host: '127.0.0.1', port: 4000, ssl: false }),
        ]
      }

      this.check()
    }

    reset (active) {
      $timeout.cancel(this.timeout)

      if (active) {
        this.active = undefined
      }
    }

    setActive () {
      this.active = _.chain([])
        .concat(this.stack.official, this.stack.public)
        .sample()
        .value()

      this.check()
    }

    check () {
      this.reset()

      let next = () => this.timeout = $timeout(this.check.bind(this), UPDATE_INTERVAL_CHECK)

      if (!this.active) {
        return next()
      }

      this.active.status()
        .then(() => this.online = true)
        .catch(() => this.online = false)
        .finally(() => next())
    }
  }

  return new $peers()
})
