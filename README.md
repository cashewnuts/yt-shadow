# Youtube Shadowing

## Install addon on your browser

[<img width="50" src="resources/icons/firefox/firefox-logo.svg" />](https://addons.mozilla.org/en-US/firefox/addon/yt-shadow/)

## Screenshots

Initial view

<img width="500" src="resources/images/screenshot/initial.jpg" />

Inputting

<img width="500" src="resources/images/screenshot/inputting.jpg" />

Correct

<img width="500" src="resources/images/screenshot/correct.jpg" />

Incorrect

<img width="500" src="resources/images/screenshot/incorrect.jpg" />

Dictionary

<img width="500" src="resources/images/screenshot/dictionary.jpg" />

## Build Process

Run the commands below

```bash
npm i
npm run build
```

This generates `web-ext-artifacts/ytshadow-{version}.zip`

## Limitation

This addon lacks browser suppurts for belows because of dexie.js.

- Internet Explorer
- Edge(EdgeHTML)
- Safari < v10
