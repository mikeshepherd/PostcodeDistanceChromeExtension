var PostcodeDetector = function () {

    // Permitted letters depend upon their position in the postcode.
    var alpha1 = "[abcdefghijklmnoprstuwyz]";                       // Character 1
    var alpha2 = "[abcdefghklmnopqrstuvwxy]";                       // Character 2
    var alpha3 = "[abcdefghjkpmnrstuvwxy]";                         // Character 3
    var alpha4 = "[abehmnprvwxy]";                                  // Character 4
    var alpha5 = "[abdefghjlnpqrstuwxyz]";                          // Character 5
    var BFPOa5 = "[abdefghjlnpqrst]";                               // BFPO alpha5
    var BFPOa6 = "[abdefghjlnpqrstuwzyz]";                          // BFPO alpha6

    // Array holds the regular expressions for the valid postcodes
    var pcexp = [];

    // BFPO postcodes
    pcexp.push(new RegExp("^(bf1)(\\s*)([0-6]{1}" + BFPOa5 + "{1}" + BFPOa6 + "{1})$", "i"));

    // Expression for postcodes: AN NAA, ANN NAA, AAN NAA, and AANN NAA
    pcexp.push(new RegExp("^(" + alpha1 + "{1}" + alpha2 + "?[0-9]{1,2})(\\s*)([0-9]{1}" + alpha5 + "{2})$", "i"));

    // Expression for postcodes: ANA NAA
    pcexp.push(new RegExp("^(" + alpha1 + "{1}[0-9]{1}" + alpha3 + "{1})(\\s*)([0-9]{1}" + alpha5 + "{2})$", "i"));

    // Expression for postcodes: AANA  NAA
    pcexp.push(new RegExp("^(" + alpha1 + "{1}" + alpha2 + "{1}" + "?[0-9]{1}" + alpha4 + "{1})(\\s*)([0-9]{1}" + alpha5 + "{2})$", "i"));

    // Exception for the special postcode GIR 0AA
    pcexp.push(/^(GIR)(\s*)(0AA)$/i);

    // Standard BFPO numbers
    pcexp.push(/^(bfpo)(\s*)([0-9]{1,4})$/i);

    // c/o BFPO numbers
    pcexp.push(/^(bfpo)(\s*)(c\/o\s*[0-9]{1,3})$/i);

    // Overseas Territories
    pcexp.push(/^([A-Z]{4})(\s*)(1ZZ)$/i);

    // Anguilla
    pcexp.push(/^(ai-2640)$/i);

    var cssClass = function (postcode) {
        // convert quantity to css class.
        // only get the digits/units, keep dashes for negative things, and
        // change all decimals to dashes
        var append = postcode.match(/\w|\.|\-/g).join('').replace('.', '-');
        return 'postcode-distance-' + append;
    };

    var querySuccess = function () {
        return _.bind(function (response) {
            if (!response) {
                throw 'error when connecting to background page';
            }
            var distances = response.distances;
            console.dir(distances);
            distances.forEach(function (item) {
                var postcode = item.postcode;
                var distance = item.distance;
                // DOM manipulations
                // look for things marked for lookup that haven't already had a
                // human-readable synonym of the number appended
                var $postcode = $('.postcode-distance.' + cssClass(postcode) + ':not(.postcode-distance-processed)');

                var distanceElem = '<dfn> (' + distance + ')</dfn>';
                $postcode.append(distanceElem);

                $postcode.addClass('postcode-distance-processed');
            }, this);
        }, this);
    };

    var queue = new Queue(100, function (postcodes) {
        chrome.extension.sendMessage(
            {
                type: 'postcodes',
                postcodes: postcodes
            },
            querySuccess()
        );
    });

    this.lookupInElement = function ($element) {

        // go through each match, parse the postcode and query
        // replace the original text with an element for later
        var replacerFunction = _.bind(function ($textMatchNode, textMatch) {
            var postcode = textMatch;//.replace(/\s+/g, '');
            var $wrapper = $('<dfn class="postcode-distance">');

            $wrapper.addClass(cssClass(postcode));

            console.log("Found postcode " + postcode);

            queue.push(postcode);

            var textToWrap = textMatch;
            textToWrap = _.str.trim(textToWrap);
            // wrap just the text we want in wrapper for later querying
            $textMatchNode.safeReplace(textToWrap, function ($postcodeNode) {
                $postcodeNode.wrap($wrapper);
            });

        }, this);
        // traverse the visible elements in the body looking for matches
        _.each(pcexp, function (re) {
            $element.safeReplace(
                re,
                replacerFunction,
                'dfn'
            );
        });
        queue.force();
    };
};
