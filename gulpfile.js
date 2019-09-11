const gulp = require("gulp");//gulp打包工具
const rollup = require("gulp-better-rollup");//rollup的gulp插件
const babel = require("rollup-plugin-babel");//rollup的es6转es5插件
const resolve = require("rollup-plugin-node-resolve");//获取资源插件
const commonjs = require("rollup-plugin-commonjs");//commonJs支持插件
const uglify = require("gulp-uglify");//gulp的压缩插件
const sourcemaps = require("gulp-sourcemaps");//源码对照插件
const rename = require("gulp-rename");//重新命名插件
const del = require("del");//删除插件
const sass = require("gulp-sass");//sass编译
const autoprefixer = require('gulp-autoprefixer');//css兼容浏览器插件
const cleanCSS = require('gulp-clean-css');//css压缩插件
const fileinclude = require("gulp-file-include");//公共文件头部底部
const browserSync = require("browser-sync");//服务器
const reload      = browserSync.reload;//手动刷新

//构建上传组件
gulp.task("upload",()=>{
    //构建upload组件的方法
    return gulp.src(["src/js/upload/index.js"])
        .pipe(rollup({
            external: ['jquery'],
            paths: {
                jquery: 'jquery'
            },
            plugins: [
                resolve(),
                commonjs(),
                babel({
                    runtimeHelpers: true
                })
            ]
        }, {
            format: 'amd',//打包方式
            name: 'upload',//包名称
            sourcemap: false//是否有sourcemarp
        }))
        .pipe(rename('upload.js'))
        .pipe(gulp.dest("src/js/modules"))
        .pipe(reload({stream: true}));
})
//dui框架构建方法
gulp.task("JavaScript", () => {
    //模块的构建方法
    gulp.src(["src/js/modules/*.js"])
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js/modules'))

    //dui的构建方法
    return gulp.src("src/js/dui.js")
        // .pipe(sourcemaps.init())
        .pipe(rollup({
            plugins: [
                resolve(),
                commonjs(),
                babel({
                    runtimeHelpers: true
                })
            ]
        }, {
            format: 'umd',//打包方式
            name: 'dui',//包名称
            sourcemap: false//是否有sourcemarp
        }))
        // .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist/js"))
        .pipe(reload({stream: true}));
})
//sass文件编译
gulp.task("sass",()=>{
    return gulp.src(['./src/scss/*.scss'])   //这是需要转化的sass文件
		.pipe(sass())
		.pipe(autoprefixer({
            overrideBrowserslist: [
                "Android 4.1",
                "iOS 7.1",
                "Chrome > 31",
                "ff > 31",
                "ie >= 8"
            ],
            grid: true   
        }))
		.pipe(rename({suffix: '.min'}))
		.pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css')) //这是转化后css的文件
        .pipe(reload({stream: true}));
})
//font文件copy
gulp.task("font",()=>{
    return gulp.src(['./src/font/*'])
		.pipe(rename({}))
        .pipe(gulp.dest('dist/font'))
        .pipe(reload({stream: true}));
})
//json文件copy
gulp.task("json",()=>{
    return gulp.src(['./src/json/*'])
		.pipe(rename({}))
        .pipe(gulp.dest('dist/json'))
        .pipe(reload({stream: true}));
})
//example例子处理
gulp.task('example',function(cb){
	return gulp.src(['./src/example/*.html','!./src/example/include/*.html'])
		.pipe(fileinclude({
			prefix: '@@',
          	basepath: '@file'
		}))
        .pipe(gulp.dest('./dist/example'))
        .pipe(reload({stream: true}));
})
//清空所有文件方法
gulp.task("clear",async()=>{
    await del([
        "./dist"
    ]);
})
//构建方法
gulp.task("build",gulp.series("clear",gulp.parallel('JavaScript', 'sass','font','example','json')))
//服务器
gulp.task("serve",gulp.series("build", ()=>{
    browserSync({
        server: {//开启一个静态文件服务器，默认：3000端口
            baseDir: "./dist",
            // index:"example/index.html"
        },
        // ui: false
    }, function(err, bs) {
        console.log(bs.options.getIn(["urls", "local"]));
    });
}))
//监听文件变化
gulp.task("watch",async()=>{
    //js监听
    gulp.watch(["./src/js/*.js","./src/js/**/*.js"],gulp.series("JavaScript"));
    gulp.watch(['./src/example/*.html','./src/example/include/*.html'],gulp.series("example"));
    gulp.watch(['./src/scss/*.scss'],gulp.series("sass"));
    gulp.watch(['./src/json/*.json'],gulp.series("json"));
})
//开发模式
gulp.task("dev",gulp.series("watch","serve"));
