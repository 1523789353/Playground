/**
 * 防抖hook
 * 在busyTime时间内, 只会执行一次, 如果在busyTime时间内再次调用, 统一返回下次执行的结果
 * @type {<T extends function>() => T}
 * @param {T} fn 需要限制执行频率的函数
 * @param {number} busyTime 忙碌时间, 单位毫秒
 * @param {boolean} immediate 是否立即执行, 默认为true
 * @returns {T} 被代理的函数, 执行结果是一个Promise
 */
function throttle(fn, busyTime, immediate = true) {
	let state = "idle"; // 当前的状态, idle表示空闲, busy表示忙碌
	let timeout = setTimeout; // 异步执行的方法, 可以根据需要修改
	let timer = null; // 定时器的变量, 用于清除定时
	let task = null; // 当前的任务, 是一个函数
	let result = null; // 当前任务的返回值, 是一个Promise
	let resolve = null; // 用于通知外部任务已经完成
	let reject = null; // 用于通知外部任务失败

	// 重置所有状态和属性
	function resetAll() {
		state = 'idle';
		timer = null;
		resetTask();
	}

	// 重设任务及其结果
	function resetTask() {
		task = null;
		result = null;
		resolve = null;
		reject = null;
	}

	// 周期末尾任务执行器
	function tailExecutor() {
		// 清除定时器, 防止内存泄漏
		if (timeout == setTimeout) {
			clearTimeout(timer);
		}
		// 若无任务则重置所有状态和属性
		if (task == null) {
			resetAll();
			return;
		}
		// 在一个周期结束后检查是否有新任务, 如果有则执行
		timer = timeout(tailExecutor, busyTime);
		// 执行当前周期最末尾的任务
		execute();
	}

	// 执行任务
	function execute() {
		// 保存当前任务及其结果
		let execute = { task, result, resolve, reject };
		// 重置任务及其结果
		resetTask();
		// 执行任务, 用Promise.resolve包裹, 以支持异步函数
		Promise.resolve(execute.task())
			.then((value) => {
				// 在fn成功时, 通知外部任务已经完成
				execute.resolve(value);
			})
			.catch((error) => {
				// 在fn失败时打印错误信息到控制台
				console.error(error);
				// 通知外部任务失败, 以便后续处理
				execute.reject(error);
			});
	}

	function handler(target, thisArg, args) {
		// 保存当前任务, 在busy状态下会覆盖上一个任务
		task = target.bind(thisArg, ...args);
		// 如果result为空, 则创建一个Promise, 否则复用之前的Promise.
		result ??= new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});
		if (state == 'idle') {
			// 设置状态为busy
			state = "busy";
			// 在一个周期结束后检查是否有新任务, 如果有则执行
			timer = timeout(tailExecutor, busyTime);
			if (immediate) {
				// 如果immediate为true, 则立即执行
				execute();
			}
		}
		return result;
	}

	return new Proxy(fn, { apply: handler });
}




// 创建 MediaSource 对象
let mediaSource = new MediaSource();
// 将 MediaSource 的 URL 赋给 video 元素
let video = document.getElementById('video');
// video.srcObject = mediaSource;
video.src = URL.createObjectURL(mediaSource);

let fileSize = 0; // 视频文件的总大小

// 监听 sourceopen 事件
mediaSource.addEventListener('sourceopen', sourceOpen);

function formatSize(size) {
	size = parseFloat(size);
	if (Number.isNaN(size)) return 'null';
	const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB', 'CB'];
	let index = 0;
	while (size >= 1024) {
		size /= 1024;
		index++;
	}
	return `${+size.toFixed(3)} ${unit[index]}`;
}

