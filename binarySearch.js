// should be sorted array
function binarySearch(array, target) {
    if (array.length <= 10) {
        return array.includes(target);
    }
    const middleIndex = Math.floor(array.length / 2)
    const middle = array[middleIndex];
    if (target < middle) {
        return binarySearch(array.slice(0, middleIndex), target);
    } else {
        return binarySearch(array.slice(middleIndex), target);
    }
}


(() => {
    const array = Array(1e5).fill(0).map((_, index) => index);
    const targets = array.filter((val) => val % 7 === 0)
    console.time('include-all')
    for (let i = 0; i < targets.length; i++) {
        // console.time('include');
        const res = array.includes(targets[i]);
        // console.timeEnd('include');
    }
    console.timeEnd('include-all');

    console.time('binary-search-all');
    for (let i = 0; i < targets.length; i++) {
        // console.time('binary-search');
        const res = binarySearch(array, targets[i]);
        // console.timeEnd('binary-search');
    }
    console.timeEnd('binary-search-all');
})();