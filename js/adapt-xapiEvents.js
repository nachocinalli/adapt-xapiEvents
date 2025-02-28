/* eslint-disable no-undef */
import Adapt from 'core/js/adapt';
import XAPI from 'extensions/adapt-contrib-xapi/js/XAPI';

class XAPIEvents extends Backbone.Controller {
  initialize() {
    this.listenToOnce(Adapt, 'app:dataReady', this.onDataReady);
  }

  onDataReady() {
    const xapiEvents = Adapt.course.get('_xapiEvents');
    if (!xapiEvents?._isEnabled) return;

    this.xapi = XAPI.getInstance();
    this.setupListeners();
  }

  setupListeners() {
    // add listener for any event you want to track

    this.listenTo(Adapt, {
      'pageLevelProgress:percentageCompleteChange': this.onPercentageCompleteChanged,
      'reaction:submitted': this.onReactionSubmitted
    });
  }

  onReactionSubmitted({ feedback, rating }) {
    const statement = {
      actor: this.xapi.get('actor'),
      verb: ADL.verbs.commented,
      object: this.xapi.getCourseActivity(),
      result: {
        response: feedback,
        score: {
          raw: rating
        }
      }
    };
    this.xapi.sendStatement(statement);
  }

  onPercentageCompleteChanged(percentageComplete) {
    const statement = {
      actor: this.xapi.get('actor'),
      verb: ADL.verbs.progressed,
      object: this.xapi.getCourseActivity(),
      result: {
        extensions: {
          'https://w3id.org/xapi/cmi5/result/extensions/progress': percentageComplete
        }
      }
    };

    this.sendStatement(statement);
  }

  sendStatement(statement) {
    if (!this.isInitialized()) {
      console.warn('XAPI not initialized');
      return;
    }

    this.xapi.sendStatement(statement);
  }

  isInitialized() {
    if (this.xapi.get('isInitialised')) {
      return true;
    }
    return false;
  }
}

export default new XAPIEvents();
