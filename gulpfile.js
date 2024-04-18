const gulp = require('gulp');
const webpack = require('webpack-stream');
const sass = require('gulp-sass')(require('sass'));

const dist = '/Applications/MAMP/htdocs/adminReact+PHP/admin';

gulp.task('copy-html', () => {
    return gulp.src('./app/src/*.html')
        .pipe(gulp.dest(dist));
});

gulp.task('build-js', () => {
    return gulp.src('./app/src/*.js')
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'script.js'
            },
            watch: false,
            devtool: 'source-map',
            module: {
                rules: [
                    {
                        test: /\.(?:js|mjs|cjs)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', {
                                        debug: true,
                                        corejs: 3,
                                        useBuiltIns: 'usage',
                                    },
                                    ], '@babel/react'
                                ]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('build-sass', () => {
    return gulp.src('./app/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(dist));
});

gulp.task('copy-api', () => {
    return gulp.src('./app/api/**/*')
        .pipe(gulp.dest(dist + '/api'));
})

gulp.task('copy-assets', () => {
    return gulp.src('./app/assets/**/*')
        .pipe(gulp.dest(dist + '/assets'));
})

gulp.task('watch', () => {
    gulp.watch('./app/src/*.html', gulp.parallel('copy-html'));
    gulp.watch('./app/src/**/*.*', gulp.parallel('build-js'));
    gulp.watch('./app/scss/**/*.scss', gulp.parallel('build-sass'));
    gulp.watch('./app/api/**/*', gulp.parallel('copy-api'));
    gulp.watch('./app/assets/**/*', gulp.parallel('copy-assets'));
})

gulp.task('build', gulp.parallel('copy-html', 'build-js', 'build-sass', 'copy-api', 'copy-assets', 'watch'));


gulp.task('default', gulp.parallel('watch', 'build'));
