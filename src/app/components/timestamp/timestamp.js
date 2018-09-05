
import './timestamp.less'

import moment from 'moment'

const UPDATE_INTERVAL_UPDATE = 15000

app.component('timestamp', {
  template: require('./timestamp.jade')(),
  bindings: {
    data: '<',
  },
  controller: class timestamp {
    constructor ($scope, $timeout) {
      this.$timeout = $timeout

      $scope.$watch('$ctrl.data', this.update.bind(this))
    }

    $onDestroy () {
      this.$timeout.cancel(this.timeout)
    }

    update () {
      this.$timeout.cancel(this.timeout)

      let obj = moment(this.fix(this.data))
      this.full = obj.format('LL LTS')
      this.time_ago = obj.fromNow(true)

      this.timeout = this.$timeout(this.update.bind(this), UPDATE_INTERVAL_UPDATE)
    }

    fix (value) {
      return new Date((((Date.UTC(2017,2,21,13,0,0,0) / 1000) + value) * 1000))
    }
  }
})
