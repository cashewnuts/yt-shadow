/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, task, src } = require('gulp')
var rename = require('gulp-rename')
const cssWrap = require('gulp-css-wrap')

const bluprintCss = () => {
  return src('node_modules/@blueprintjs/core/lib/css/blueprint.css')
    .pipe(rename('yt-blueprint.css'))
    .pipe(cssWrap({ selector: '.yt-shadow' }))
    .pipe(dest('addon/css'))
}
task('blueprint-css', bluprintCss)
