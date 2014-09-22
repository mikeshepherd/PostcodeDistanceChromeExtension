var Queue = function (batchSize, processCallback) {

    var queue = [];

    var dequeue = function() {
        if (queue.length > 0) {
            var items = queue.slice(0);
            processCallback(items);
            queue = [];
        }
    };

    this.push = function (item) {
        queue.push(item);
        if (queue.length >= batchSize) {
            dequeue();
        }
    };

    this.force = function () {
        dequeue();
    };

    return this;
};
