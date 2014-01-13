/**
 * jQuery plugin to convert a given $.ajax response xml object to json.
 *
 * @example var json = $.xml2json(response);
 */
(function() {
    jQuery.extend({
        /**w
         * Converts an xml response object from a $.ajax() call to a JSON object.
         *
         * @param xml
         */
        xml2json: function xml2json(xml) {
            var result = {};

            for (var i = 0, len = xml.childNodes.length; i < len; i++) {
                var node = xml.childNodes[i];
                if (node) {
                    if (node.nodeType === 1) {
                        var child = node.hasChildNodes() ? xml2json(node) : (node.nodevalue ? node.nodevalue : {});
                        child = child === null ? {} : child;

                        if (result.hasOwnProperty(node.nodeName)) {
                            // For repeating elements, cast/promote the node to array
                            if (!(result[node.nodeName] instanceof Array)) {
                                var tmp = result[node.nodeName];
                                result[node.nodeName] = [];
                                result[node.nodeName].push(tmp);
                            }
                            result[node.nodeName].push(child);
                        } else {
                            result[node.nodeName] = child;
                        }

                        // Add attributes if any
                        if (node.attributes.length > 0) {
                            result[node.nodeName]['@attributes'] = {};
                            for (var j = 0, len = node.attributes.length; j < len; j++) {
                                var attribute = node.attributes.item(j);
                                child['@attributes'][attribute.nodeName] = attribute.nodeValue;
                            }
                        }

                        // Add element value
                        if (node.childElementCount === 0 && node.textContent !== null && node.textContent !== "") {
                            child.value = node.textContent.trim();
                        }
                    }
                }
            }

            return result;
        }

    });
})();

