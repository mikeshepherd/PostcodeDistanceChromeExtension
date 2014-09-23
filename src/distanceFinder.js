var DistanceFinder = function () {
    function cleanArray(actual) {
        var newArray = [];
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }

    this.queryDistance = function (postcodes, callback) {
        chrome.storage.sync.get({
            unit: 'imperial',
            home: "SW1A1AA"
        }, function (settings) {
            var request = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=";
            request = request + settings.home.replace(/\s+/g, '');
            request = request + "&destinations=";
            request = request + postcodes.map(function (postcode) {
                return postcode.replace(/\s+/g, '')
            }).toString().replace(/,/g, '|');
            request = request + "&mode=driving";
            request = request + "&units=" + settings.unit;
            console.log("Sending request " + request);
            $.getJSON(request, function (jd) {
                var distances = postcodes.map(function (postcode, index) {
                    var element = jd.rows[0].elements[index];
                    if (element.status === 'OK') {
                        return {postcode: postcode, distance: jd.rows[0].elements[index].distance.text}
                    }
                });
                callback(cleanArray(distances));
            });
        });
    }
};

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        var db = new DistanceFinder();
        if (request.type === 'state') {
            sendResponse({
                'isOn': true
            });
        } else if (request.type === 'postcodes') {
            db.queryDistance(request.postcodes, function (distances) {
                sendResponse({'distances': distances});
            });
        }
        // have to return true to be able to send response in async callback
        return true;
    }
);


// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function () {
    var optionsUrl = chrome.extension.getURL('src/options.html');
    chrome.tabs.query({}, function (extensionTabs) {
        var found = false;
        for (var i = 0; i < extensionTabs.length; i++) {
            if (optionsUrl == extensionTabs[i].url) {
                found = true;
                chrome.tabs.update(extensionTabs[i].id, {"selected": true});
            }
        }
        if (found == false) {
            chrome.tabs.create({url: "src/options.html"});
        }
    });
});
