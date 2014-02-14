/*
 * tetris
 * https://github.com/viclm/tetris
 *
 * Copyright (c) 2014 viclm
 * Licensed under the MIT license.
 */

(function ($, undefined) {
    function tetris (args) {
        args = args || {};
        var opt = {
            canvas : '#canvas',
            tips : '#tips',
            unit : 25,
            width : 12,
            height : 20,
            score : function(){},
            level : function(){},
            over : function(){},
            start : function(){},
            parse : function(){}
        }
        $.extend(opt, args);

        var x = opt.width / 2 - 1, y = 0, block, matrixSet, matrixType, matrix, next, timer, rate, score, level, on;
        var ctx = $(opt.canvas).get(0).getContext('2d');
        var ctxTips = $(opt.tips).get(0).getContext('2d');

        init();

        $(document).keydown(function(evt) {
            if (on) {
                var keyCode = evt.which;
                if (keyCode === 37 || keyCode === 39 || keyCode === 38 || keyCode === 40) {
                    switch (keyCode) {
                        case 37:
                            if (!impactLeft(x, y, matrix)) {
                            x -= 1;
                        }
                        break;
                        case 39:
                            if (!impactRight(x, y, matrix, opt.width)) {
                            x += 1;
                        }
                        break;
                        case 38:
                            distortMatrix();
                            draw(ctx, x, y, opt.width, opt.height, matrix, opt.unit);
                        break;
                        case 40:
                            rate = 25;
                            clearTimeout(timer);
                            fall();
                        break
                    }
                    draw(ctx, x, y, opt.width, opt.height, matrix, opt.unit);
                    evt.preventDefault;
                    return false;
                }
            }
        });

        function changeLevel () {
            if (on) {
                level++;
                rate = 100 * (10 - level);
                opt.level(level);
                if (level !== 10) {
                    setTimeout(arguments.callee, 60000);
                }
            }
        }

        function createMatrix () {
            next = matrixSet[Math.floor(Math.random() * 7)];
            next.index = Math.floor(Math.random() * next.length);
            //next.color = color();
            matrixType = next;
            matrix = matrixType.index;
            clear(ctxTips, ctxTips.canvas.width, ctxTips.canvas.height);
            drawMatrix(ctxTips, 0, 0, next[next.index], opt.unit, next.color);

            distortMatrix ()
            rate = 100 * (10 - level);
            fall();
        }

        function distortMatrix () {
            var index = matrixType.index + 1;
            if (index >= matrixType.length) {
                index = 0;
            }
            tmatrix = matrixType[index];
            if (x >=0 && x + tmatrix.length <= opt.width) {
                matrix = tmatrix;
                matrixType.index = index;
            }
        }

        function fall () {
            draw(ctx, x, y, opt.width, opt.height, matrix, opt.unit);
            if (impactDown(x, y, matrix, opt.height)) {
                clearTimeout(timer);
                timer = null;
                buildBlock(x, y, matrix);
                var full = false;
                for (var i = 0 ; i < block[0].length ; i++) {
                    if (block[0][i]) {
                        full = true;
                        break;
                    }
                }

                if (full) {
                    on = false;
                    opt.over();
                }
                else {
                    x = 5;
                    y = 0;
                    createMatrix();
                }
            }
            else {
                y += 1;
                timer = setTimeout(arguments.callee, rate);
            }
        }

        function impactLeft (x, y, m) {
            for (var i = 0, iLen = m.length ; i < iLen ; i++) {
                var col = m[i], counter = 0;
                for (var j = 0, jLen = col.length ; j < jLen ; j++) {
                    if (col[j]) {
                        counter++ ;
                        if (x + i - 1 < 0 || block[y + j][x + i - 1]) {
                            return true;
                        }
                    }
                }
                if (counter === col.length) {
                    break;
                }
            }
            return false;//not impact
        }

        function impactRight (x, y, m, w) {
            for (var i = m.length - 1 ; i > -1 ; i--) {
                var col = m[i], counter = 0;
                for (var j = 0, jLen = col.length ; j < jLen ; j++) {
                    if (col[j]) {
                        counter++ ;
                        if (x + i + 1 > w - 1 || block[y + j][x + i + 1]) {
                            return true;
                        }
                    }
                }
                if (counter === col.length) {
                    break;
                }
            }
            return false;//not impact
        }

        function impactDown (x, y, matrix, h) {
            for (var i = matrix.length - 1 ; i > -1 ; i--) {
                var col = matrix[i];
                for (var j = col.length ; j > -1 ; j--) {
                    if (col[j]) {
                        if (y + j + 1 > h - 1 || block[y + j + 1][x + i]) {
                            return true;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            return false;//not impact
        }

        function buildBlock (x, y, m) {
            for (var i = 0, iLen = m.length ; i < iLen ; i++) {
                var col = m[i];
                for (var j = 0, jLen = col.length ; j < jLen ; j++) {
                    if (col[j]) {
                        block[y + j][x + i] = matrixType.color;
                    }
                }
            }
        }

        function draw (ctx, x, y, w, h, matrix, unit) {
            clear(ctx, w * unit, h * unit);
            drawMatrix(ctx, x, y, matrix, unit, matrixType.color);
            drawBlock(ctx, block, unit);
        }

        function clear (ctx, w, h) {
            ctx.clearRect(0, 0, w, h);
        }

        function drawBlock (ctx, block, unit) {
            for (var i = 0, iLen = block.length ; i < iLen ; i++) {
                var row = block[i], counter = 0;
                for (var j = 0, jLen = row.length ; j < jLen ; j++) {
                    if (row[j]) {
                        drawRect(ctx, j * unit, i * unit, unit, unit, row[j]);
                        counter ++;
                    }
                }
                if (counter === row.length) {
                    block.splice(i, 1);
                    block.unshift(new Array(row.length));
                    score += 10;
                    opt.score(score);
                }
            }
        }

        function drawMatrix (ctx, x, y, matrix, unit, color) {
            for (var i = 0 ; i < matrix.length ; i++) {
                for (var j = 0 ; j < matrix[i].length ; j++) {
                    if (matrix[i][j]) {
                        drawRect(ctx, x * unit + i * unit, y * unit + j * unit, unit, unit, color);
                    }
                }
            }
        }

        function drawRect (ctx, x, y, w, h, c) {
            ctx.beginPath();
            ctx.fillStyle = c;
            //ctx.fillStyle = ctx.createPattern(this, 'no-repeat');//image interface
            //ctx.strokeStyle = '#ffffff';
            //ctx.lineWidth = 1;
            ctx.rect(x, y, w - 2 , h - 2);
            ctx.fill();
            ctx.closePath();
            //ctx.stroke();
        }

        function init () {
            matrixSet = [];

            matrixSet[0] = [];
            matrixSet[0].color = '#f00';
            matrixSet[0][0] = [[1,1,1],[0,1,0]];
            matrixSet[0][1] = [[0,1],[1,1],[0,1]];
            matrixSet[0][2] = [[0,1,0],[1,1,1]];
            matrixSet[0][3] = [[1,0],[1,1],[1,0]];

            matrixSet[1] = [];
            matrixSet[1].color = '#0f0';
            matrixSet[1][0] = [[1,1],[0,1],[0,1]];
            matrixSet[1][1] = [[1,1,1],[1,0,0]];
            matrixSet[1][2] = [[1,0],[1,0],[1,1]];
            matrixSet[1][3] = [[0,0,1],[1,1,1]];

            matrixSet[2] = [];
            matrixSet[2].color = '#00f';
            matrixSet[2][0] = [[1,1],[1,0],[1,0]];
            matrixSet[2][1] = [[1,0,0],[1,1,1]];
            matrixSet[2][2] = [[0,1],[0,1],[1,1]];
            matrixSet[2][3] = [[1,1,1],[0,0,1]];

            matrixSet[3] = [];
            matrixSet[3].color = '#ff0';
            matrixSet[3][0] = [[0,1],[1,1],[1,0]];
            matrixSet[3][1] = [[1,1,0],[0,1,1]];

            matrixSet[4] = [];
            matrixSet[4].color = '#f0f';
            matrixSet[4][0] = [[1,0],[1,1],[0,1]];
            matrixSet[4][1] = [[0,1,1],[1,1,0]];

            matrixSet[5] = [];
            matrixSet[5].color = '#0ff';
            matrixSet[5][0] = [[1,1,1,1]];
            matrixSet[5][1] = [[1],[1],[1],[1]];

            matrixSet[6] = [];
            matrixSet[6].color = '#000';
            matrixSet[6][0] = [[1,1],[1,1]];

            block = [];

            for (var i = 0 ; i < opt.height ; i++) {
                block.push(new Array(opt.width));
            }

            score = 0;
            level = 0;
        }

        function color () {
            var str = '0123456789abcdef';
            var t = '#';
            for (var i = 0 ; i < 6 ; i++) {
                t = t + str.charAt(Math.random() * 16);
            }
            if (t === '#000000') {
                return color();
            }
            return t;
        }

        return {
            play : function () {
                on = true;
                changeLevel();
                createMatrix();
            },
            pause : function () {
                clearTimeout(timer);
                timer = null;
                on = false;
            },
            restore : function () {
                fall();
                on = true;
                setTimeout(changeLevel, 60000);
            },
            reset : function () {

            }
        }
    }
    window['tetris'] = tetris;


})(jQuery)
