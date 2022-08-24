// ==UserScript==
// @name         APIHelper
// @version      0.6.0
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

/**
 * Library for WME script developers
 */
class APIHelper {
  static log (message) {
    console.log('%cAPIHelper:%c ' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal')
  }

  /**
   * Bootstrap it once!
   */
  static bootstrap () {
    if (!Window.APIHelperBootstrap) {
      Window.APIHelperBootstrap = true
      APIHelper.check()
    }
  }

  /**
   * Check
   * @param {int} tries
   */
  static check (tries = 1) {
    APIHelper.log('attempt ' + tries)
    if (W &&
      W.map &&
      W.model &&
      W.model.countries.top &&
      W.loginManager.user
    ) {
      // WazeWrap is optional, but we should wait for Ready state
      if ('WazeWrap' in window && !WazeWrap.Ready) {
        tries++
        setTimeout(() => APIHelper.check(tries), 500)
      } else {
        APIHelper.log('was initialized')
        APIHelper.init()
      }
    } else if (tries < 100) {
      tries++
      setTimeout(() => APIHelper.check(tries), 500)
    } else {
      APIHelper.log('initialization failed')
    }
  }

  /**
   * Initialization
   */
  static init () {
    let $document = $(document)
    $document.trigger('init.apihelper')

    let trigger = function (selected) {
      if (selected.length === 0) {
        $document.trigger('none.apihelper')
        return
      }
      let editPanel = document.getElementById('edit-panel')
      switch (selected[0].model.type) {
        case 'node':
          $document.trigger('node.apihelper', [editPanel.querySelector('#node-edit-general')])
          break
        case 'segment':
          $document.trigger('segment.apihelper', [editPanel.querySelector('#segment-edit-general')])
          break
        case 'venue':
          if (selected.length > 1) {
            $document.trigger('landmark-collection.apihelper', [editPanel.querySelector('#mergeVenuesCollection')])
            $document.trigger('venue-collection.apihelper', [editPanel.querySelector('#mergeVenuesCollection')])
          } else {
            $document.trigger('landmark.apihelper', [editPanel.querySelector('#venue-edit-general')])
            $document.trigger('venue.apihelper', [editPanel.querySelector('#venue-edit-general')])
          }
          break
      }
    }

    // Initial handler for fire events
    W.selectionManager.events.register('selectionchanged', null, function (event) {
      trigger(event.selected)
    })

    trigger(W.selectionManager.getSelectedFeatures())

    let logger = function (event) {
      APIHelper.log(event.type + '.' + event.namespace)
    }

    $document
      .on('init.apihelper', logger)
      .on('none.apihelper', logger)
      .on('segment.apihelper', logger)
      .on('node.apihelper', logger)
      .on('landmark.apihelper', logger)
      .on('landmark-collection.apihelper', logger)
  }

  /**
   * Normalize title
   * @param string
   * @returns {string}
   */
  static normalize (string) {
    return string.replace(/\W+/gi, '-').toLowerCase()
  }

  /**
   * Apply CSS styles
   */
  static addStyle (css) {
    let style = document.createElement('style')
    style.type = 'text/css' // is required
    style.innerHTML = css
    document.querySelector('head').appendChild(style)
  }

  /**
   * @param {String} uid
   * @param {Object} data
   */
  static addTranslation (uid, data) {
    if (!data.en) {
      console.error('Default translation `en` is required')
    }
    let locale = I18n.currentLocale()
    I18n.translations[locale][uid] = data[locale] || data.en
  }

  /**
   * Get all available POI except selected categories
   * @param {Array} except
   * @return {Array}
   */
  static getVenues (except = []) {
    let selected = W.model.venues.getObjectArray()
    selected = selected.filter((el) => el.isGeometryEditable())
    // filter by main category
    if (except.length) {
      selected = selected.filter(model => except.indexOf(model.getMainCategory()) === -1)
    }
    return selected
  }

  /**
   * Get all available segments except selected road types
   * @param {Array} except
   * @return {Array}
   */
  static getSegments (except = []) {
    let selected = W.model.segments.getObjectArray()
    selected = selected.filter((el) => el.isGeometryEditable())
    // filter by road type
    if (except.length) {
      selected = selected.filter(segment => except.indexOf(segment.getRoadType()) === -1)
    }
    return selected
  }

  /**
   * @returns {Array}
   */
  static getSelected () {
    if (!W.selectionManager.hasSelectedFeatures()) {
      return []
    }
    let selected
    selected = W.selectionManager.getSelectedFeatures().map((x) => x.model)
    selected = selected.filter((el) => el.isGeometryEditable())
    return selected
  }

  /**
   * Get selected Area POI(s)
   * @return {Array}
   */
  static getSelectedVenues () {
    return APIHelper.getSelected().filter((el) => el.type === 'venue')
  }

  /**
   * Get selected Area POI
   * @return {Object|null}
   */
  static getSelectedVenue () {
    if (APIHelper.getSelectedVenues().length) {
      return APIHelper.getSelectedVenues()[0]
    }
    return null
  }

  /**
   * Get selected Segments
   * @return {Array}
   */
  static getSelectedSegments () {
    return APIHelper.getSelected().filter((el) => el.type === 'segment')
  }

  /**
   * Get selected Segment
   * @return {Object|null}
   */
  static getSelectedSegment () {
    if (APIHelper.getSelectedSegments().length) {
      return APIHelper.getSelectedSegments()[0]
    }
    return null
  }

  /**
   * Get selected Nodes
   * @return {Object}
   */
  static getSelectedNodes () {
    return APIHelper.getSelected().filter((el) => el.type === 'node')
  }

  /**
   * Get selected Node
   * @return {Object|null}
   */
  static getSelectedNode () {
    if (APIHelper.getSelectedNodes().length) {
      return APIHelper.getSelectedNodes()[0]
    }
    return null
  }
}
