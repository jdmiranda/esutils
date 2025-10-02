/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var code = require('./code');

    // Optimization 1: Use Set for O(1) keyword lookup instead of switch statements
    var STRICT_MODE_RESERVED_WORDS_ES6 = new Set([
        'implements', 'interface', 'package', 'private',
        'protected', 'public', 'static', 'let'
    ]);

    var KEYWORDS_ES6 = new Set([
        'if', 'in', 'do', 'var', 'for', 'new', 'try', 'this',
        'else', 'case', 'void', 'with', 'enum', 'while', 'break',
        'catch', 'throw', 'const', 'yield', 'class', 'super',
        'return', 'typeof', 'delete', 'switch', 'export', 'import',
        'default', 'finally', 'extends', 'function', 'continue',
        'debugger', 'instanceof'
    ]);

    var LITERALS = new Set(['null', 'true', 'false']);
    var RESTRICTED_WORDS = new Set(['eval', 'arguments']);

    // Optimization 2: Identifier validation caching for commonly used identifiers
    var identifierCache = Object.create(null);
    var CACHE_SIZE_LIMIT = 1000;
    var cacheSize = 0;

    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') {
            return false;
        }
        return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
        if (strict && STRICT_MODE_RESERVED_WORDS_ES6.has(id)) {
            return true;
        }
        return KEYWORDS_ES6.has(id);
    }

    function isReservedWordES5(id, strict) {
        return LITERALS.has(id) || isKeywordES5(id, strict);
    }

    function isReservedWordES6(id, strict) {
        return LITERALS.has(id) || isKeywordES6(id, strict);
    }

    function isRestrictedWord(id) {
        return RESTRICTED_WORDS.has(id);
    }

    function isIdentifierNameES5(id) {
        var i, iz, ch, cacheKey;

        if (id.length === 0) { return false; }

        // Check cache first
        cacheKey = 'es5:' + id;
        if (identifierCache[cacheKey] !== undefined) {
            return identifierCache[cacheKey];
        }

        ch = id.charCodeAt(0);
        if (!code.isIdentifierStartES5(ch)) {
            // Cache negative result
            if (cacheSize < CACHE_SIZE_LIMIT) {
                identifierCache[cacheKey] = false;
                cacheSize++;
            }
            return false;
        }

        for (i = 1, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (!code.isIdentifierPartES5(ch)) {
                // Cache negative result
                if (cacheSize < CACHE_SIZE_LIMIT) {
                    identifierCache[cacheKey] = false;
                    cacheSize++;
                }
                return false;
            }
        }

        // Cache positive result
        if (cacheSize < CACHE_SIZE_LIMIT) {
            identifierCache[cacheKey] = true;
            cacheSize++;
        }
        return true;
    }

    function decodeUtf16(lead, trail) {
        return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
    }

    function isIdentifierNameES6(id) {
        var i, iz, ch, lowCh, check, cacheKey;

        if (id.length === 0) { return false; }

        // Check cache first
        cacheKey = 'es6:' + id;
        if (identifierCache[cacheKey] !== undefined) {
            return identifierCache[cacheKey];
        }

        check = code.isIdentifierStartES6;
        for (i = 0, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (0xD800 <= ch && ch <= 0xDBFF) {
                ++i;
                if (i >= iz) {
                    if (cacheSize < CACHE_SIZE_LIMIT) {
                        identifierCache[cacheKey] = false;
                        cacheSize++;
                    }
                    return false;
                }
                lowCh = id.charCodeAt(i);
                if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
                    if (cacheSize < CACHE_SIZE_LIMIT) {
                        identifierCache[cacheKey] = false;
                        cacheSize++;
                    }
                    return false;
                }
                ch = decodeUtf16(ch, lowCh);
            }
            if (!check(ch)) {
                if (cacheSize < CACHE_SIZE_LIMIT) {
                    identifierCache[cacheKey] = false;
                    cacheSize++;
                }
                return false;
            }
            check = code.isIdentifierPartES6;
        }

        // Cache positive result
        if (cacheSize < CACHE_SIZE_LIMIT) {
            identifierCache[cacheKey] = true;
            cacheSize++;
        }
        return true;
    }

    function isIdentifierES5(id, strict) {
        return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }

    function isIdentifierES6(id, strict) {
        return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }

    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isReservedWordES5: isReservedWordES5,
        isReservedWordES6: isReservedWordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierNameES5: isIdentifierNameES5,
        isIdentifierNameES6: isIdentifierNameES6,
        isIdentifierES5: isIdentifierES5,
        isIdentifierES6: isIdentifierES6
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */
