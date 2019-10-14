(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define('upload', ['jquery'], factory) :
	(global = global || self, global.upload = factory(global.jQuery));
}(this, function ($) { 'use strict';

	$ = $ && $.hasOwnProperty('default') ? $['default'] : $;

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var resumable = createCommonjsModule(function (module) {
	/*
	* MIT Licensed
	* http://www.23developer.com/opensource
	* http://github.com/23/resumable.js
	* Steffen Tiedemann Christensen, steffen@23company.com
	*/

	(function(){

	  var Resumable = function(opts){
	    if ( !(this instanceof Resumable) ) {
	      return new Resumable(opts);
	    }
	    this.version = 1.0;
	    // SUPPORTED BY BROWSER?
	    // Check if these features are support by the browser:
	    // - File object type
	    // - Blob object type
	    // - FileList object type
	    // - slicing files
	    this.support = (
	                   (typeof(File)!=='undefined')
	                   &&
	                   (typeof(Blob)!=='undefined')
	                   &&
	                   (typeof(FileList)!=='undefined')
	                   &&
	                   (!!Blob.prototype.webkitSlice||!!Blob.prototype.mozSlice||!!Blob.prototype.slice||false)
	                   );
	    if(!this.support) return(false);


	    // PROPERTIES
	    var $ = this;
	    $.files = [];
	    $.defaults = {
	      chunkSize:1*1024*1024,
	      forceChunkSize:false,
	      simultaneousUploads:3,
	      fileParameterName:'file',
	      chunkNumberParameterName: 'resumableChunkNumber',
	      chunkSizeParameterName: 'resumableChunkSize',
	      currentChunkSizeParameterName: 'resumableCurrentChunkSize',
	      totalSizeParameterName: 'resumableTotalSize',
	      typeParameterName: 'resumableType',
	      identifierParameterName: 'resumableIdentifier',
	      fileNameParameterName: 'resumableFilename',
	      relativePathParameterName: 'resumableRelativePath',
	      totalChunksParameterName: 'resumableTotalChunks',
	      throttleProgressCallbacks: 0.5,
	      query:{},
	      headers:{},
	      preprocess:null,
	      method:'multipart',
	      uploadMethod: 'POST',
	      testMethod: 'GET',
	      prioritizeFirstAndLastChunk:false,
	      target:'/',
	      testTarget: null,
	      parameterNamespace:'',
	      testChunks:true,
	      generateUniqueIdentifier:null,
	      getTarget:null,
	      maxChunkRetries:100,
	      chunkRetryInterval:undefined,
	      permanentErrors:[400, 404, 415, 500, 501],
	      maxFiles:undefined,
	      withCredentials:false,
	      xhrTimeout:0,
	      clearInput:true,
	      chunkFormat:'blob',
	      setChunkTypeFromFile:false,
	      maxFilesErrorCallback:function (files, errorCount) {
	        var maxFiles = $.getOpt('maxFiles');
	        alert('Please upload no more than ' + maxFiles + ' file' + (maxFiles === 1 ? '' : 's') + ' at a time.');
	      },
	      minFileSize:1,
	      minFileSizeErrorCallback:function(file, errorCount) {
	        alert(file.fileName||file.name +' is too small, please upload files larger than ' + $h.formatSize($.getOpt('minFileSize')) + '.');
	      },
	      maxFileSize:undefined,
	      maxFileSizeErrorCallback:function(file, errorCount) {
	        alert(file.fileName||file.name +' is too large, please upload files less than ' + $h.formatSize($.getOpt('maxFileSize')) + '.');
	      },
	      fileType: [],
	      fileTypeErrorCallback: function(file, errorCount) {
	        alert(file.fileName||file.name +' has type not allowed, please upload files of type ' + $.getOpt('fileType') + '.');
	      }
	    };
	    $.opts = opts||{};
	    $.getOpt = function(o) {
	      var $opt = this;
	      // Get multiple option if passed an array
	      if(o instanceof Array) {
	        var options = {};
	        $h.each(o, function(option){
	          options[option] = $opt.getOpt(option);
	        });
	        return options;
	      }
	      // Otherwise, just return a simple option
	      if ($opt instanceof ResumableChunk) {
	        if (typeof $opt.opts[o] !== 'undefined') { return $opt.opts[o]; }
	        else { $opt = $opt.fileObj; }
	      }
	      if ($opt instanceof ResumableFile) {
	        if (typeof $opt.opts[o] !== 'undefined') { return $opt.opts[o]; }
	        else { $opt = $opt.resumableObj; }
	      }
	      if ($opt instanceof Resumable) {
	        if (typeof $opt.opts[o] !== 'undefined') { return $opt.opts[o]; }
	        else { return $opt.defaults[o]; }
	      }
	    };

	    // EVENTS
	    // catchAll(event, ...)
	    // fileSuccess(file), fileProgress(file), fileAdded(file, event), filesAdded(files, filesSkipped), fileRetry(file),
	    // fileError(file, message), complete(), progress(), error(message, file), pause()
	    $.events = [];
	    $.on = function(event,callback){
	      $.events.push(event.toLowerCase(), callback);
	    };
	    $.fire = function(){
	      // `arguments` is an object, not array, in FF, so:
	      var args = [];
	      for (var i=0; i<arguments.length; i++) args.push(arguments[i]);
	      // Find event listeners, and support pseudo-event `catchAll`
	      var event = args[0].toLowerCase();
	      for (var i=0; i<=$.events.length; i+=2) {
	        if($.events[i]==event) $.events[i+1].apply($,args.slice(1));
	        if($.events[i]=='catchall') $.events[i+1].apply(null,args);
	      }
	      if(event=='fileerror') $.fire('error', args[2], args[1]);
	      if(event=='fileprogress') $.fire('progress');
	    };


	    // INTERNAL HELPER METHODS (handy, but ultimately not part of uploading)
	    var $h = {
	      stopEvent: function(e){
	        e.stopPropagation();
	        e.preventDefault();
	      },
	      each: function(o,callback){
	        if(typeof(o.length)!=='undefined') {
	          for (var i=0; i<o.length; i++) {
	            // Array or FileList
	            if(callback(o[i])===false) return;
	          }
	        } else {
	          for (i in o) {
	            // Object
	            if(callback(i,o[i])===false) return;
	          }
	        }
	      },
	      generateUniqueIdentifier:function(file, event){
	        var custom = $.getOpt('generateUniqueIdentifier');
	        if(typeof custom === 'function') {
	          return custom(file, event);
	        }
	        var relativePath = file.webkitRelativePath||file.fileName||file.name; // Some confusion in different versions of Firefox
	        var size = file.size;
	        return(size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, ''));
	      },
	      contains:function(array,test) {
	        var result = false;

	        $h.each(array, function(value) {
	          if (value == test) {
	            result = true;
	            return false;
	          }
	          return true;
	        });

	        return result;
	      },
	      formatSize:function(size){
	        if(size<1024) {
	          return size + ' bytes';
	        } else if(size<1024*1024) {
	          return (size/1024.0).toFixed(0) + ' KB';
	        } else if(size<1024*1024*1024) {
	          return (size/1024.0/1024.0).toFixed(1) + ' MB';
	        } else {
	          return (size/1024.0/1024.0/1024.0).toFixed(1) + ' GB';
	        }
	      },
	      getTarget:function(request, params){
	        var target = $.getOpt('target');

	        if (request === 'test' && $.getOpt('testTarget')) {
	          target = $.getOpt('testTarget') === '/' ? $.getOpt('target') : $.getOpt('testTarget');
	        }

	        if (typeof target === 'function') {
	          return target(params);
	        }

	        var separator = target.indexOf('?') < 0 ? '?' : '&';
	        var joinedParams = params.join('&');

	        return target + separator + joinedParams;
	      }
	    };

	    var onDrop = function(event){
	      $h.stopEvent(event);

	      //handle dropped things as items if we can (this lets us deal with folders nicer in some cases)
	      if (event.dataTransfer && event.dataTransfer.items) {
	        loadFiles(event.dataTransfer.items, event);
	      }
	      //else handle them as files
	      else if (event.dataTransfer && event.dataTransfer.files) {
	        loadFiles(event.dataTransfer.files, event);
	      }
	    };
	    var preventDefault = function(e) {
	      e.preventDefault();
	    };

	    /**
	     * processes a single upload item (file or directory)
	     * @param {Object} item item to upload, may be file or directory entry
	     * @param {string} path current file path
	     * @param {File[]} items list of files to append new items to
	     * @param {Function} cb callback invoked when item is processed
	     */
	    function processItem(item, path, items, cb) {
	      var entry;
	      if(item.isFile){
	        // file provided
	        return item.file(function(file){
	          file.relativePath = path + file.name;
	          items.push(file);
	          cb();
	        });
	      }else if(item.isDirectory){
	        // item is already a directory entry, just assign
	        entry = item;
	      }else if(item instanceof File) {
	        items.push(item);
	      }
	      if('function' === typeof item.webkitGetAsEntry){
	        // get entry from file object
	        entry = item.webkitGetAsEntry();
	      }
	      if(entry && entry.isDirectory){
	        // directory provided, process it
	        return processDirectory(entry, path + entry.name + '/', items, cb);
	      }
	      if('function' === typeof item.getAsFile){
	        // item represents a File object, convert it
	        item = item.getAsFile();
	        if(item instanceof File) {
	          item.relativePath = path + item.name;
	          items.push(item);
	        }
	      }
	      cb(); // indicate processing is done
	    }


	    /**
	     * cps-style list iteration.
	     * invokes all functions in list and waits for their callback to be
	     * triggered.
	     * @param  {Function[]}   items list of functions expecting callback parameter
	     * @param  {Function} cb    callback to trigger after the last callback has been invoked
	     */
	    function processCallbacks(items, cb){
	      if(!items || items.length === 0){
	        // empty or no list, invoke callback
	        return cb();
	      }
	      // invoke current function, pass the next part as continuation
	      items[0](function(){
	        processCallbacks(items.slice(1), cb);
	      });
	    }

	    /**
	     * recursively traverse directory and collect files to upload
	     * @param  {Object}   directory directory to process
	     * @param  {string}   path      current path
	     * @param  {File[]}   items     target list of items
	     * @param  {Function} cb        callback invoked after traversing directory
	     */
	    function processDirectory (directory, path, items, cb) {
	      var dirReader = directory.createReader();
	      dirReader.readEntries(function(entries){
	        if(!entries.length){
	          // empty directory, skip
	          return cb();
	        }
	        // process all conversion callbacks, finally invoke own one
	        processCallbacks(
	          entries.map(function(entry){
	            // bind all properties except for callback
	            return processItem.bind(null, entry, path, items);
	          }),
	          cb
	        );
	      });
	    }

	    /**
	     * process items to extract files to be uploaded
	     * @param  {File[]} items items to process
	     * @param  {Event} event event that led to upload
	     */
	    function loadFiles(items, event) {
	      if(!items.length){
	        return; // nothing to do
	      }
	      $.fire('beforeAdd');
	      var files = [];
	      processCallbacks(
	          Array.prototype.map.call(items, function(item){
	            // bind all properties except for callback
	            return processItem.bind(null, item, "", files);
	          }),
	          function(){
	            if(files.length){
	              // at least one file found
	              appendFilesFromFileList(files, event);
	            }
	          }
	      );
	    }
	    var appendFilesFromFileList = function(fileList, event){
	      // check for uploading too many files
	      var errorCount = 0;
	      var o = $.getOpt(['maxFiles', 'minFileSize', 'maxFileSize', 'maxFilesErrorCallback', 'minFileSizeErrorCallback', 'maxFileSizeErrorCallback', 'fileType', 'fileTypeErrorCallback']);
	      if (typeof(o.maxFiles)!=='undefined' && o.maxFiles<(fileList.length+$.files.length)) {
	        // if single-file upload, file is already added, and trying to add 1 new file, simply replace the already-added file
	        if (o.maxFiles===1 && $.files.length===1 && fileList.length===1) {
	          $.removeFile($.files[0]);
	        } else {
	          o.maxFilesErrorCallback(fileList, errorCount++);
	          return false;
	        }
	      }
	      var files = [], filesSkipped = [], remaining = fileList.length;
	      var decreaseReamining = function(){
	        if(!--remaining){
	          // all files processed, trigger event
	          if(!files.length && !filesSkipped.length){
	            // no succeeded files, just skip
	            return;
	          }
	          window.setTimeout(function(){
	            $.fire('filesAdded', files, filesSkipped);
	          },0);
	        }
	      };
	      $h.each(fileList, function(file){
	        var fileName = file.name;
	        if(o.fileType.length > 0){
	          var fileTypeFound = false;
	          for(var index in o.fileType){
	            var extension = '.' + o.fileType[index];
				if(fileName.toLowerCase().indexOf(extension.toLowerCase(), fileName.length - extension.length) !== -1){
	              fileTypeFound = true;
	              break;
	            }
	          }
	          if (!fileTypeFound) {
	            o.fileTypeErrorCallback(file, errorCount++);
	            return false;
	          }
	        }

	        if (typeof(o.minFileSize)!=='undefined' && file.size<o.minFileSize) {
	          o.minFileSizeErrorCallback(file, errorCount++);
	          return false;
	        }
	        if (typeof(o.maxFileSize)!=='undefined' && file.size>o.maxFileSize) {
	          o.maxFileSizeErrorCallback(file, errorCount++);
	          return false;
	        }

	        function addFile(uniqueIdentifier){
	          if (!$.getFromUniqueIdentifier(uniqueIdentifier)) {(function(){
	            file.uniqueIdentifier = uniqueIdentifier;
	            var f = new ResumableFile($, file, uniqueIdentifier);
	            $.files.push(f);
	            files.push(f);
	            f.container = (typeof event != 'undefined' ? event.srcElement : null);
	            window.setTimeout(function(){
	              $.fire('fileAdded', f, event);
	            },0);
	          })();} else {
	            filesSkipped.push(file);
	          }          decreaseReamining();
	        }
	        // directories have size == 0
	        var uniqueIdentifier = $h.generateUniqueIdentifier(file, event);
	        if(uniqueIdentifier && typeof uniqueIdentifier.then === 'function'){
	          // Promise or Promise-like object provided as unique identifier
	          uniqueIdentifier
	          .then(
	            function(uniqueIdentifier){
	              // unique identifier generation succeeded
	              addFile(uniqueIdentifier);
	            },
	           function(){
	              // unique identifier generation failed
	              // skip further processing, only decrease file count
	              decreaseReamining();
	            }
	          );
	        }else{
	          // non-Promise provided as unique identifier, process synchronously
	          addFile(uniqueIdentifier);
	        }
	      });
	    };

	    // INTERNAL OBJECT TYPES
	    function ResumableFile(resumableObj, file, uniqueIdentifier){
	      var $ = this;
	      $.opts = {};
	      $.getOpt = resumableObj.getOpt;
	      $._prevProgress = 0;
	      $.resumableObj = resumableObj;
	      $.file = file;
	      $.fileName = file.fileName||file.name; // Some confusion in different versions of Firefox
	      $.size = file.size;
	      $.relativePath = file.relativePath || file.webkitRelativePath || $.fileName;
	      $.uniqueIdentifier = uniqueIdentifier;
	      $._pause = false;
	      $.container = '';
	      var _error = uniqueIdentifier !== undefined;

	      // Callback when something happens within the chunk
	      var chunkEvent = function(event, message){
	        // event can be 'progress', 'success', 'error' or 'retry'
	        switch(event){
	        case 'progress':
	          $.resumableObj.fire('fileProgress', $, message);
	          break;
	        case 'error':
	          $.abort();
	          _error = true;
	          $.chunks = [];
	          $.resumableObj.fire('fileError', $, message);
	          break;
	        case 'success':
	          if(_error) return;
	          $.resumableObj.fire('fileProgress', $); // it's at least progress
	          if($.isComplete()) {
	            $.resumableObj.fire('fileSuccess', $, message);
	          }
	          break;
	        case 'retry':
	          $.resumableObj.fire('fileRetry', $);
	          break;
	        }
	      };

	      // Main code to set up a file object with chunks,
	      // packaged to be able to handle retries if needed.
	      $.chunks = [];
	      $.abort = function(){
	        // Stop current uploads
	        var abortCount = 0;
	        $h.each($.chunks, function(c){
	          if(c.status()=='uploading') {
	            c.abort();
	            abortCount++;
	          }
	        });
	        if(abortCount>0) $.resumableObj.fire('fileProgress', $);
	      };
	      $.cancel = function(){
	        // Reset this file to be void
	        var _chunks = $.chunks;
	        $.chunks = [];
	        // Stop current uploads
	        $h.each(_chunks, function(c){
	          if(c.status()=='uploading')  {
	            c.abort();
	            $.resumableObj.uploadNextChunk();
	          }
	        });
	        $.resumableObj.removeFile($);
	        $.resumableObj.fire('fileProgress', $);
	      };
	      $.retry = function(){
	        $.bootstrap();
	        var firedRetry = false;
	        $.resumableObj.on('chunkingComplete', function(){
	          if(!firedRetry) $.resumableObj.upload();
	          firedRetry = true;
	        });
	      };
	      $.bootstrap = function(){
	        $.abort();
	        _error = false;
	        // Rebuild stack of chunks from file
	        $.chunks = [];
	        $._prevProgress = 0;
	        var round = $.getOpt('forceChunkSize') ? Math.ceil : Math.floor;
	        var maxOffset = Math.max(round($.file.size/$.getOpt('chunkSize')),1);
	        for (var offset=0; offset<maxOffset; offset++) {(function(offset){
	            window.setTimeout(function(){
	                $.chunks.push(new ResumableChunk($.resumableObj, $, offset, chunkEvent));
	                $.resumableObj.fire('chunkingProgress',$,offset/maxOffset);
	            },0);
	        })(offset);}
	        window.setTimeout(function(){
	            $.resumableObj.fire('chunkingComplete',$);
	        },0);
	      };
	      $.progress = function(){
	        if(_error) return(1);
	        // Sum up progress across everything
	        var ret = 0;
	        var error = false;
	        $h.each($.chunks, function(c){
	          if(c.status()=='error') error = true;
	          ret += c.progress(true); // get chunk progress relative to entire file
	        });
	        ret = (error ? 1 : (ret>0.99999 ? 1 : ret));
	        ret = Math.max($._prevProgress, ret); // We don't want to lose percentages when an upload is paused
	        $._prevProgress = ret;
	        return(ret);
	      };
	      $.isUploading = function(){
	        var uploading = false;
	        $h.each($.chunks, function(chunk){
	          if(chunk.status()=='uploading') {
	            uploading = true;
	            return(false);
	          }
	        });
	        return(uploading);
	      };
	      $.isComplete = function(){
	        var outstanding = false;
	        $h.each($.chunks, function(chunk){
	          var status = chunk.status();
	          if(status=='pending' || status=='uploading' || chunk.preprocessState === 1) {
	            outstanding = true;
	            return(false);
	          }
	        });
	        return(!outstanding);
	      };
	      $.pause = function(pause){
	          if(typeof(pause)==='undefined'){
	              $._pause = ($._pause ? false : true);
	          }else{
	              $._pause = pause;
	          }
	      };
	      $.isPaused = function() {
	        return $._pause;
	      };


	      // Bootstrap and return
	      $.resumableObj.fire('chunkingStart', $);
	      $.bootstrap();
	      return(this);
	    }


	    function ResumableChunk(resumableObj, fileObj, offset, callback){
	      var $ = this;
	      $.opts = {};
	      $.getOpt = resumableObj.getOpt;
	      $.resumableObj = resumableObj;
	      $.fileObj = fileObj;
	      $.fileObjSize = fileObj.size;
	      $.fileObjType = fileObj.file.type;
	      $.offset = offset;
	      $.callback = callback;
	      $.lastProgressCallback = (new Date);
	      $.tested = false;
	      $.retries = 0;
	      $.pendingRetry = false;
	      $.preprocessState = 0; // 0 = unprocessed, 1 = processing, 2 = finished

	      // Computed properties
	      var chunkSize = $.getOpt('chunkSize');
	      $.loaded = 0;
	      $.startByte = $.offset*chunkSize;
	      $.endByte = Math.min($.fileObjSize, ($.offset+1)*chunkSize);
	      if ($.fileObjSize-$.endByte < chunkSize && !$.getOpt('forceChunkSize')) {
	        // The last chunk will be bigger than the chunk size, but less than 2*chunkSize
	        $.endByte = $.fileObjSize;
	      }
	      $.xhr = null;

	      // test() makes a GET request without any data to see if the chunk has already been uploaded in a previous session
	      $.test = function(){
	        // Set up request and listen for event
	        $.xhr = new XMLHttpRequest();

	        var testHandler = function(e){
	          $.tested = true;
	          var status = $.status();
	          if(status=='success') {
	            $.callback(status, $.message());
	            $.resumableObj.uploadNextChunk();
	          } else {
	            $.send();
	          }
	        };
	        $.xhr.addEventListener('load', testHandler, false);
	        $.xhr.addEventListener('error', testHandler, false);
	        $.xhr.addEventListener('timeout', testHandler, false);

	        // Add data from the query options
	        var params = [];
	        var parameterNamespace = $.getOpt('parameterNamespace');
	        var customQuery = $.getOpt('query');
	        if(typeof customQuery == 'function') customQuery = customQuery($.fileObj, $);
	        $h.each(customQuery, function(k,v){
	          params.push([encodeURIComponent(parameterNamespace+k), encodeURIComponent(v)].join('='));
	        });
	        // Add extra data to identify chunk
	        params = params.concat(
	          [
	            // define key/value pairs for additional parameters
	            ['chunkNumberParameterName', $.offset + 1],
	            ['chunkSizeParameterName', $.getOpt('chunkSize')],
	            ['currentChunkSizeParameterName', $.endByte - $.startByte],
	            ['totalSizeParameterName', $.fileObjSize],
	            ['typeParameterName', $.fileObjType],
	            ['identifierParameterName', $.fileObj.uniqueIdentifier],
	            ['fileNameParameterName', $.fileObj.fileName],
	            ['relativePathParameterName', $.fileObj.relativePath],
	            ['totalChunksParameterName', $.fileObj.chunks.length]
	          ].filter(function(pair){
	            // include items that resolve to truthy values
	            // i.e. exclude false, null, undefined and empty strings
	            return $.getOpt(pair[0]);
	          })
	          .map(function(pair){
	            // map each key/value pair to its final form
	            return [
	              parameterNamespace + $.getOpt(pair[0]),
	              encodeURIComponent(pair[1])
	            ].join('=');
	          })
	        );
	        // Append the relevant chunk and send it
	        $.xhr.open($.getOpt('testMethod'), $h.getTarget('test', params));
	        $.xhr.timeout = $.getOpt('xhrTimeout');
	        $.xhr.withCredentials = $.getOpt('withCredentials');
	        // Add data from header options
	        var customHeaders = $.getOpt('headers');
	        if(typeof customHeaders === 'function') {
	          customHeaders = customHeaders($.fileObj, $);
	        }
	        $h.each(customHeaders, function(k,v) {
	          $.xhr.setRequestHeader(k, v);
	        });
	        $.xhr.send(null);
	      };

	      $.preprocessFinished = function(){
	        $.preprocessState = 2;
	        $.send();
	      };

	      // send() uploads the actual data in a POST call
	      $.send = function(){
	        var preprocess = $.getOpt('preprocess');
	        if(typeof preprocess === 'function') {
	          switch($.preprocessState) {
	          case 0: $.preprocessState = 1; preprocess($); return;
	          case 1: return;
	          case 2: break;
	          }
	        }
	        if($.getOpt('testChunks') && !$.tested) {
	          $.test();
	          return;
	        }

	        // Set up request and listen for event
	        $.xhr = new XMLHttpRequest();

	        // Progress
	        $.xhr.upload.addEventListener('progress', function(e){
	          if( (new Date) - $.lastProgressCallback > $.getOpt('throttleProgressCallbacks') * 1000 ) {
	            $.callback('progress');
	            $.lastProgressCallback = (new Date);
	          }
	          $.loaded=e.loaded||0;
	        }, false);
	        $.loaded = 0;
	        $.pendingRetry = false;
	        $.callback('progress');

	        // Done (either done, failed or retry)
	        var doneHandler = function(e){
	          var status = $.status();
	          if(status=='success'||status=='error') {
	            $.callback(status, $.message());
	            $.resumableObj.uploadNextChunk();
	          } else {
	            $.callback('retry', $.message());
	            $.abort();
	            $.retries++;
	            var retryInterval = $.getOpt('chunkRetryInterval');
	            if(retryInterval !== undefined) {
	              $.pendingRetry = true;
	              setTimeout($.send, retryInterval);
	            } else {
	              $.send();
	            }
	          }
	        };
	        $.xhr.addEventListener('load', doneHandler, false);
	        $.xhr.addEventListener('error', doneHandler, false);
	        $.xhr.addEventListener('timeout', doneHandler, false);

	        // Set up the basic query data from Resumable
	        var query = [
	          ['chunkNumberParameterName', $.offset + 1],
	          ['chunkSizeParameterName', $.getOpt('chunkSize')],
	          ['currentChunkSizeParameterName', $.endByte - $.startByte],
	          ['totalSizeParameterName', $.fileObjSize],
	          ['typeParameterName', $.fileObjType],
	          ['identifierParameterName', $.fileObj.uniqueIdentifier],
	          ['fileNameParameterName', $.fileObj.fileName],
	          ['relativePathParameterName', $.fileObj.relativePath],
	          ['totalChunksParameterName', $.fileObj.chunks.length],
	        ].filter(function(pair){
	          // include items that resolve to truthy values
	          // i.e. exclude false, null, undefined and empty strings
	          return $.getOpt(pair[0]);
	        })
	        .reduce(function(query, pair){
	          // assign query key/value
	          query[$.getOpt(pair[0])] = pair[1];
	          return query;
	        }, {});
	        // Mix in custom data
	        var customQuery = $.getOpt('query');
	        if(typeof customQuery == 'function') customQuery = customQuery($.fileObj, $);
	        $h.each(customQuery, function(k,v){
	          query[k] = v;
	        });

	        var func = ($.fileObj.file.slice ? 'slice' : ($.fileObj.file.mozSlice ? 'mozSlice' : ($.fileObj.file.webkitSlice ? 'webkitSlice' : 'slice')));
	        var bytes = $.fileObj.file[func]($.startByte, $.endByte, $.getOpt('setChunkTypeFromFile') ? $.fileObj.file.type : "");
	        var data = null;
	        var params = [];

	        var parameterNamespace = $.getOpt('parameterNamespace');
	                if ($.getOpt('method') === 'octet') {
	                    // Add data from the query options
	                    data = bytes;
	                    $h.each(query, function (k, v) {
	                        params.push([encodeURIComponent(parameterNamespace + k), encodeURIComponent(v)].join('='));
	                    });
	                } else {
	                    // Add data from the query options
	                    data = new FormData();
	                    $h.each(query, function (k, v) {
	                        data.append(parameterNamespace + k, v);
	                        params.push([encodeURIComponent(parameterNamespace + k), encodeURIComponent(v)].join('='));
	                    });
	                    if ($.getOpt('chunkFormat') == 'blob') {
	                        data.append(parameterNamespace + $.getOpt('fileParameterName'), bytes, $.fileObj.fileName);
	                    }
	                    else if ($.getOpt('chunkFormat') == 'base64') {
	                        var fr = new FileReader();
	                        fr.onload = function (e) {
	                            data.append(parameterNamespace + $.getOpt('fileParameterName'), fr.result);
	                            $.xhr.send(data);
	                        };
	                        fr.readAsDataURL(bytes);
	                    }
	                }

	        var target = $h.getTarget('upload', params);
	        var method = $.getOpt('uploadMethod');

	        $.xhr.open(method, target);
	        if ($.getOpt('method') === 'octet') {
	          $.xhr.setRequestHeader('Content-Type', 'application/octet-stream');
	        }
	        $.xhr.timeout = $.getOpt('xhrTimeout');
	        $.xhr.withCredentials = $.getOpt('withCredentials');
	        // Add data from header options
	        var customHeaders = $.getOpt('headers');
	        if(typeof customHeaders === 'function') {
	          customHeaders = customHeaders($.fileObj, $);
	        }

	        $h.each(customHeaders, function(k,v) {
	          $.xhr.setRequestHeader(k, v);
	        });

	                if ($.getOpt('chunkFormat') == 'blob') {
	                    $.xhr.send(data);
	                }
	      };
	      $.abort = function(){
	        // Abort and reset
	        if($.xhr) $.xhr.abort();
	        $.xhr = null;
	      };
	      $.status = function(){
	        // Returns: 'pending', 'uploading', 'success', 'error'
	        if($.pendingRetry) {
	          // if pending retry then that's effectively the same as actively uploading,
	          // there might just be a slight delay before the retry starts
	          return('uploading');
	        } else if(!$.xhr) {
	          return('pending');
	        } else if($.xhr.readyState<4) {
	          // Status is really 'OPENED', 'HEADERS_RECEIVED' or 'LOADING' - meaning that stuff is happening
	          return('uploading');
	        } else {
	          if($.xhr.status == 200 || $.xhr.status == 201) {
	            // HTTP 200, 201 (created)
	            return('success');
	          } else if($h.contains($.getOpt('permanentErrors'), $.xhr.status) || $.retries >= $.getOpt('maxChunkRetries')) {
	            // HTTP 415/500/501, permanent error
	            return('error');
	          } else {
	            // this should never happen, but we'll reset and queue a retry
	            // a likely case for this would be 503 service unavailable
	            $.abort();
	            return('pending');
	          }
	        }
	      };
	      $.message = function(){
	        return($.xhr ? $.xhr.responseText : '');
	      };
	      $.progress = function(relative){
	        if(typeof(relative)==='undefined') relative = false;
	        var factor = (relative ? ($.endByte-$.startByte)/$.fileObjSize : 1);
	        if($.pendingRetry) return(0);
	        if(!$.xhr || !$.xhr.status) factor*=.95;
	        var s = $.status();
	        switch(s){
	        case 'success':
	        case 'error':
	          return(1*factor);
	        case 'pending':
	          return(0*factor);
	        default:
	          return($.loaded/($.endByte-$.startByte)*factor);
	        }
	      };
	      return(this);
	    }

	    // QUEUE
	    $.uploadNextChunk = function(){
	      var found = false;

	      // In some cases (such as videos) it's really handy to upload the first
	      // and last chunk of a file quickly; this let's the server check the file's
	      // metadata and determine if there's even a point in continuing.
	      if ($.getOpt('prioritizeFirstAndLastChunk')) {
	        $h.each($.files, function(file){
	          if(file.chunks.length && file.chunks[0].status()=='pending' && file.chunks[0].preprocessState === 0) {
	            file.chunks[0].send();
	            found = true;
	            return(false);
	          }
	          if(file.chunks.length>1 && file.chunks[file.chunks.length-1].status()=='pending' && file.chunks[file.chunks.length-1].preprocessState === 0) {
	            file.chunks[file.chunks.length-1].send();
	            found = true;
	            return(false);
	          }
	        });
	        if(found) return(true);
	      }

	      // Now, simply look for the next, best thing to upload
	      $h.each($.files, function(file){
	        if(file.isPaused()===false){
	         $h.each(file.chunks, function(chunk){
	           if(chunk.status()=='pending' && chunk.preprocessState === 0) {
	             chunk.send();
	             found = true;
	             return(false);
	           }
	          });
	        }
	        if(found) return(false);
	      });
	      if(found) return(true);

	      // The are no more outstanding chunks to upload, check is everything is done
	      var outstanding = false;
	      $h.each($.files, function(file){
	        if(!file.isComplete()) {
	          outstanding = true;
	          return(false);
	        }
	      });
	      if(!outstanding) {
	        // All chunks have been uploaded, complete
	        $.fire('complete');
	      }
	      return(false);
	    };


	    // PUBLIC METHODS FOR RESUMABLE.JS
	    $.assignBrowse = function(domNodes, isDirectory){
	      if(typeof(domNodes.length)=='undefined') domNodes = [domNodes];

	      $h.each(domNodes, function(domNode) {
	        var input;
	        if(domNode.tagName==='INPUT' && domNode.type==='file'){
	          input = domNode;
	        } else {
	          input = document.createElement('input');
	          input.setAttribute('type', 'file');
	          input.style.display = 'none';
	          domNode.addEventListener('click', function(){
	            input.style.opacity = 0;
	            input.style.display='block';
	            input.focus();
	            input.click();
	            input.style.display='none';
	          }, false);
	          domNode.appendChild(input);
	        }
	        var maxFiles = $.getOpt('maxFiles');
	        if (typeof(maxFiles)==='undefined'||maxFiles!=1){
	          input.setAttribute('multiple', 'multiple');
	        } else {
	          input.removeAttribute('multiple');
	        }
	        if(isDirectory){
	          input.setAttribute('webkitdirectory', 'webkitdirectory');
	        } else {
	          input.removeAttribute('webkitdirectory');
	        }
	        var fileTypes = $.getOpt('fileType');
	        if (typeof (fileTypes) !== 'undefined' && fileTypes.length >= 1) {
	          input.setAttribute('accept', fileTypes.map(function (e) { return '.' + e }).join(','));
	        }
	        else {
	          input.removeAttribute('accept');
	        }
	        // When new files are added, simply append them to the overall list
	        input.addEventListener('change', function(e){
	          appendFilesFromFileList(e.target.files,e);
	          var clearInput = $.getOpt('clearInput');
	          if (clearInput) {
	            e.target.value = '';
	          }
	        }, false);
	      });
	    };
	    $.assignDrop = function(domNodes){
	      if(typeof(domNodes.length)=='undefined') domNodes = [domNodes];

	      $h.each(domNodes, function(domNode) {
	        domNode.addEventListener('dragover', preventDefault, false);
	        domNode.addEventListener('dragenter', preventDefault, false);
	        domNode.addEventListener('drop', onDrop, false);
	      });
	    };
	    $.unAssignDrop = function(domNodes) {
	      if (typeof(domNodes.length) == 'undefined') domNodes = [domNodes];

	      $h.each(domNodes, function(domNode) {
	        domNode.removeEventListener('dragover', preventDefault);
	        domNode.removeEventListener('dragenter', preventDefault);
	        domNode.removeEventListener('drop', onDrop);
	      });
	    };
	    $.isUploading = function(){
	      var uploading = false;
	      $h.each($.files, function(file){
	        if (file.isUploading()) {
	          uploading = true;
	          return(false);
	        }
	      });
	      return(uploading);
	    };
	    $.upload = function(){
	      // Make sure we don't start too many uploads at once
	      if($.isUploading()) return;
	      // Kick off the queue
	      $.fire('uploadStart');
	      for (var num=1; num<=$.getOpt('simultaneousUploads'); num++) {
	        $.uploadNextChunk();
	      }
	    };
	    $.pause = function(){
	      // Resume all chunks currently being uploaded
	      $h.each($.files, function(file){
	        file.abort();
	      });
	      $.fire('pause');
	    };
	    $.cancel = function(){
	      $.fire('beforeCancel');
	      for(var i = $.files.length - 1; i >= 0; i--) {
	        $.files[i].cancel();
	      }
	      $.fire('cancel');
	    };
	    $.progress = function(){
	      var totalDone = 0;
	      var totalSize = 0;
	      // Resume all chunks currently being uploaded
	      $h.each($.files, function(file){
	        totalDone += file.progress()*file.size;
	        totalSize += file.size;
	      });
	      return(totalSize>0 ? totalDone/totalSize : 0);
	    };
	    $.addFile = function(file, event){
	      appendFilesFromFileList([file], event);
	    };
	    $.addFiles = function(files, event){
	      appendFilesFromFileList(files, event);
	    };
	    $.removeFile = function(file){
	      for(var i = $.files.length - 1; i >= 0; i--) {
	        if($.files[i] === file) {
	          $.files.splice(i, 1);
	        }
	      }
	    };
	    $.getFromUniqueIdentifier = function(uniqueIdentifier){
	      var ret = false;
	      $h.each($.files, function(f){
	        if(f.uniqueIdentifier==uniqueIdentifier) ret = f;
	      });
	      return(ret);
	    };
	    $.getSize = function(){
	      var totalSize = 0;
	      $h.each($.files, function(file){
	        totalSize += file.size;
	      });
	      return(totalSize);
	    };
	    $.handleDropEvent = function (e) {
	      onDrop(e);
	    };
	    $.handleChangeEvent = function (e) {
	      appendFilesFromFileList(e.target.files, e);
	      e.target.value = '';
	    };
	    $.updateQuery = function(query){
	        $.opts.query = query;
	    };

	    return(this);
	  };


	  // Node.js-style export for Node and Component
	  {
	    module.exports = Resumable;
	  }

	})();
	});

	var sparkMd5 = createCommonjsModule(function (module, exports) {
	(function (factory) {
	    {
	        // Node/CommonJS
	        module.exports = factory();
	    }
	}(function (undefined$1) {

	    /*
	     * Fastest md5 implementation around (JKM md5).
	     * Credits: Joseph Myers
	     *
	     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
	     * @see http://jsperf.com/md5-shootout/7
	     */

	    /* this function is much faster,
	      so if possible we use it. Some IEs
	      are the only ones I know of that
	      need the idiotic second function,
	      generated by an if clause.  */
	    var add32 = function (a, b) {
	        return (a + b) & 0xFFFFFFFF;
	    },
	        hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];


	    function cmn(q, a, b, x, s, t) {
	        a = add32(add32(a, q), add32(x, t));
	        return add32((a << s) | (a >>> (32 - s)), b);
	    }

	    function ff(a, b, c, d, x, s, t) {
	        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	    }

	    function gg(a, b, c, d, x, s, t) {
	        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	    }

	    function hh(a, b, c, d, x, s, t) {
	        return cmn(b ^ c ^ d, a, b, x, s, t);
	    }

	    function ii(a, b, c, d, x, s, t) {
	        return cmn(c ^ (b | (~d)), a, b, x, s, t);
	    }

	    function md5cycle(x, k) {
	        var a = x[0],
	            b = x[1],
	            c = x[2],
	            d = x[3];

	        a = ff(a, b, c, d, k[0], 7, -680876936);
	        d = ff(d, a, b, c, k[1], 12, -389564586);
	        c = ff(c, d, a, b, k[2], 17, 606105819);
	        b = ff(b, c, d, a, k[3], 22, -1044525330);
	        a = ff(a, b, c, d, k[4], 7, -176418897);
	        d = ff(d, a, b, c, k[5], 12, 1200080426);
	        c = ff(c, d, a, b, k[6], 17, -1473231341);
	        b = ff(b, c, d, a, k[7], 22, -45705983);
	        a = ff(a, b, c, d, k[8], 7, 1770035416);
	        d = ff(d, a, b, c, k[9], 12, -1958414417);
	        c = ff(c, d, a, b, k[10], 17, -42063);
	        b = ff(b, c, d, a, k[11], 22, -1990404162);
	        a = ff(a, b, c, d, k[12], 7, 1804603682);
	        d = ff(d, a, b, c, k[13], 12, -40341101);
	        c = ff(c, d, a, b, k[14], 17, -1502002290);
	        b = ff(b, c, d, a, k[15], 22, 1236535329);

	        a = gg(a, b, c, d, k[1], 5, -165796510);
	        d = gg(d, a, b, c, k[6], 9, -1069501632);
	        c = gg(c, d, a, b, k[11], 14, 643717713);
	        b = gg(b, c, d, a, k[0], 20, -373897302);
	        a = gg(a, b, c, d, k[5], 5, -701558691);
	        d = gg(d, a, b, c, k[10], 9, 38016083);
	        c = gg(c, d, a, b, k[15], 14, -660478335);
	        b = gg(b, c, d, a, k[4], 20, -405537848);
	        a = gg(a, b, c, d, k[9], 5, 568446438);
	        d = gg(d, a, b, c, k[14], 9, -1019803690);
	        c = gg(c, d, a, b, k[3], 14, -187363961);
	        b = gg(b, c, d, a, k[8], 20, 1163531501);
	        a = gg(a, b, c, d, k[13], 5, -1444681467);
	        d = gg(d, a, b, c, k[2], 9, -51403784);
	        c = gg(c, d, a, b, k[7], 14, 1735328473);
	        b = gg(b, c, d, a, k[12], 20, -1926607734);

	        a = hh(a, b, c, d, k[5], 4, -378558);
	        d = hh(d, a, b, c, k[8], 11, -2022574463);
	        c = hh(c, d, a, b, k[11], 16, 1839030562);
	        b = hh(b, c, d, a, k[14], 23, -35309556);
	        a = hh(a, b, c, d, k[1], 4, -1530992060);
	        d = hh(d, a, b, c, k[4], 11, 1272893353);
	        c = hh(c, d, a, b, k[7], 16, -155497632);
	        b = hh(b, c, d, a, k[10], 23, -1094730640);
	        a = hh(a, b, c, d, k[13], 4, 681279174);
	        d = hh(d, a, b, c, k[0], 11, -358537222);
	        c = hh(c, d, a, b, k[3], 16, -722521979);
	        b = hh(b, c, d, a, k[6], 23, 76029189);
	        a = hh(a, b, c, d, k[9], 4, -640364487);
	        d = hh(d, a, b, c, k[12], 11, -421815835);
	        c = hh(c, d, a, b, k[15], 16, 530742520);
	        b = hh(b, c, d, a, k[2], 23, -995338651);

	        a = ii(a, b, c, d, k[0], 6, -198630844);
	        d = ii(d, a, b, c, k[7], 10, 1126891415);
	        c = ii(c, d, a, b, k[14], 15, -1416354905);
	        b = ii(b, c, d, a, k[5], 21, -57434055);
	        a = ii(a, b, c, d, k[12], 6, 1700485571);
	        d = ii(d, a, b, c, k[3], 10, -1894986606);
	        c = ii(c, d, a, b, k[10], 15, -1051523);
	        b = ii(b, c, d, a, k[1], 21, -2054922799);
	        a = ii(a, b, c, d, k[8], 6, 1873313359);
	        d = ii(d, a, b, c, k[15], 10, -30611744);
	        c = ii(c, d, a, b, k[6], 15, -1560198380);
	        b = ii(b, c, d, a, k[13], 21, 1309151649);
	        a = ii(a, b, c, d, k[4], 6, -145523070);
	        d = ii(d, a, b, c, k[11], 10, -1120210379);
	        c = ii(c, d, a, b, k[2], 15, 718787259);
	        b = ii(b, c, d, a, k[9], 21, -343485551);

	        x[0] = add32(a, x[0]);
	        x[1] = add32(b, x[1]);
	        x[2] = add32(c, x[2]);
	        x[3] = add32(d, x[3]);
	    }

	    function md5blk(s) {
	        var md5blks = [],
	            i; /* Andy King said do it this way. */

	        for (i = 0; i < 64; i += 4) {
	            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
	        }
	        return md5blks;
	    }

	    function md5blk_array(a) {
	        var md5blks = [],
	            i; /* Andy King said do it this way. */

	        for (i = 0; i < 64; i += 4) {
	            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
	        }
	        return md5blks;
	    }

	    function md51(s) {
	        var n = s.length,
	            state = [1732584193, -271733879, -1732584194, 271733878],
	            i,
	            length,
	            tail,
	            tmp,
	            lo,
	            hi;

	        for (i = 64; i <= n; i += 64) {
	            md5cycle(state, md5blk(s.substring(i - 64, i)));
	        }
	        s = s.substring(i - 64);
	        length = s.length;
	        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
	        }
	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }

	        // Beware that the final length might not fit in 32 bits so we take care of that
	        tmp = n * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;

	        tail[14] = lo;
	        tail[15] = hi;

	        md5cycle(state, tail);
	        return state;
	    }

	    function md51_array(a) {
	        var n = a.length,
	            state = [1732584193, -271733879, -1732584194, 271733878],
	            i,
	            length,
	            tail,
	            tmp,
	            lo,
	            hi;

	        for (i = 64; i <= n; i += 64) {
	            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
	        }

	        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
	        // containing the last element of the parent array if the sub array specified starts
	        // beyond the length of the parent array - weird.
	        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
	        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

	        length = a.length;
	        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= a[i] << ((i % 4) << 3);
	        }

	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(state, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }

	        // Beware that the final length might not fit in 32 bits so we take care of that
	        tmp = n * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;

	        tail[14] = lo;
	        tail[15] = hi;

	        md5cycle(state, tail);

	        return state;
	    }

	    function rhex(n) {
	        var s = '',
	            j;
	        for (j = 0; j < 4; j += 1) {
	            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
	        }
	        return s;
	    }

	    function hex(x) {
	        var i;
	        for (i = 0; i < x.length; i += 1) {
	            x[i] = rhex(x[i]);
	        }
	        return x.join('');
	    }

	    // In some cases the fast add32 function cannot be used..
	    if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
	        add32 = function (x, y) {
	            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	            return (msw << 16) | (lsw & 0xFFFF);
	        };
	    }

	    // ---------------------------------------------------

	    /**
	     * ArrayBuffer slice polyfill.
	     *
	     * @see https://github.com/ttaubert/node-arraybuffer-slice
	     */

	    if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
	        (function () {
	            function clamp(val, length) {
	                val = (val | 0) || 0;

	                if (val < 0) {
	                    return Math.max(val + length, 0);
	                }

	                return Math.min(val, length);
	            }

	            ArrayBuffer.prototype.slice = function (from, to) {
	                var length = this.byteLength,
	                    begin = clamp(from, length),
	                    end = length,
	                    num,
	                    target,
	                    targetArray,
	                    sourceArray;

	                if (to !== undefined$1) {
	                    end = clamp(to, length);
	                }

	                if (begin > end) {
	                    return new ArrayBuffer(0);
	                }

	                num = end - begin;
	                target = new ArrayBuffer(num);
	                targetArray = new Uint8Array(target);

	                sourceArray = new Uint8Array(this, begin, num);
	                targetArray.set(sourceArray);

	                return target;
	            };
	        })();
	    }

	    // ---------------------------------------------------

	    /**
	     * Helpers.
	     */

	    function toUtf8(str) {
	        if (/[\u0080-\uFFFF]/.test(str)) {
	            str = unescape(encodeURIComponent(str));
	        }

	        return str;
	    }

	    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
	        var length = str.length,
	           buff = new ArrayBuffer(length),
	           arr = new Uint8Array(buff),
	           i;

	        for (i = 0; i < length; i += 1) {
	            arr[i] = str.charCodeAt(i);
	        }

	        return returnUInt8Array ? arr : buff;
	    }

	    function arrayBuffer2Utf8Str(buff) {
	        return String.fromCharCode.apply(null, new Uint8Array(buff));
	    }

	    function concatenateArrayBuffers(first, second, returnUInt8Array) {
	        var result = new Uint8Array(first.byteLength + second.byteLength);

	        result.set(new Uint8Array(first));
	        result.set(new Uint8Array(second), first.byteLength);

	        return returnUInt8Array ? result : result.buffer;
	    }

	    function hexToBinaryString(hex) {
	        var bytes = [],
	            length = hex.length,
	            x;

	        for (x = 0; x < length - 1; x += 2) {
	            bytes.push(parseInt(hex.substr(x, 2), 16));
	        }

	        return String.fromCharCode.apply(String, bytes);
	    }

	    // ---------------------------------------------------

	    /**
	     * SparkMD5 OOP implementation.
	     *
	     * Use this class to perform an incremental md5, otherwise use the
	     * static methods instead.
	     */

	    function SparkMD5() {
	        // call reset to init the instance
	        this.reset();
	    }

	    /**
	     * Appends a string.
	     * A conversion will be applied if an utf8 string is detected.
	     *
	     * @param {String} str The string to be appended
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.append = function (str) {
	        // Converts the string to utf8 bytes if necessary
	        // Then append as binary
	        this.appendBinary(toUtf8(str));

	        return this;
	    };

	    /**
	     * Appends a binary string.
	     *
	     * @param {String} contents The binary string to be appended
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.appendBinary = function (contents) {
	        this._buff += contents;
	        this._length += contents.length;

	        var length = this._buff.length,
	            i;

	        for (i = 64; i <= length; i += 64) {
	            md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
	        }

	        this._buff = this._buff.substring(i - 64);

	        return this;
	    };

	    /**
	     * Finishes the incremental computation, reseting the internal state and
	     * returning the result.
	     *
	     * @param {Boolean} raw True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.prototype.end = function (raw) {
	        var buff = this._buff,
	            length = buff.length,
	            i,
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	            ret;

	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
	        }

	        this._finish(tail, length);
	        ret = hex(this._hash);

	        if (raw) {
	            ret = hexToBinaryString(ret);
	        }

	        this.reset();

	        return ret;
	    };

	    /**
	     * Resets the internal state of the computation.
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.reset = function () {
	        this._buff = '';
	        this._length = 0;
	        this._hash = [1732584193, -271733879, -1732584194, 271733878];

	        return this;
	    };

	    /**
	     * Gets the internal state of the computation.
	     *
	     * @return {Object} The state
	     */
	    SparkMD5.prototype.getState = function () {
	        return {
	            buff: this._buff,
	            length: this._length,
	            hash: this._hash
	        };
	    };

	    /**
	     * Gets the internal state of the computation.
	     *
	     * @param {Object} state The state
	     *
	     * @return {SparkMD5} The instance itself
	     */
	    SparkMD5.prototype.setState = function (state) {
	        this._buff = state.buff;
	        this._length = state.length;
	        this._hash = state.hash;

	        return this;
	    };

	    /**
	     * Releases memory used by the incremental buffer and other additional
	     * resources. If you plan to use the instance again, use reset instead.
	     */
	    SparkMD5.prototype.destroy = function () {
	        delete this._hash;
	        delete this._buff;
	        delete this._length;
	    };

	    /**
	     * Finish the final calculation based on the tail.
	     *
	     * @param {Array}  tail   The tail (will be modified)
	     * @param {Number} length The length of the remaining buffer
	     */
	    SparkMD5.prototype._finish = function (tail, length) {
	        var i = length,
	            tmp,
	            lo,
	            hi;

	        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
	        if (i > 55) {
	            md5cycle(this._hash, tail);
	            for (i = 0; i < 16; i += 1) {
	                tail[i] = 0;
	            }
	        }

	        // Do the final computation based on the tail and length
	        // Beware that the final length may not fit in 32 bits so we take care of that
	        tmp = this._length * 8;
	        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
	        lo = parseInt(tmp[2], 16);
	        hi = parseInt(tmp[1], 16) || 0;

	        tail[14] = lo;
	        tail[15] = hi;
	        md5cycle(this._hash, tail);
	    };

	    /**
	     * Performs the md5 hash on a string.
	     * A conversion will be applied if utf8 string is detected.
	     *
	     * @param {String}  str The string
	     * @param {Boolean} raw True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.hash = function (str, raw) {
	        // Converts the string to utf8 bytes if necessary
	        // Then compute it using the binary function
	        return SparkMD5.hashBinary(toUtf8(str), raw);
	    };

	    /**
	     * Performs the md5 hash on a binary string.
	     *
	     * @param {String}  content The binary string
	     * @param {Boolean} raw     True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.hashBinary = function (content, raw) {
	        var hash = md51(content),
	            ret = hex(hash);

	        return raw ? hexToBinaryString(ret) : ret;
	    };

	    // ---------------------------------------------------

	    /**
	     * SparkMD5 OOP implementation for array buffers.
	     *
	     * Use this class to perform an incremental md5 ONLY for array buffers.
	     */
	    SparkMD5.ArrayBuffer = function () {
	        // call reset to init the instance
	        this.reset();
	    };

	    /**
	     * Appends an array buffer.
	     *
	     * @param {ArrayBuffer} arr The array to be appended
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
	        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
	            length = buff.length,
	            i;

	        this._length += arr.byteLength;

	        for (i = 64; i <= length; i += 64) {
	            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
	        }

	        this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);

	        return this;
	    };

	    /**
	     * Finishes the incremental computation, reseting the internal state and
	     * returning the result.
	     *
	     * @param {Boolean} raw True to get the raw string, false to get the hex string
	     *
	     * @return {String} The result
	     */
	    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
	        var buff = this._buff,
	            length = buff.length,
	            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	            i,
	            ret;

	        for (i = 0; i < length; i += 1) {
	            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
	        }

	        this._finish(tail, length);
	        ret = hex(this._hash);

	        if (raw) {
	            ret = hexToBinaryString(ret);
	        }

	        this.reset();

	        return ret;
	    };

	    /**
	     * Resets the internal state of the computation.
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.reset = function () {
	        this._buff = new Uint8Array(0);
	        this._length = 0;
	        this._hash = [1732584193, -271733879, -1732584194, 271733878];

	        return this;
	    };

	    /**
	     * Gets the internal state of the computation.
	     *
	     * @return {Object} The state
	     */
	    SparkMD5.ArrayBuffer.prototype.getState = function () {
	        var state = SparkMD5.prototype.getState.call(this);

	        // Convert buffer to a string
	        state.buff = arrayBuffer2Utf8Str(state.buff);

	        return state;
	    };

	    /**
	     * Gets the internal state of the computation.
	     *
	     * @param {Object} state The state
	     *
	     * @return {SparkMD5.ArrayBuffer} The instance itself
	     */
	    SparkMD5.ArrayBuffer.prototype.setState = function (state) {
	        // Convert string to buffer
	        state.buff = utf8Str2ArrayBuffer(state.buff, true);

	        return SparkMD5.prototype.setState.call(this, state);
	    };

	    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

	    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

	    /**
	     * Performs the md5 hash on an array buffer.
	     *
	     * @param {ArrayBuffer} arr The array buffer
	     * @param {Boolean}     raw True to get the raw string, false to get the hex one
	     *
	     * @return {String} The result
	     */
	    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
	        var hash = md51_array(new Uint8Array(arr)),
	            ret = hex(hash);

	        return raw ? hexToBinaryString(ret) : ret;
	    };

	    return SparkMD5;
	}));
	});

	class BMF {
	  md5(file, md5Fn, progressFn) {
	    this.aborted = false;
	    this.progress = 0;
	    let currentChunk = 0;
	    const blobSlice =
	      File.prototype.slice ||
	      File.prototype.mozSlice ||
	      File.prototype.webkitSlice;
	    const chunkSize = 2097152;
	    const chunks = Math.ceil(file.size / chunkSize);
	    const spark = new sparkMd5.ArrayBuffer();
	    const reader = new FileReader();

	    loadNext();

	    reader.onloadend = e => {
	      spark.append(e.target.result); // Append array buffer
	      currentChunk++;
	      this.progress = currentChunk / chunks;

	      if (progressFn && typeof progressFn === 'function') {
	        progressFn(this.progress);
	      }

	      if (this.aborted) {
	        md5Fn('aborted');
	        return
	      }

	      if (currentChunk < chunks) {
	        loadNext();
	      } else {
	        md5Fn(null, spark.end());
	      }
	    };

	    /////////////////////////
	    function loadNext() {
	      const start = currentChunk * chunkSize;
	      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
	      reader.readAsArrayBuffer(blobSlice.call(file, start, end));
	    }
	  }

	  abort() {
	    this.aborted = true;
	  }
	}

	/**
	 * 存储全局配置信息
	 */

	var Config = {},
	    LIST_ITEM = '.dui-upload-list__item',
	    UPLOAD_LIST = 'dui-upload-list',
	    PROGRESS_INNER = '.dui-progress-bar__inner',
	    PROGRESS_TEXT = '.dui-progress__text',
	    UPLOAD_DRAG = '.dui-upload-dragger',
	    browserMD5File = new BMF();
	/**
	 * 外部暴露接口
	 * @param {Object} options 参数
	 */

	function upload(options) {
	  var ins = new Class(options);
	  return thisUpload.call(ins);
	}
	/**
	 * 文件转base64的方法
	 * @param {File} blob 文件
	 * @param {Function} callback 回调函数
	 */


	function readBlobAsDataURL(blob, callback) {
	  var error = '',
	      ok = false,
	      url;
	  var a = new FileReader();

	  a.onerror = function (e) {
	    error = '转换错误';
	    ok = true;
	  };

	  a.onload = function (e) {
	    error = '';
	    ok = true;
	    url = e.target.result;
	  };

	  a.readAsDataURL(blob);
	  var timer = setInterval(function () {
	    if (ok === true) {
	      clearInterval(timer);
	      callback(error, url);
	    }
	  }, 10);
	}
	/**
	 * 内部创建方法
	 * @param {Object} options 参数
	 */


	function Class(options) {
	  var that = this,
	      config = that.config = $.extend(true, {
	    el: '',
	    //上传容器
	    server: '',
	    //必选参数，上传的地址
	    accept: 'images',
	    //允许上传的文件类型：images/file/video/audio
	    showFileList: true,
	    //控制是否显示文件列表
	    listType: 'text',
	    //列表显示样式
	    fileList: [],
	    //默认显示内容
	    autoUpload: true,
	    //自动上传
	    exts: '',
	    //允许上传的文件后缀名
	    headers: {},
	    //设置上传的请求头部
	    pick: '',
	    //选择文件按钮
	    pickText: '上传图片',
	    name: 'file',
	    //上传的文件字段名
	    data: {},
	    //上传额外带的参数
	    testChunks: false,
	    //是否在上传前使用get访问一下
	    drag: false,
	    //是否运行拖拽上传
	    onSuccess: '',
	    //上传成功回调
	    onError: '',
	    //上传错误的回调
	    onBefore: '',
	    //上传前的回调
	    onComplete: '',
	    //成功或者失败都会回调
	    onProgress: '',
	    //进度条回调
	    multiple: false,
	    //多图片上传
	    chunkSize: 1 * 1024 * 1024,
	    //单个分片上传的大小
	    maxFiles: undefined,
	    //最大可选file数量
	    resize: false
	  }, Config, options); // 渲染界面

	  that.render();
	}
	/**
	 * 渲染界面
	 */


	Class.prototype.render = function () {
	  var that = this,
	      config = that.config,
	      // 获得容器
	  el = that.el = $(config.el); // 主动抛出异常

	  if (!el[0]) throw new Error('upload initialization failed，Because there is no container.'); // 是否已经渲染过

	  var hasRender = that.innerHtml ? true : false; // 如果渲染过则覆盖掉

	  hasRender && el.html(that.innerHtml); // 设置当前innerhtml

	  that.innerHtml = el.html(); // 文件列表显示模板

	  that.listItemTpl = function (item, status) {
	    return ['<li class="dui-upload-list__item is-' + status + '">', function () {
	      if (config.listType == 'picture') {
	        return '<img src="' + item.url + '" alt="' + item.name + '" class="dui-upload-list__item-thumbnail">';
	      }

	      return '';
	    }(), '<a class="dui-upload-list__item-name"><i class="dui-icon-document"></i>' + item.name + '</a>', '<label class="dui-upload-list__item-status-label"><i class="dui-icon-upload-success dui-icon-' + (config.listType == 'text' ? 'circle-' : '') + 'check"></i></label>', '<i class="dui-icon-close"></i>', '</li>'].join('');
	  }; // 点击按钮的存储容器


	  that.uploadDom = $('<div class="dui-upload dui-upload-' + config.listType + '"></div>'); // 设置选择文件按钮，如果指定的元素存在则设置指定元素，如果不存在则找第一个元素，如果只有容器没有元素则创建上传按钮

	  that.pick = el.find(config.pick)[0] ? el.find(config.pick)[0] : el.children()[0] ? el.children()[0] : $('<button type="button" class="dui-button dui-button--primary dui-button--small">' + config.pickText + '</button>'); // 显示pick容器并且把pick放入容器中

	  el.prepend(that.uploadDom), that.uploadDom.append(that.pick); // 如果有设置列表展示

	  if (config.showFileList) {
	    var template = ['<ul class="dui-upload-list dui-upload-list--' + config.listType + '"></div>'].join(''),
	        showListDom = that.showListDom = el.find(UPLOAD_LIST)[0] ? el.find(UPLOAD_LIST) : $(template);
	    el.append(showListDom); // 如果有图片数据

	    if (config.fileList && config.fileList.length > 0) {
	      var res = [];
	      $.each(config.fileList, function (i, item) {
	        var temp = listItemTpl(item, 'success');
	        res.push(temp);
	      });
	      showListDom.append(res.join(''));
	    }
	  } // 上传库的配置


	  var options = {
	    target: config.server,
	    query: $.extend(true, {
	      form: 'dui.upload'
	    }, config.data),
	    simultaneousUploads: config.simultaneousUploads || 3,
	    //同时上传数量
	    fileParameterName: config.name,
	    //上传的file框名
	    chunkSize: config.chunkSize,
	    //单个分片大小
	    headers: config.headers,
	    //上传头
	    maxFiles: config.maxFiles,
	    //最大可选文件数量
	    testChunks: config.testChunks //上传前是否检查文件是否存在

	  }; // 创建上传库

	  that.r = new resumable(options); // 设置上传库的回调

	  that.setCallBack(); // 设置事件
	};
	/**
	 * 设置上传库回调
	 */


	Class.prototype.setCallBack = function () {
	  var that = this,
	      config = that.config,
	      r = that.r,
	      uploadDom = that.uploadDom,
	      pick = that.pick,
	      drag = that.el.find(UPLOAD_DRAG)[0] ? that.el.find(UPLOAD_DRAG)[0] : that.el[0]; // 设置上传按钮

	  r.assignBrowse(pick); // 如果允许拖拽上传

	  config.drag !== false && r.assignDrop(drag); // 添加了一个文件

	  r.on('fileAdded', function (file) {
	    var item = {
	      name: file.fileName,
	      url: ''
	    }; // 如果有预览功能

	    if (config.showFileList) {
	      readBlobAsDataURL(file.file, function (error, dataurl) {
	        if (error) {
	          item.url = '';
	        } else {
	          item.url = dataurl;
	        } // 预览模板


	        var tpl = $(that.listItemTpl(item, 'is-ready')); // 设置图片的唯一id

	        tpl[0].uploadId = file.uniqueIdentifier; // 添加显示

	        that.showListDom.append(tpl); // 进度条html

	        var prs = ['<div class="dui-progress dui-progress--line" style="display:none">', '<div class="dui-progress-bar">', '<div class="dui-progress-bar__outer" style="height: 2px;">', '<div class="dui-progress-bar__inner" style="width: 0%;">', '</div>', '</div>', '</div>', '<div class="dui-progress__text" style="font-size: 12.8px;">0%</div>', '</div>'].join(''),
	            progress = tpl[0].progress = $(prs); // 添加进度条

	        tpl.append(progress);
	      });
	    }

	    browserMD5File.md5(file.file, function (error, md5) {
	      r.opts.query.fileMd5 = md5;
	      file.file.fileMd5 = md5; // 设置设置了自动上传

	      if (config.autoUpload) {
	        var res = true;

	        if (config.onBefore && typeof config.onBefore === "function") {
	          res = config.onBefore.call(null, file);
	        }

	        if (res !== false) {
	          r.upload();
	        }
	      }
	    });
	  }); // 上传进度条

	  r.on('fileProgress', function (file) {
	    var percentage = file.progress(); // 如果有预览功能

	    if (config.showFileList) {
	      that.showListDom.find(LIST_ITEM).each(function (i, item) {
	        if (item.uploadId == file.uniqueIdentifier) {
	          item.progress.css('display', ''); // 进度条样式

	          $(item).find(PROGRESS_INNER).css('width', percentage * 100 + '%'); // 进度条文字

	          $(item).find(PROGRESS_TEXT).text(percentage * 100 + '%');
	        }
	      });
	    }

	    if (config.onProgress && typeof config.onProgress === "function") {
	      config.onProgress.call(null, file, percentage);
	    }
	  }); // 文件上传成功

	  r.on('fileSuccess', function (file, msg) {
	    // 如果有预览功能
	    if (config.showFileList) {
	      // 删除掉显示文件
	      that.showListDom.find(LIST_ITEM).each(function (i, item) {
	        if (item.uploadId == file.uniqueIdentifier) {
	          $(item).removeClass('is-uploading').addClass('is-success');
	          item.progress.remove();
	        }
	      });
	    }

	    if (config.onSuccess && typeof config.onSuccess === "function") {
	      config.onSuccess.call(null, file, JSON.parse(msg));
	    }
	  }); // 上传错误

	  r.on('fileError', function (file, msg) {
	    // 如果有预览功能
	    if (config.showFileList) {
	      // 删除掉显示文件
	      that.showListDom.find(LIST_ITEM).each(function (i, item) {
	        if (item.uploadId == file.uniqueIdentifier) {
	          item.remove();
	        }
	      });
	    }

	    if (config.onError && typeof config.onError === "function") {
	      config.onError.call(null, file, msg);
	    }
	  });
	};
	/**
	 * 手动上传
	 */


	Class.prototype.upload = function () {
	  var that = this,
	      r = that.r;
	  r.upload();
	};
	/**
	 * 手动暂停
	 */


	Class.prototype.pause = function () {
	  var that = this,
	      r = that.r;
	  r.pause();
	};
	/**
	 * 取消上传
	 */


	Class.prototype.cancel = function () {
	  var that = this,
	      r = that.r;
	  r.cancel();
	};
	/**
	 * 返回的外部暴露接口
	 */


	function thisUpload() {
	  var that = this;
	  return {
	    config: that.config,
	    upload: function upload() {
	      that.upload.call(that);
	    },
	    pause: function pause() {
	      that.pause.call(that);
	    },
	    cancel: function cancel() {
	      that.cancel.call(that);
	    }
	  };
	}
	/**
	 * 设置配置信息
	 */


	upload.config = function (options) {
	  Config = $.extend(true, Config, options);
	  return this;
	};
	/**
	 * 渲染界面
	 * @param {Object} options 配置信息
	 */


	upload.render = function (options) {
	  return upload(options);
	};

	return upload;

}));