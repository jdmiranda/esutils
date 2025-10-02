/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
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

    // Optimization: Use Set for O(1) AST node type checking instead of switch statements
    var EXPRESSION_TYPES = new Set([
        'ArrayExpression',
        'AssignmentExpression',
        'BinaryExpression',
        'CallExpression',
        'ConditionalExpression',
        'FunctionExpression',
        'Identifier',
        'Literal',
        'LogicalExpression',
        'MemberExpression',
        'NewExpression',
        'ObjectExpression',
        'SequenceExpression',
        'ThisExpression',
        'UnaryExpression',
        'UpdateExpression'
    ]);

    var ITERATION_STATEMENT_TYPES = new Set([
        'DoWhileStatement',
        'ForInStatement',
        'ForStatement',
        'WhileStatement'
    ]);

    var STATEMENT_TYPES = new Set([
        'BlockStatement',
        'BreakStatement',
        'ContinueStatement',
        'DebuggerStatement',
        'DoWhileStatement',
        'EmptyStatement',
        'ExpressionStatement',
        'ForInStatement',
        'ForStatement',
        'IfStatement',
        'LabeledStatement',
        'ReturnStatement',
        'SwitchStatement',
        'ThrowStatement',
        'TryStatement',
        'VariableDeclaration',
        'WhileStatement',
        'WithStatement'
    ]);

    function isExpression(node) {
        if (node == null) { return false; }
        return EXPRESSION_TYPES.has(node.type);
    }

    function isIterationStatement(node) {
        if (node == null) { return false; }
        return ITERATION_STATEMENT_TYPES.has(node.type);
    }

    function isStatement(node) {
        if (node == null) { return false; }
        return STATEMENT_TYPES.has(node.type);
    }

    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }

    function trailingStatement(node) {
        switch (node.type) {
        case 'IfStatement':
            if (node.alternate != null) {
                return node.alternate;
            }
            return node.consequent;

        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
            return node.body;
        }
        return null;
    }

    function isProblematicIfStatement(node) {
        var current;

        if (node.type !== 'IfStatement') {
            return false;
        }
        if (node.alternate == null) {
            return false;
        }
        current = node.consequent;
        do {
            if (current.type === 'IfStatement') {
                if (current.alternate == null)  {
                    return true;
                }
            }
            current = trailingStatement(current);
        } while (current);

        return false;
    }

    module.exports = {
        isExpression: isExpression,
        isStatement: isStatement,
        isIterationStatement: isIterationStatement,
        isSourceElement: isSourceElement,
        isProblematicIfStatement: isProblematicIfStatement,

        trailingStatement: trailingStatement
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */
