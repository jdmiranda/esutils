#!/usr/bin/env node

'use strict';

var esutils = require('./lib/utils');
var Benchmark = require('benchmark');

// Benchmark configuration
var ITERATIONS = 1000000;

console.log('esutils Performance Benchmarks');
console.log('================================\n');

// Sample data for benchmarks
var keywords = ['if', 'for', 'while', 'function', 'return', 'var', 'const', 'let', 'class'];
var identifiers = ['foo', 'bar', 'baz', '_underscore', '$dollar', 'myVariable', 'anotherOne'];
var literals = ['null', 'true', 'false'];
var nonKeywords = ['myFunc', 'variable', 'notAKeyword'];

var expressionNodes = [
    { type: 'Identifier' },
    { type: 'Literal' },
    { type: 'CallExpression' },
    { type: 'BinaryExpression' },
    { type: 'MemberExpression' }
];

var statementNodes = [
    { type: 'IfStatement' },
    { type: 'ForStatement' },
    { type: 'ReturnStatement' },
    { type: 'VariableDeclaration' }
];

var nonExpressionNodes = [
    { type: 'Unknown' },
    { type: 'CustomNode' }
];

console.log('1. Keyword Checking Benchmarks');
console.log('-------------------------------');

// Benchmark keyword checking
var suite1 = new Benchmark.Suite;
suite1
    .add('isKeywordES6 (keywords)', function() {
        for (var i = 0; i < keywords.length; i++) {
            esutils.keyword.isKeywordES6(keywords[i], false);
        }
    })
    .add('isKeywordES6 (non-keywords)', function() {
        for (var i = 0; i < nonKeywords.length; i++) {
            esutils.keyword.isKeywordES6(nonKeywords[i], false);
        }
    })
    .add('isReservedWordES6 (literals)', function() {
        for (var i = 0; i < literals.length; i++) {
            esutils.keyword.isReservedWordES6(literals[i], false);
        }
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('');
    })
    .run();

console.log('2. Identifier Validation Benchmarks');
console.log('------------------------------------');

// Benchmark identifier validation
var suite2 = new Benchmark.Suite;
suite2
    .add('isIdentifierES5 (valid)', function() {
        for (var i = 0; i < identifiers.length; i++) {
            esutils.keyword.isIdentifierES5(identifiers[i], false);
        }
    })
    .add('isIdentifierES6 (valid)', function() {
        for (var i = 0; i < identifiers.length; i++) {
            esutils.keyword.isIdentifierES6(identifiers[i], false);
        }
    })
    .add('isIdentifierNameES5', function() {
        for (var i = 0; i < identifiers.length; i++) {
            esutils.keyword.isIdentifierNameES5(identifiers[i]);
        }
    })
    .add('isIdentifierNameES6', function() {
        for (var i = 0; i < identifiers.length; i++) {
            esutils.keyword.isIdentifierNameES6(identifiers[i]);
        }
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('');
    })
    .run();

console.log('3. AST Node Type Checking Benchmarks');
console.log('-------------------------------------');

// Benchmark AST node checking
var suite3 = new Benchmark.Suite;
suite3
    .add('isExpression (expressions)', function() {
        for (var i = 0; i < expressionNodes.length; i++) {
            esutils.ast.isExpression(expressionNodes[i]);
        }
    })
    .add('isExpression (non-expressions)', function() {
        for (var i = 0; i < nonExpressionNodes.length; i++) {
            esutils.ast.isExpression(nonExpressionNodes[i]);
        }
    })
    .add('isStatement (statements)', function() {
        for (var i = 0; i < statementNodes.length; i++) {
            esutils.ast.isStatement(statementNodes[i]);
        }
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('');
    })
    .run();

console.log('4. Code Point Checking Benchmarks');
console.log('----------------------------------');

// Benchmark code point checking
var suite4 = new Benchmark.Suite;
suite4
    .add('isWhiteSpace', function() {
        esutils.code.isWhiteSpace(0x20);  // space
        esutils.code.isWhiteSpace(0x09);  // tab
        esutils.code.isWhiteSpace(0x1680); // non-ascii
        esutils.code.isWhiteSpace(0x41);  // 'A' - not whitespace
    })
    .add('isDecimalDigit', function() {
        esutils.code.isDecimalDigit(0x30);  // '0'
        esutils.code.isDecimalDigit(0x35);  // '5'
        esutils.code.isDecimalDigit(0x39);  // '9'
        esutils.code.isDecimalDigit(0x41);  // 'A' - not digit
    })
    .add('isIdentifierStartES5', function() {
        esutils.code.isIdentifierStartES5(0x61);  // 'a'
        esutils.code.isIdentifierStartES5(0x5F);  // '_'
        esutils.code.isIdentifierStartES5(0x24);  // '$'
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('');
    })
    .run();

console.log('5. Identifier Caching Performance Test');
console.log('---------------------------------------');

// Test cache effectiveness by calling same identifiers multiple times
var suite5 = new Benchmark.Suite;
var cachedIdentifiers = ['myVar', 'anotherVar', 'thirdVar', 'foo', 'bar'];

suite5
    .add('isIdentifierNameES5 (repeated calls - cache benefit)', function() {
        for (var i = 0; i < 100; i++) {
            for (var j = 0; j < cachedIdentifiers.length; j++) {
                esutils.keyword.isIdentifierNameES5(cachedIdentifiers[j]);
            }
        }
    })
    .add('isIdentifierNameES6 (repeated calls - cache benefit)', function() {
        for (var i = 0; i < 100; i++) {
            for (var j = 0; j < cachedIdentifiers.length; j++) {
                esutils.keyword.isIdentifierNameES6(cachedIdentifiers[j]);
            }
        }
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('');
    })
    .run();

console.log('Benchmarks Complete!');
console.log('====================');
console.log('\nNote: Higher ops/sec values indicate better performance.');
console.log('The optimizations include:');
console.log('  - Set-based keyword lookups (O(1) vs O(n))');
console.log('  - Set-based AST node type checking');
console.log('  - Set-based whitespace checking');
console.log('  - Identifier validation caching');
console.log('  - Optimized literal checking');
