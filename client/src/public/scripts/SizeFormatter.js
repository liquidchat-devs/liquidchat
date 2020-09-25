function formatBytes(bytes, appendSize) {
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if(appendSize === undefined) { appendSize = false; }
    if(bytes === 0) { return bytes + (appendSize ? ' ' + sizes[0] : '') }

    var i = Math.floor(Math.log(bytes) / Math.log(k));
    var result = parseFloat((bytes / (k ** i)).toFixed(2));
    return result + (appendSize ? ' ' + sizes[i] : '');
}

export { formatBytes }