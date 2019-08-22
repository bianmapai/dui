var path = require('path');
var gulp = require('gulp')
var sass = require('gulp-sass')//sass解析插件
var rename = require("gulp-rename");//重命名插件
var cleanCSS = require('gulp-clean-css');//css压缩插件
var autoprefixer = require('gulp-autoprefixer');//css兼容浏览器插件
var runSequence = require('run-sequence');//同步执行插件
var connect = require("gulp-connect");//小型服务器
var del = require("del");//删除插件
var fileinclude  = require('gulp-file-include');//公共头部底部插件
var uglify=require('gulp-uglify');
var gutil = require('gulp-util');
var babel = require('rollup-plugin-babel');
var sourcemaps = require('gulp-sourcemaps')
var rollup = require('gulp-better-rollup');

//sass处理任务
gulp.task('sass', function () {
	return gulp.src(['./src/scss/*.scss'])   //这是需要转化的sass文件
		.pipe(sass())
		.pipe(autoprefixer({
			browsers:['last 4 version'],
			cascade:false
        }))
		.pipe(rename({suffix: '.min'}))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('dist/css')) //这是转化后css的文件
})
//字体图标处理
gulp.task('copyfont',function(){
	return gulp.src(['./src/font/*'])
		.pipe(rename({}))
		.pipe(gulp.dest('dist/font'))
})
//图片处理
gulp.task('copyimg',function(){
	return gulp.src(['./src/img/*'])
		.pipe(rename({}))
		.pipe(gulp.dest('dist/img'))
})
//json处理
gulp.task('copyjson',function(){
	return gulp.src(['./src/json/*'])
		.pipe(rename({}))
		.pipe(gulp.dest('./dist/data'))
})
//html处理
gulp.task('copy-html',function(cb){
	return gulp.src(['./src/example/*.html','./src/example/*/*.html','!./src/example/include/*.html'])
		.pipe(fileinclude({
			prefix: '@@',
          	basepath: '@file'
		}))
		.pipe(gulp.dest('./dist/example'))
})


//清理dist目录和html目录
gulp.task('build-clean',function(cb){
	return del(['./dist','./example'],cb)
})

//build方法
gulp.task('build', function(cb) {
	runSequence('build-clean',
				['sass', 'copyfont','copyimg','copyjson','js'],'copy-html',
				cb);
});

//sever服务器
gulp.task('server',function(){
	connect.server({
		root: "./dist/",
		livereload: true,
		host:'0.0.0.0',
		port: 8030
	})
})
//js相关操作
gulp.task("js",function(){
	//模块构建
	gulp.src('./src/js/modules/*.js')
	// .pipe(uglify())
	.on('error', function (err) {
		gutil.log(gutil.colors.red('[Error]'), err.toString());
	})
	.pipe(gulp.dest('dist/js/modules'));

	//dui构建
	gulp.src('./src/js/dui.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({
      // There is no `input` option as rollup integrates into the gulp pipeline
      plugins: [babel()]
    }, {
      // Rollups `sourcemap` option is unsupported. Use `gulp-sourcemaps` plugin instead
	  format: 'umd',
	  name: 'dui',
      sourcemap: false
    }))
    // inlining the sourcemap into the exported .js file
	// .pipe(sourcemaps.write('../maps'))
	// .pipe(uglify())
	.on('error', function (err) {
		gutil.log(gutil.colors.red('[Error]'), err.toString());
	})
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('dist/js'))

})

//添加监视任务
gulp.task('watch',function(){
	gulp.watch(["./src/js/*.js","./src/js/**/*.js",'./src/js/'],['js',"reload"])
	gulp.watch(["./src/json/*.json","./src/json/**/*.json",'./src/json/'],['coyjson',"reload"])
	gulp.watch(["./src/example/*.html",'src/example/**/*.html','./example/**/*.html'], ["copy-html","reload"]);
	gulp.watch(["./src/scss/*.scss"], ["sass","reload"]);
	gulp.watch(["./dist/**/*.*","./dist/**/**/*.*","./example/*.html",'./example/**/*.html'], ["reload"]);
})
//刷新服务器
gulp.task('reload',function(){
	gulp.src(["./dist/example/*.html",'./dist/example/**/*.html'])
		.pipe(connect.reload());
})
//开发者预览
gulp.task('dev',['server','watch'],function(){})