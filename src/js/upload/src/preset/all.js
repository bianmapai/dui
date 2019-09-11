/**
 * 完全版本
 */
import { Base } from "../base";
// widgets
import "../widgets/filednd";
import '../widgets/filepaste';
import '../widgets/filepicker';
import '../widgets/image';
import '../widgets/queue';
import '../widgets/runtime';
import '../widgets/upload';
import '../widgets/validator';
import '../widgets/md5';

// runtimes
// html5
import '../runtime/html5/blob';
import '../runtime/html5/dnd';
import '../runtime/html5/filepaste';
import '../runtime/html5/filepicker';
import '../runtime/html5/imagemeta/exif';
import '../runtime/html5/androidpatch';
import '../runtime/html5/image';
import '../runtime/html5/transport';
import '../runtime/html5/md5';

// flash
import '../runtime/flash/filepicker';
import '../runtime/flash/image';
import '../runtime/flash/transport';
import '../runtime/flash/blob';
import '../runtime/flash/md5'

export default Base;