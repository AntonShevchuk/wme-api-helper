// ==UserScript==
// @name         APIHelper
// @version      0.1.0
// @description  API Helper
// @author       Anton Shevchuk
// @license      MIT License
// @include      https://www.waze.com/editor*
// @include      https://www.waze.com/*/editor*
// @include      https://beta.waze.com/editor*
// @include      https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @exclude      https://beta.waze.com/user/editor*
// @grant        none
// @namespace    https://greasyfork.org/users/227648
// ==/UserScript==

/* jshint esversion: 6 */
/* global require, window, $, W, I18n, WazeWrap */
class APIHelper {
  static bootstrap() {
    if (!window.APIHelperBootstrap) {
      window.APIHelperBootstrap = true;
      APIHelper.check();
    }
  }
  /**
   * Check
   * @param {int} tries
   */
  static check(tries = 1) {
    console.log('API Helper attempt ' + tries);
    if (W &&
        W.map &&
        W.model &&
        W.loginManager.user &&
        WazeWrap.Ready
    ) {
      console.log('API Helper was initialized');
      APIHelper.init();
    } else if (tries < 100) {
      tries++;
      setTimeout(() => APIHelper.check(tries), 500);
    } else {
      console.error('API Helper initialization failed');
    }
  }
  /**
   * Initialization
   */
  static init() {
    $(document).trigger('ready.apihelper');

    let $editPanel = $('#edit-panel');

    // Initial Mutation Observer
    // Check for changes in the edit-panel
    let speedLimitsObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        for (let i = 0, total = mutation.addedNodes.length; i < total; i++) {
          let node = mutation.addedNodes[i];
          // Only fire up if it's a node
          if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('div.selection')) {
            if (node.querySelector('#segment-edit-general')) {
              $editPanel.trigger('segment.apihelper', [node.querySelector('#segment-edit-general')]);
            } else if (node.querySelector('#node-edit-general')) {
              $editPanel.trigger('node.apihelper', [node.querySelector('#node-edit-general')]);
            } else if (node.querySelector('#landmark-edit-general')) {
              $editPanel.trigger('landmark.apihelper', [node.querySelector('#landmark-edit-general')]);
            } else if (node.querySelector('#mergeLandmarksCollection')) {
              $editPanel.trigger('landmark-collection.apihelper', [node.querySelector('#mergeLandmarksCollection')]);
            }
          }
        }
      });
    });

    speedLimitsObserver.observe(document.getElementById('edit-panel'), {childList: true, subtree: true});
    console.log('API Helper observer was run');

    if (document.getElementById('segment-edit-general')) {
      $editPanel.trigger('segment.apihelper', [document.getElementById('segment-edit-general')]);
    }
    if (document.getElementById('node-edit-general')) {
      $editPanel.trigger('node.apihelper', [document.getElementById('node-edit-general')]);
    }
    if (document.getElementById('landmark-edit-general')) {
      $editPanel.trigger('landmark.apihelper', [document.getElementById('landmark-edit-general')]);
    }
    if (document.getElementById('mergeLandmarksCollection')) {
      $editPanel.trigger('landmark-collection.apihelper', [document.getElementById('mergeLandmarksCollection')]);
    }

    let logger = function(event) {
      console.log('APIHelper: ' + event.type + '.' + event.namespace);
    };

    $(document)
      .on('ready.apihelper', logger)
      .on('segment.apihelper', '#edit-panel', logger)
      .on('node.apihelper', '#edit-panel', logger)
      .on('landmark.apihelper', '#edit-panel', logger)
      .on('landmark-collection', '#edit-panel', logger)
    ;
  }
  /**
   * Normalize title
   * @param string
   * @returns {string}
   */
  static normalize(string) {
    return string.replace(/\W+/gi, '-').toLowerCase();
  }
  /**
   * Apply CSS styles
   */
  static appendStyle(css) {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    document.getElementsByTagName('head')[0].appendChild(style);
  }
  /**
   * @param {String} uid
   * @param {Object} data
   */
  static addTranslation(uid, data) {
    if (!data.en) {
      console.error('Default translation `en` is required');
    }
    let locale = I18n.currentLocale();
    I18n.translations[locale][uid] = data[locale] || data.en;
  }
  /**
   * Get all available POI except selected categories
   * @param {Array} except
   * @return {Array}
   */
  static getVenues(except = []) {
    let selected = W.model.venues.getObjectArray();
    selected = selected.filter((el) => el.isGeometryEditable());
    // filter by main category
    if (except.length) {
      selected = selected.filter(model => except.indexOf(model.getMainCategory()) === -1);
    }
    return selected;
  }
  /**
   * Get all available segments except selected road types
   * @param {Array} except
   * @return {Array}
   */
  static getSegments(except = []) {
    let selected = W.model.segments.getObjectArray();
    selected = selected.filter((el) => el.isGeometryEditable());
    // filter by road type
    if (except.length) {
      selected = selected.filter(segment => except.indexOf(segment.getRoadType()) === -1);
    }
    return selected;
  }
  /**
   * @returns {Array}
   */
  static getSelected() {
    if (!W.selectionManager.hasSelectedFeatures()) {
      return [];
    }
    let selected;
    selected = W.selectionManager.getSelectedFeatures().map((x) => x.model);
    selected = selected.filter((el) => el.isGeometryEditable());
    return selected;
  }
  /**
   * Get selected Area POI
   * @return {Array}
   */
  static getSelectedVenues() {
    return APIHelper.getSelected().filter((el) => el.type === 'venue');
  }
  /**
   * Get selected Segments
   * @return {Array}
   */
  static getSelectedSegments() {
    return APIHelper.getSelected().filter((el) => el.type === 'segment');
  }
}
