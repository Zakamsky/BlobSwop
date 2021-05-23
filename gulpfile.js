const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const serv = require("browser-sync").create();
const del = require("del");
// const csso = require("gulp-csso");
const imagemin = require("gulp-imagemin");
const jsImport = require("gulp-js-import");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const svgstore = require("gulp-svgstore");
const terser = require("gulp-terser");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const csso = require("postcss-csso");
const sass = require("gulp-sass");
sass.compiler = require('dart-sass');

const paths = {
    src: "source",
    dest: "dest",
    watch: "dest/**/*.**",
    server: "dest",
    port: "8008",
};

// == prepare tasks: ==

//fonts convert from ttf to woff and woff2
const woff = () => {
    return gulp.src(`${paths.src}/fonts/*.ttf`)
        .pipe(ttf2woff())
        .pipe(gulp.dest(`${paths.src}/fonts`));
};
exports.woff = woff;

const woff2 = () => {
    return gulp.src(`${paths.src}/fonts/*.ttf`)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(`${paths.src}/fonts`));
};
exports.woff2 = woff2;

const fonts = gulp.series(woff, woff2);
exports.fonts = fonts;


//Image optimization
const optimizeImages = () => {
    return gulp.src(`${paths.src}/img/*.{png,jpg,svg}`)
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.mozjpeg({progressive: true}),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest(`${paths.dest}/img`));
};
exports.optimizeImages = optimizeImages;

// Sprite
const sprite = () => {
    return gulp.src(`${paths.src}/sprites/*.svg`)
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false}
                ]
            })
        ]))
        .pipe(svgstore())
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest(`${paths.dest}/img`));
};
exports.sprite = sprite;

// === util copy tasks ===
// copy images save time for dev builds
const copyImages = () => {
    return gulp.src(`${paths.src}/img/*.{png,jpg,svg}`)
        .pipe(gulp.dest(`${paths.dest}/img`));
}
exports.copyImages = copyImages;

// Copy other
const copy = (done) => {
    gulp.src([
        `${paths.src}/fonts/*.{woff2,woff}`,
        `${paths.src}/*.ico`,
        `${paths.src}/icon.svg`,
    ], {
        allowEmpty: true,
        base: paths.src
    })
        .pipe(gulp.dest(paths.dest));
    done();
};
exports.copy = copy;

// === builder's tasks ===

// Styles
const styles = () => {
    return gulp.src(`${paths.src}/sass/*.scss`)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer(),
            // csso()
        ]))
        .pipe(rename({suffix: ".min"}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(`${paths.dest}/css`))
        .pipe(serv.stream());
};
exports.styles = styles;

// scripts
const scripts = () => {
    return gulp.src(`${paths.src}/js/*.js`)
        .pipe(jsImport({
            hideConsole: true,
            importStack: true,
        }))
        // .pipe(terser())
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest(`${paths.dest}/js`))
        .pipe(serv.stream());
};
exports.scripts = scripts;

// HTML

const html = () => {
    return gulp.src(`${paths.src}/*.html`)
        .pipe(gulp.dest(`${paths.dest}`))
        .pipe(serv.stream());
}

exports.html = html;

// ==== developer's tasks ====

// Clean
const clean = () => {
    return del(paths.dest, {force: true});
};
exports.clean = clean;

// Server
const server = done => {
    serv.init({
        server: {
            baseDir: paths.server,
        },
        cors: true,
        notify: false,
        ui: false,
        port: paths.port,
    });
    done();
};
exports.server = server;

// Watcher
const watcher = () => {
    gulp.watch(`${paths.src}/sass/*.scss`, gulp.series(styles));
    gulp.watch(`${paths.src}`, gulp.series(html));
    gulp.watch(`${paths.src}/js/**/*.js`, gulp.series(scripts));
};

const dest = gulp.series( styles, scripts, html, sprite, copy)
// Build
const build = gulp.series(clean, optimizeImages, dest);
// const build = gulp.series(clean, fonts, optimizeImages, dest);
exports.build = build;
// todo: fonts сжимает грифты очень долго, но так как билд выполняется редко, считаю разумным вклбчить в него таск шрифтов что бы не забыть при деплое.


// Start
// exports.start = gulp.series(build, server, watcher);
const develop = gulp.series(clean, copyImages, dest, server, watcher);


exports.default = develop;