# WME API Helper

```javascript
(function () {
  'use strict';

  let helper, panel, tab;

  // translation structure
  let translation = {
    'en': {
      title: 'Title example',
      buttons: {
        A: {
          title: 'But 1 EN',
          description: 'Button 1 can do smth in EN'
        },
        B: {
          title: 'But 2 EN',
          description: 'Button 2 can do smth in EN'
        },
      }
    },
    'uk': {
      title: 'Приклад назви',
      buttons: {
        A: {
          title: 'Кнопка 1',
          description: 'Кнопка 1 щось має робити'
        },
        B: {
          title: 'Кнопка 2',
          description: 'Кнопка 2 щось має робити'
        },
      }
    },
    'ru': {
      title: 'Пример названия',
      buttons: {
        A: {
          title: 'Кнопка 1',
          description: 'Кнопка 1 должна что-то делать'
        },
        B: {
          title: 'Кнопка 2',
          description: 'Кнопка 2 должна что-то делать'
        },
      }
    }
  };

  // buttons structure
  let buttons = {
    A: {
      title: 'BTN1',
      description: 'Button 1 can do smth',
      shortcut: 'S+49',
      callback: function() {
        console.log('Button 1');
        return false;
      }
    },
    B: {
      title: 'BTN2',
      description: 'Button 2 can do smth',
      shortcut: 'S+50',
      callback: function() {
        console.log('Button 2');
        return false;
      }
    },
  };

  APIHelper.bootstrap();

  $(document)
      .on('ready.apihelper', function () {
        console.info('@ready');

        helper = new APIHelperUI('Example Script');
        helper.addTranslate(translation);
        helper.applyTranslate(buttons);

        panel = helper.createPanel(helper.t().title);
        panel.addButtons(buttons);

        tab = helper.createTab(helper.t().title);
        tab.addButtons(buttons);
        tab.init();
      })
      .on('segment.apihelper', '#edit-panel', (e, el) => {
        console.log('@segment', el);
        panel.init(el);
      })
      .on('landmark.apihelper', '#edit-panel', (e, el) => {
        console.info('@landmark', el);
        panel.init(el);
      })
      .on('landmark-collection.apihelper', '#edit-panel', (e, el) => {
        console.info('@landmark-collection', el)
        panel.init(el);
      });
})();

```
