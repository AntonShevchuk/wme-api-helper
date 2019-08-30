# WME API Helper
## Require Script
```javascript
// @require https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require https://greasyfork.org/scripts/389117-apihelper/code/APIHelper.js?version=XXX
```
> See last available version on the GreasyFork homepage 
## Initialisation of the API Helper
For initial helper use method `APIHelper.bootstrap()`:
```javascript
(function () {
  'use strict';
  APIHelper.bootstrap();
})();
```

## Methods
* `APIHelper.appendStyle(style)` – append CSS style to the page
* `APIHelper.getVenues(except = [])` – return Array of venues, except some categories
* `APIHelper.getSegments(except = [])` – return Array of segments, except some road types
* `APIHelper.getSelectedVenues()` – return Array of the selected venues, which you can edit
* `APIHelper.getSelectedSegments()` – return Array of the selected segments, which you can edit
* `APIHelper.addTranslation(uid, data)` – add translation data to I18n object

## Events
* `ready.apihelper` – on `document`, when all ready for usage
* `node.apihelper` – on `'#edit-panel'`, when chosen some node for edit
* `segment.apihelper` – on `'#edit-panel'`, when chosen some segment for edit
* `landmark.apihelper` – on `'#edit-panel'`, when chosen some place for edit
* `landmark-collection.apihelper.apihelper` – on `'#edit-panel'`, when chosen more than one place

## Example

```javascript
(function () {
  'use strict';

  // uniq script name
  const NAME = 'Some Script';
  // translation structure
  const TRANSLATION = {
    'en': {
      title: 'Title example',
    },
    'uk': {
      title: 'Приклад назви',
    },
    'ru': {
      title: 'Пример названия',
    }
  };

  APIHelper.bootstrap();
  APIHelper.addTranslation(NAME, TRANSLATION);

  $(document)
      .on('ready.apihelper', function () {
        console.info('@ready');
      })
      .on('node.apihelper', '#edit-panel', (e, el) => {
        console.info('@node', el);
      })
      .on('segment.apihelper', '#edit-panel', (e, el) => {
        console.info('@segment', el);
      })
      .on('landmark.apihelper', '#edit-panel', (e, el) => {
        console.info('@landmark', el);
      })
      .on('landmark-collection.apihelper', '#edit-panel', (e, el) => {
        console.info('@landmark-collection', el)
      });
})();

```

## Links
Author homepage: http://anton.shevchuk.name/  
Script homepage: https://github.com/AntonShevchuk/wme-api-helper  
GreasyFork: https://greasyfork.org/uk/scripts/389117-apihelper
