import { createInterface } from 'readline';
import { createReadStream, createWriteStream, readFile } from 'fs';

function countFileLines(filepath) {
    return new Promise((resolve, reject) => {
        const input = createReadStream(filepath);
        let count = 0;
        input.on('data', (chunk) => {
            for (let i = 0; i < chunk.length; i++) {
                // 10 is ascii code for new line
                if (chunk[i] === 10) {
                    count++
                }
            }
        })
        input.on('error', reject)
        input.on('end', () => {
            resolve(count);
        })
    })
}

function readlinePromise(filepath, lineStart, lineEnd = undefined) {
    return new Promise((resolve, reject) => {
        const input = createReadStream(filepath);
        const rl = createInterface({ input })
        let targetLine = 0;
        const lines = [];
        rl.on('line', (line) => {
            targetLine++;
            if (!lineEnd) {
                if (targetLine === lineStart) {
                    rl.close()
                    input.close()
                    resolve(line);
                }
            } else {
                if (targetLine >= lineStart) {
                    lines.push(line);
                    if (targetLine === lineEnd) {
                        rl.close();
                        input.close();
                        resolve(lines);
                    }
                }
            }
        })
        rl.on('error', reject)
        rl.on('end', () => {
            if (!lineEnd) {
                reject();
            } else {
                resolve(lines);
            }
        });
    })
}

async function binarySearch(filepath, lineStart, lineEnd, target) {
    if (lineEnd - lineStart < 300) {
        const lines = await readlinePromise(filepath, lineStart, lineEnd);
        return lines.includes(target);
    }
    const middleIndex = lineStart + Math.floor((lineEnd - lineStart) / 2);
    const middle = await readlinePromise(filepath, middleIndex);
    if (target === parseInt(middle, 10)) {
        return true;
    } else if (target < middle) {
        return await binarySearch(filepath, lineStart, middleIndex, target);
    } else {
        return await binarySearch(filepath, middleIndex, lineEnd, target);
    }
}

function includeFile(filepath, target) {
    return new Promise((resolve, reject) => {
        readFile(filepath, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.split('\n').includes(target))
        })
    })
}

(async () => {
    const filepath = 'array.txt'
    let array = Array(1e5).fill(0).map((val, index) => index);

    // const file = createWriteStream(filepath);
    // array.forEach((val) => file.write(`${val}\n`));
    // file.end();
    array = array.filter((val) => val % 11 === 0);

    console.time('include');
    for (let i = 0; i < array.length; i++) {
        await includeFile(filepath, array[i]);
    }
    console.timeEnd('include');

    console.time('readline');
    const count = await countFileLines(filepath);
    for (let i = 0; i < array.length; i++) {
        await binarySearch(filepath, 0, count, array[i]);
    }
    console.timeEnd('readline');
})();