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

//dui的构建方法
gulp.task("dui", () => {
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
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        // .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest("dist/js"))
        .pipe(reload({stream: true}));
})
//markdown编辑器的构建方法
gulp.task("mdEditor", () => {
    return gulp.src(["src/js/plugins/mdEditor/index.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
        },
        external: ['jquery'],
        paths: {
            jquery: 'jquery',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'mdEditor',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename('mdEditor.js'))
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//上传组件的构建方法
gulp.task("upload", () => {
    return gulp.src(["src/js/plugins/upload.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
        },
        external: ['jquery'],
        paths: {
            jquery: 'jquery',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'upload',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//elemnt的构建方法
gulp.task("element",()=>{
    return gulp.src(["src/js/plugins/element.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
        },
        external: ['jquery'],
        paths: {
            jquery: 'jquery',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'element',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//form的构建方法
gulp.task("form",()=>{
    return gulp.src(["src/js/plugins/form.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
        },
        external: ['jquery'],
        paths: {
            jquery: 'jquery',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'form',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    // .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));;
})
//popup框架构建方法
gulp.task("popup", () => {
    return gulp.src(["src/js/plugins/popup.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
        },
        external: ['jquery'],
        paths: {
            jquery: 'jquery',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'popup',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//pagination的构建方法
gulp.task("pagination", () => {
    return gulp.src(["src/js/plugins/pagination.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
            form:'form',
        },
        external: ['jquery','form'],
        paths: {
            jquery: 'jquery',
            from:'form',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'pagination',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//tree的构建方法
gulp.task("tree", () => {
    return gulp.src(["src/js/plugins/tree.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
            form:'form',
        },
        external: ['jquery','form'],
        paths: {
            jquery: 'jquery',
            from:'form',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'tree',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//table的构建方法
gulp.task("table", () => {
    return gulp.src(["src/js/plugins/table.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
            form:'form',
        },
        external: ['jquery','form'],
        paths: {
            jquery: 'jquery',
            from:'form',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'table',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    // .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//table的构建方法
gulp.task("pjax", () => {
    return gulp.src(["src/js/plugins/pjax.js"])
    .pipe(rollup({
        globals: {
            jquery: 'jQuery',
            form:'form',
        },
        external: ['jquery','form'],
        paths: {
            jquery: 'jquery',
            from:'form',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' // 只编译我们的源代码
            })
        ]
    }, {
        format: 'umd',//打包方式
        name:'pjax',
        sourcemap: false//是否有sourcemarp
    }))
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"))
    .pipe(reload({stream: true}));
})
//template的构建方法
gulp.task("template", () => {
    return gulp.src(["src/js/plugins/template.js"])
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"));
})
//jquery的构建方法
gulp.task("jquery", () => {
    return gulp.src(["src/js/plugins/jquery.js"])
    .pipe(rename({suffix: ''}))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js/plugins"));
})
//扩展的构建方法
gulp.task("extend", () => {
    return gulp.src(["src/js/extend/*.js"])
    .pipe(rename({suffix: ''}))
    // .pipe(uglify())
    .pipe(gulp.dest("dist/js/extend"))
    .pipe(reload({stream: true}));;
})

//dui框架构建方法
gulp.task("JavaScript", gulp.parallel("dui","element","form","popup","pagination","tree","upload","table","template","jquery",'mdEditor','pjax','extend'))
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
    gulp.watch(["./src/js/extend/*.js"],gulp.series("extend"));
    gulp.watch(["./src/js/dui.js","./src/js/lib/*.js"],gulp.series("dui"));
    gulp.watch(["./src/js/plugins/element.js","./src/js/plugins/element/*.js"],gulp.series("element"));
    gulp.watch(["./src/js/plugins/table.js","./src/js/plugins/table/*.js"],gulp.series("table"));
    gulp.watch(["./src/js/plugins/form.js","./src/js/fplugins/orm/*.js"],gulp.series("form"));
    gulp.watch(["./src/js/plugins/upload.js","./src/js/plugins/upload/*.js"],gulp.series("upload"));
    gulp.watch(["./src/js/plugins/popup.js","./src/js/plugins/popup/*.js"],gulp.series("popup"));
    gulp.watch(["./src/js/plugins/tree.js","./src/js/plugins/tree/*.js"],gulp.series("tree"));
    gulp.watch(["./src/js/plugins/mdEditor/index.js","./src/js/plugins/mdEditor/**/index.js"],gulp.series("mdEditor"));

    gulp.watch(['./src/example/*.html','./src/example/include/*.html'],gulp.series("example"));
    gulp.watch(['./src/scss/*.scss'],gulp.series("sass"));
    gulp.watch(['./src/json/*.json'],gulp.series("json"));
})
//开发模式
gulp.task("dev",gulp.series("watch","serve"));
