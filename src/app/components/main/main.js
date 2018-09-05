
import './main.less'

const UPDATE_INTERVAL_BALANCE = 5 * 1000 // 5 seconds

app.component('main', {
  template: require('./main.jade')(),
  controller: class main {
    constructor ($scope, $rootScope, $timeout, $q, $peers, error) {
      this.$scope = $scope
      this.$rootScope = $rootScope
      this.$timeout = $timeout
      this.$q = $q
      this.$peers = $peers
      this.error = error

      this.$scope.$on('login', this.login.bind(this))
      this.$scope.$on('peerUpdate', this.update.bind(this))

      $scope.$watch('$ctrl.$peers.active', (peer, old) => {
        if (peer && old) {
          this.$peers.check()
          this.$rootScope.$broadcast('peerUpdate')
        }
      })

      this.clientVersion = require('../../../../package.json').version
    }

    reset () {
      this.$timeout.cancel(this.timeout)
    }

    login (attempts = 0) {
      this.prelogged = true

      this.$peers.setActive()

      this.update()
        .then(() => {
          this.prelogged = false
          this.logged = true
        })
        .catch((res) => {
          if (attempts < 10) {
            this.$timeout(() => this.login(++attempts), 1000)
          } else {
            this.error.dialog({ text: 'No peer connection' })
            this.logout()
          }
        })
    }

    logout () {
      this.reset()
      this.$peers.reset(true)

      this.logged = false
      this.prelogged = false
      this.account = {}
      this.address = ''
    }

    update () {
      this.reset()

      return this.$peers.active.getAccount(this.address)
        .then(res => {
          this.account = res
        })
        .catch((res) => {
          this.account.balance = undefined
          return this.$q.reject(res)
        })
        .finally(() => {
          this.timeout = this.$timeout(this.update.bind(this), UPDATE_INTERVAL_BALANCE)
          return this.$q.resolve()
        })
    }
  }
})
