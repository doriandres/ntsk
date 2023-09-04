const path = require('path');
const { Worker, isMainThread, threadId, workerData, parentPort } = require('worker_threads');
const { SourceMapGenerator } = require('source-map');
function getCallerDetails() {
    const prepareStackTrace = Error.prepareStackTrace;
    const err = new Error();
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = err.stack;
    Error.prepareStackTrace = prepareStackTrace;
    const callerDetails = stack[2];
    const filename = callerDetails.getFileName();
    const lineNm = callerDetails.getLineNumber();
    const colNm = callerDetails.getColumnNumber();
    return { filename, lineNm, colNm }
}
module.exports.task = (args, task) => {
    const { filename, lineNm, colNm } = getCallerDetails();
    const dirname = path.dirname(filename);
    return new Promise((resolve, reject) => {
        if (args === undefined || args === null) {
            args = {};
        }
        if (typeof task !== 'function') {
            throw new TypeError('task must be a function');
        }
        try {
            JSON.stringify(args);
        } catch {
            throw new TypeError('args must be JSON serializable');
        }
        const worker = new Worker(__filename, { workerData: { args, taskCode: task.toString(), filename, dirname, lineNm, colNm } });
        worker.once('error', (error) => {
            worker.terminate();
            reject(error);
        });
        worker.once('messageerror', (error) => {
            worker.terminate();
            reject(error);
        });
        worker.once('message', (result) => {
            worker.terminate();
            resolve(result);
        });
    });
}
if (!isMainThread) {
    async function runner() {
        try {
            let srcMapCode = '';
            if (process.env.NODE_ENV === 'development') {
                var map = new SourceMapGenerator();
                map.addMapping({
                    source: workerData.filename,
                    original: { line: workerData.lineNm, column: workerData.colNm },
                    generated: { line: 1, column: 1 }
                });
                srcMapCode = `//# sourceURL=${workerData.filename}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(map.toString(), 'utf8').toString('base64')}\n`;
            }
            const vmCode = `${srcMapCode}${workerData.taskCode}`;
            const task = eval(vmCode);
            let result = await task({
                threadId,
                __filename: workerData.filename,
                __dirname: workerData.dirname,
                require: (id) => require(id.startsWith('.') ? path.resolve(workerData.dirname, id) : id)
            },
                workerData.args
            );
            parentPort.postMessage(result);
        } catch (error) {
            parentPort.emit('messageerror', error);
        }
    }
    runner();
}