function sourceOpen() {
    // MimeCodec 的意义 https://www.jackpu.com/web-video-mimetype-jiu-jing-dai-biao-shi-yao-yi-si/
    // avc1.42E01E的含义: https://blog.csdn.net/qq_34754747/article/details/122617904
    let h264 = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    let h265 = 'video/mp4; codecs="hev1.1.2.L93.90, mp4a.40.2"';
    let mime = h265;
	// 创建 SourceBuffer 对象
	let sourceBuffer = mediaSource.addSourceBuffer(mime);
	// 定义视频文件 URL 和分段大小
    let videoUrl = 'frag-av249486081-c378689118-lua.flv720.bili2api.64.mp4';
	let chunkSize = 1024 * 1024; // 每次请求 32MB 的数据
	// 定义请求起始位置和结束位置
	let startByte = 0;
	let endByte = chunkSize;

	// 发送带有 Range 头部的请求
	function fetchRange(url, start, end) {
		console.log(`Fetching ${start}(${formatSize(start)}) to ${end}(${formatSize(end)}), Full: ${fileSize}(${formatSize(fileSize)})`);
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.responseType = 'arraybuffer';
		xhr.setRequestHeader('Range', `bytes=${start}-${end}`);
		xhr.send();

		// 监听 progress 事件
		xhr.addEventListener('load', function (e) {
            let promise = new Promise((resolve, reject) => {
                if (xhr.status === 200 || xhr.status === 206) {
                    // 将获取到的数据追加到 SourceBuffer 中
                    if (mediaSource.readyState == 'closed') {
                        endByte = fileSize;
                        throw new Error('MediaSource is closed');
                    }
                    function appendBuffer() {
                        // 往 SourceBuffer 中追加数据
                        sourceBuffer.appendBuffer(xhr.response);
                        console.log(`Appended ${e.loaded} bytes to buffer. (${formatSize(startByte)} to ${formatSize(startByte + e.loaded)})`);
                        resolve();
                    }
                    if (sourceBuffer.updating) {
                    // 监听 updateend 事件
                        sourceBuffer.addEventListener('updateend', appendBuffer);
                    } else {
                        appendBuffer();
                    }
                } else {
                    reject();
                }
            }).then(() => {
                function nextTurn() {
                    sourceBuffer.removeEventListener('updateend', nextTurn);
                    console.log(sourceBuffer);
                    if (endByte < fileSize) {
                        // 更新请求起始位置和结束位置
                        startByte += e.loaded;
                        endByte += e.loaded;
                        if (endByte > fileSize) {
                            endByte = fileSize;
                        }
                        // 继续发送下一个分段请求
                        fetchRange(videoUrl, startByte, endByte);
                    } else {
                        // 结束 MediaSource 流程
                        if (mediaSource.readyState == 'open') {
                            mediaSource.endOfStream();
                        }
                    }
                }
                if (sourceBuffer.updating) {
                    // 监听 updateend 事件
                    sourceBuffer.addEventListener('updateend', nextTurn);
                } else {
                    nextTurn();
                }
            }).catch((e) => {
                console.error(e);
                if (sourceBuffer.updating) {
                    function callback() {
                        sourceBuffer.removeEventListener('updateend', callback);
                        fetchRange(videoUrl, startByte, endByte)
                    }
                    // 监听 updateend 事件
                    sourceBuffer.addEventListener('updateend', callback);
                } else {
                    fetchRange(videoUrl, startByte, endByte);
                }
            });
            return promise;
		});

		// 监听 error 事件
		xhr.addEventListener('error', function () {
			console.log('Error fetching data: ' + xhr.statusText);
		});
	}
	fetchRange = throttle(fetchRange, 500, true);

	// 获取视频文件的总大小
	let xhrHead = new XMLHttpRequest();
	xhrHead.open("HEAD", videoUrl);
	xhrHead.addEventListener('load', function (e) {
		fileSize = xhrHead.getResponseHeader("Content-Length");
		// 开始加载第一部分视频文件。
		fetchRange(videoUrl, startByte, endByte);
	});
	xhrHead.send();
	// 开始发送第一个分段请求
}

// let $video = document.querySelector("#video"); // 获取video元素
// let url = "video.mp4"; // 视频文件的URL
// let fileSize = 0; // 视频文件的总大小
// let chunkSize = 32 * 1024 * 1024; // 每次请求的字节大小
// let offset = 0; // 当前请求的起始位置
// let blobUrl = null; // Blob URL

// // 获取视频文件的一部分，并创建Blob URL
// function loadChunk() {
// 	let xhrGet = new XMLHttpRequest();
// 	xhrGet.open("GET", url);
// 	xhrGet.responseType = "blob";
// 	let end = offset + chunkSize;
// 	if (end > fileSize) {
// 		end = fileSize;
// 	}
// 	xhrGet.setRequestHeader("Range", "bytes=" + offset + "-" + (end - 1));
// 	xhrGet.onload = function () {
// 		if (blobUrl) {
// 			// 回收上一个Blob URL
// 			URL.revokeObjectURL(blobUrl);
// 		}
// 		// 创建新的Blob URL
// 		blobUrl = URL.createObjectURL(xhrGet.response);
// 		// 替换video元素src
// 		$video.src = blobUrl;
// 		// 更新当前请求的起始位置
// 		offset += chunkSize;
// 		if (offset < fileSize) {
// 			// 监听timeupdate事件，检查缓冲情况
// 			$video.addEventListener("timeupdate", checkBuffer);
// 		}
// 	};
// 	xhrGet.send();
// }

// // 检查缓冲情况，缓冲不足则加载下一部分视频文件
// function checkBuffer() {
// 	// 计算已缓冲时间
// 	let bufferedTime = $video.buffered.end($video.buffered.length - 1);
// 	if (bufferedTime - $video.currentTime < 5) {
// 		loadChunk();
// 		// 移除事件监听器。
// 		$video.removeEventListener("timeupdate", checkBuffer);
// 	}
// }

// // 如果用户跳转到未缓冲的位置，则重新加载对应部分视频文件。
// $video.addEventListener("seeking", function () {
// 	let timeRanges = $video.buffered;

// 	for (let i = 0; i < timeRanges.length; i++) {
// 		if ($video.currentTime >= timeRanges.start(i) && $video.currentTime <= timeRanges.end(i)) {
// 			return; //在已缓冲范围内，不做任何操作。
// 		}
// 	}
// 	//根据当前播放时间计算对应请求的起始位置。
// 	offset = Math.floor($video.currentTime / fileSize * chunkSize);
// 	//加载对应部分视频文件。
// 	loadChunk();
// });

// // 获取视频文件的总大小
// let xhrHead = new XMLHttpRequest();
// xhrHead.open("HEAD", url);
// xhrHead.onload = function () {
// 	fileSize = xhrHead.getResponseHeader("Content-Length");
// 	// 开始加载第一部分视频文件。
// 	loadChunk();
// };
// xhrHead.send();
