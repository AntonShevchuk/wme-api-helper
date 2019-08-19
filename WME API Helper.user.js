// ==UserScript==
// @name         WME API Helper
// @version      0.0.1
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
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @namespace    https://greasyfork.org/users/227648
// ==/UserScript==

/* jshint esversion: 6 */
/* global require, window, $, W, I18n, WazeWrap */
class APIHelper {
  /**
   * Bootstrap
   * @param {int} tries
   */
  static bootstrap(tries = 1) {
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
      setTimeout(() => APIHelper.bootstrap(tries), 500);
    } else {
      console.error('API Helper initialization failed');
    }
  }

  /**
   * Initialization
   */
  static init() {
    $(document).trigger('ready.apihelper');

    // Initial Mutation Observer
    // Check for changes in the edit-panel
    let speedLimitsObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        for (let i = 0, total = mutation.addedNodes.length; i < total; i++) {
          let node = mutation.addedNodes[i];
          // Only fire up if it's a node
          if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('div.selection')) {
            if (node.querySelector('#segment-edit-general')) {
              $('#edit-panel').trigger('segment.apihelper', [node.querySelector('#segment-edit-general')]);
            } else if (node.querySelector('#landmark-edit-general')) {
              $('#edit-panel').trigger('landmark.apihelper', [node.querySelector('#landmark-edit-general')]);
            } else if (node.querySelector('#mergeLandmarksCollection')) {
              $('#edit-panel').trigger('landmark-collection.apihelper', [node.querySelector('#mergeLandmarksCollection')]);
            }
          }
        }
      });
    });

    speedLimitsObserver.observe(document.getElementById('edit-panel'), {childList: true, subtree: true});
    console.log('API Helper observer was run');
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
   * Get all available POI except chosen categories
   * @param {Array} except
   * @return {Array}
   */
  static getAllPOI(except = []) {
    let selected = W.model.venues.getObjectArray();
    // filter by main category
    if (except.length) {
      selected = selected.filter(model => except.indexOf(model.getMainCategory()) === -1);
    }
    return selected;
  }
  static normalize(string) {
    return string.replace(/\W/gi, '-').toLowerCase();
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

class APIHelperUI {
  constructor(uid) {
    this.uid = APIHelper.normalize(uid);
  }
  createPanel(title) {
    return new APIHelperUIPanel(this.uid, title);
  }
  createTab(title) {
    return new APIHelperUITab(this.uid, title);
  }
  /**
   * @param {Object} data
   */
  addTranslate(data) {
    let locale = I18n.currentLocale();
    I18n.translations[locale][this.uid] = data[locale] || data.en;
  }
  /**
   * Mixin buttons with translations
   */
  applyTranslate(buttons) {
    $.extend(true, buttons, this.t().buttons);
  }
  /**
   * @returns {Object}
   */
  t() {
    return I18n.t(this.uid);
  }
}

class APIHelperUIElement {
  constructor(uid, title) {
    this.uid = uid;
    this.title = title;
    this.buttons = {};
  }
  addButton(id, title, description, shortcut, callback) {
    this.buttons[id] = new APIHelperUIButton(this.uid, id, title, description, shortcut, callback);
  }
  addButtons(buttons) {
    for (let btn in buttons) {
      this.addButton(
          btn,
          buttons[btn].title,
          buttons[btn].description,
          buttons[btn].shortcut,
          buttons[btn].callback,
      );
    }
  }
}

class APIHelperUITab extends APIHelperUIElement {
  init() {
    // Tab toggler
    let li = document.createElement('li');
        li.innerHTML = '<a href="#sidepanel-' + this.uid + '" id="' + this.uid + '" data-toggle="tab">'+ this.title + '</a>';
    document.querySelector('#user-tabs .nav-tabs').appendChild(li);
    document.querySelector('.tab-content').appendChild(this.toHTML());
  }
  toHTML() {
    // Section
    let pane = document.createElement('div');
        pane.id = 'sidepanel-' + this.uid;
        pane.className = 'tab-pane';
    // Label of the panel
    let label = document.createElement('label');
        label.className = 'control-label';
        label.innerHTML = this.title;
    // Container for buttons
    let controls = document.createElement('div');
        controls.className = 'button-toolbar';
    // Append buttons to container
    for (let btn in this.buttons) {
      let p = document.createElement('p');
          p.innerHTML = this.buttons[btn].description;
          p.prepend(this.buttons[btn].toHTML());
      controls.appendChild(p);
    }
    // Build panel
    let group = document.createElement('div');
        group.className = 'form-group ' + APIHelper.normalize(this.uid);
        group.appendChild(label);
        group.appendChild(controls);
    pane.append(group);
    return pane;
  }
}

class APIHelperUIPanel extends APIHelperUIElement {
  init(element) {
    element.prepend(this.toHTML())
  }
  toHTML() {
    // Label of the panel
    let label = document.createElement('label');
        label.className = 'control-label';
        label.innerHTML = this.title;
    // Container for buttons
    let controls = document.createElement('div');
        controls.className = 'controls';
    // Append buttons to panel
    for (let btn in this.buttons) {
      controls.appendChild(this.buttons[btn].toHTML());
    }
    // Build panel
    let group = document.createElement('div');
        group.className = 'form-group ' + APIHelper.normalize(this.uid);
        group.appendChild(label);
        group.appendChild(controls);
    return group;
  }
}

class APIHelperUIButton {
  constructor(uid, id, title, description, shortcut, callback) {
    this.uid = uid;
    this.id = id;
    this.title = title;
    this.description = description;
    this.shortcut = shortcut;
    this.callback = callback;
    if (this.shortcut) {
      this.addShortcut();
    }
  }
  addShortcut() {
    /* name, desc, group, title, shortcut, callback, scope */
    new WazeWrap.Interface.Shortcut(
        this.uid + '-' + this.id,
        this.description,
        this.uid,
        this.uid,
        this.shortcut,
        this.callback,
        null
    ).add();
  }
  toHTML() {
    let button = document.createElement('button');
      button.className = 'waze-btn waze-btn-small ' + this.uid + ' ' + this.uid + '-' + this.id;
      button.innerHTML = this.title;
      button.title = this.description;
      button.onclick = this.callback;
    return button;
  }
}