(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["text-msdf"] = factory();
	else
		root["text-msdf"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("pixi.js");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var MSDFText_1 = __webpack_require__(2);
exports.MSDFText = MSDFText_1.MSDFText;
var MSDFRenderer_1 = __webpack_require__(3);
exports.MSDFRenderer = MSDFRenderer_1.MSDFRenderer;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var pixi_js_1 = __webpack_require__(0);
var MSDFText = /** @class */ (function (_super) {
    __extends(MSDFText, _super);
    function MSDFText(text, options) {
        var _this = _super.call(this, options.texture || PIXI.Texture.WHITE) || this;
        _this._text = text;
        _this._font = {
            fontFace: options.fontFace,
            fontSize: options.fontSize,
            color: options.fillColor === undefined ? 0xFF0000 : options.fillColor,
            weight: options.weight === undefined ? 0.5 : 1 - options.weight,
            align: options.align,
            kerning: options.kerning === undefined ? true : options.kerning,
            strokeColor: options.strokeColor || 0,
            dropShadow: options.dropShadow || false,
            dropShadowColor: options.dropShadowColor || 0,
            dropShadowAlpha: options.dropShadowAlpha === undefined ? 0.5 : options.dropShadowAlpha,
            dropShadowBlur: options.dropShadowBlur || 0,
            dropShadowOffset: options.dropShadowOffset || new pixi_js_1.Point(2, 2),
            pxrange: options.pxrange === undefined ? 3 : options.pxrange,
        };
        if (options.strokeThickness === undefined || options.strokeThickness === 0) {
            _this._font.strokeWeight = 0;
        }
        else {
            _this._font.strokeWeight = _this._font.weight - options.strokeThickness;
        }
        // TODO: layout option initialze
        _this._baselineOffset = options.baselineOffset === undefined ? 0 : options.baselineOffset;
        _this._letterSpacing = options.letterSpacing === undefined ? 0 : options.letterSpacing;
        _this._lineSpacing = options.lineSpacing === undefined ? 0 : options.lineSpacing;
        _this._textWidth = _this._textHeight = 0;
        _this._maxWidth = options.maxWidth || 0;
        _this._anchor = new pixi_js_1.ObservablePoint(function () { _this.dirty++; }, _this, 0, 0);
        _this._textMetricsBound = new pixi_js_1.Rectangle();
        // Debug initialize
        _this._debugLevel = options.debugLevel || 0;
        _this.pluginName = "msdf";
        _this.dirty = 0;
        _this.updateText();
        return _this;
    }
    MSDFText.prototype.updateText = function () {
        var fontData = pixi_js_1.extras.BitmapText.fonts[this._font.fontFace];
        if (!fontData)
            throw new Error("Invalid fontFace: " + this._font.fontFace);
        // No beauty way to get bitmap font texture
        this._texture = this.getBitmapTexture(this._font.fontFace);
        this._font.rawSize = fontData.size;
        var scale = this._font.fontSize / fontData.size;
        var pos = new pixi_js_1.Point(0, -this._baselineOffset * scale);
        var chars = [];
        var lineWidths = [];
        var texWidth = this._texture.width;
        var texHeight = this._texture.height;
        var prevCharCode = -1;
        var lastLineWidth = 0;
        var maxLineWidth = 0;
        var line = 0;
        var lastSpace = -1;
        var lastSpaceWidth = 0;
        var spacesRemoved = 0;
        var maxLineHeight = 0;
        for (var i = 0; i < this._text.length; i++) {
            var charCode = this._text.charCodeAt(i);
            // If char is space, cache to lastSpace
            if (/(\s)/.test(this._text.charAt(i))) {
                lastSpace = i;
                lastSpaceWidth = lastLineWidth;
            }
            // If char is return
            if (/(?:\r\n|\r|\n)/.test(this._text.charAt(i))) {
                lastLineWidth -= this._letterSpacing;
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                line++;
                pos.x = 0;
                pos.y += fontData.lineHeight * scale + this._lineSpacing * scale;
                prevCharCode = -1;
                continue;
            }
            if (lastSpace !== -1 && this._maxWidth > 0 && pos.x > this._maxWidth) {
                PIXI.utils.removeItems(chars, lastSpace - spacesRemoved, i - lastSpace);
                i = lastSpace;
                lastSpace = -1;
                ++spacesRemoved;
                lastSpaceWidth -= this._letterSpacing;
                lineWidths.push(lastSpaceWidth);
                maxLineWidth = Math.max(maxLineWidth, lastSpaceWidth);
                line++;
                pos.x = 0;
                pos.y += fontData.lineHeight * scale + this._lineSpacing * scale;
                prevCharCode = -1;
                continue;
            }
            var charData = fontData.chars[charCode];
            if (!charData)
                continue;
            if (this._font.kerning && prevCharCode !== -1 && charData.kerning[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode] * scale;
            }
            chars.push({
                line: line,
                charCode: charCode,
                drawRect: new pixi_js_1.Rectangle(pos.x + charData.xOffset * scale, pos.y + charData.yOffset * scale, charData.texture.width * scale, charData.texture.height * scale),
                rawRect: new pixi_js_1.Rectangle(charData.texture.orig.x, charData.texture.orig.y, charData.texture.width, charData.texture.height),
            });
            // lastLineWidth = pos.x + (charData.texture.width * scale + charData.xOffset);
            pos.x += (charData.xAdvance + this._letterSpacing) * scale;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, pos.y + fontData.lineHeight * scale);
            prevCharCode = charCode;
        }
        lineWidths.push(lastLineWidth);
        maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        var lineAlignOffsets = [];
        for (var i = 0; i <= line; i++) {
            var alignOffset = 0;
            if (this._font.align === "right") {
                alignOffset = maxLineWidth - lineWidths[i];
            }
            else if (this._font.align === "center") {
                alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }
            lineAlignOffsets.push(alignOffset);
        }
        var tint = this.tint;
        // Update line alignment and fontSize
        var lineNo = -1;
        for (var _i = 0, chars_1 = chars; _i < chars_1.length; _i++) {
            var char = chars_1[_i];
            char.drawRect.x = char.drawRect.x + lineAlignOffsets[char.line];
            if (lineNo !== char.line) {
                lineNo = char.line;
                // draw line gizmo
                if (this._debugLevel > 1) {
                    this.drawGizmoRect(new pixi_js_1.Rectangle(char.drawRect.x - fontData.chars[char.charCode].xOffset * scale, char.drawRect.y - fontData.chars[char.charCode].yOffset * scale, lineWidths[lineNo], fontData.lineHeight * scale), 1, 0x00FF00, 0.5);
                }
            }
        }
        // draw text bound gizmo
        if (this._debugLevel > 0) {
            this.drawGizmoRect(this.getLocalBounds(), 1, 0xFFFFFF, 0.5);
        }
        this._textWidth = maxLineWidth;
        this._textHeight = maxLineHeight;
        this._textMetricsBound = new pixi_js_1.Rectangle(0, 0, maxLineWidth, maxLineHeight);
        this.vertices = this.toVertices(chars);
        this.uvs = this.toUVs(chars, texWidth, texHeight);
        this.indices = this.createIndicesForQuads(chars.length);
        this.dirty++;
        this.indexDirty++;
    };
    Object.defineProperty(MSDFText.prototype, "text", {
        get: function () { return this._text; },
        set: function (value) { this._text = value; this.updateText(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSDFText.prototype, "fontData", {
        get: function () { return this._font; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSDFText.prototype, "glDatas", {
        get: function () { return this._glDatas; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSDFText.prototype, "textWidth", {
        get: function () { return this._textWidth; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSDFText.prototype, "textHeight", {
        get: function () { return this._textHeight; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSDFText.prototype, "maxWidth", {
        get: function () { return this._maxWidth; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MSDFText.prototype, "textMetric", {
        get: function () { return this._textMetricsBound; },
        enumerable: true,
        configurable: true
    });
    MSDFText.prototype.getBitmapTexture = function (fontFace) {
        var fontData = pixi_js_1.extras.BitmapText.fonts[fontFace];
        if (!fontData)
            return pixi_js_1.Texture.EMPTY;
        // No beauty way to get bitmap font texture, hack needed
        var texturePath = fontData.chars[Object.keys(fontData.chars)[0]].texture.baseTexture.imageUrl;
        return PIXI.utils.TextureCache[texturePath];
    };
    MSDFText.prototype.toVertices = function (chars) {
        var _this = this;
        var positions = new Float32Array(chars.length * 4 * 2);
        var i = 0;
        chars.forEach(function (char) {
            // top left position
            var x = char.drawRect.x;
            var y = char.drawRect.y;
            // quad size
            var w = char.drawRect.width;
            var h = char.drawRect.height;
            // BL
            positions[i++] = x;
            positions[i++] = y;
            // TL
            positions[i++] = x;
            positions[i++] = y + h;
            // TR
            positions[i++] = x + w;
            positions[i++] = y + h;
            // BR
            positions[i++] = x + w;
            positions[i++] = y;
            // draw Gizmo
            if (_this._debugLevel > 2)
                _this.drawGizmoRect(char.drawRect, 1, 0x0000AA, 0.5);
        });
        return positions;
    };
    MSDFText.prototype.toUVs = function (chars, texWidth, texHeight) {
        var uvs = new Float32Array(chars.length * 4 * 2);
        var i = 0;
        chars.forEach(function (char) {
            // Note: v coordinate is reversed 2D space Y coordinate
            var u0 = char.rawRect.x / texWidth;
            var u1 = (char.rawRect.x + char.rawRect.width) / texWidth;
            var v0 = (char.rawRect.y + char.rawRect.height) / texHeight;
            var v1 = char.rawRect.y / texHeight;
            // BL
            uvs[i++] = u0;
            uvs[i++] = v1;
            // TL
            uvs[i++] = u0;
            uvs[i++] = v0;
            // TR
            uvs[i++] = u1;
            uvs[i++] = v0;
            // BR
            uvs[i++] = u1;
            uvs[i++] = v1;
        });
        return uvs;
    };
    MSDFText.prototype.createIndicesForQuads = function (size) {
        // the total number of indices in our array, there are 6 points per quad.
        var totalIndices = size * 6;
        var indices = new Uint16Array(totalIndices);
        // fill the indices with the quads to draw
        for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
            indices[i + 0] = j + 0;
            indices[i + 1] = j + 1;
            indices[i + 2] = j + 2;
            indices[i + 3] = j + 0;
            indices[i + 4] = j + 2;
            indices[i + 5] = j + 3;
        }
        return indices;
    };
    MSDFText.prototype.drawGizmoRect = function (rect, lineThickness, lineColor, lineAlpha) {
        if (lineThickness === void 0) { lineThickness = 1; }
        if (lineColor === void 0) { lineColor = 0xFFFFFF; }
        if (lineAlpha === void 0) { lineAlpha = 1; }
        var gizmo = new pixi_js_1.Graphics();
        gizmo.nativeLines = true;
        gizmo
            .lineStyle(lineThickness, lineColor, lineAlpha)
            .drawRect(rect.x, rect.y, rect.width, rect.height);
        this.addChild(gizmo);
    };
    return MSDFText;
}(PIXI.mesh.Mesh));
exports.MSDFText = MSDFText;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var pixi_js_1 = __webpack_require__(0);
// Shader loader
var vertShader = __webpack_require__(4);
var fragShader = __webpack_require__(5);
// const sdfShader = require("glslify!raw!./sdf.frag");
var MSDFRenderer = /** @class */ (function (_super) {
    __extends(MSDFRenderer, _super);
    function MSDFRenderer(renderer) {
        var _this = _super.call(this, renderer) || this;
        // initialize shader
        var gl = _this.renderer.gl;
        _this.shader = new PIXI.Shader(gl, vertShader, fragShader);
        return _this;
    }
    MSDFRenderer.prototype.onContextChange = function () {
        this.shader.gl = this.renderer.gl;
    };
    MSDFRenderer.prototype.render = function (msdfText) {
        var renderer = this.renderer;
        var texture = msdfText.texture;
        var font = msdfText.fontData;
        var gl = renderer.gl;
        // validate
        if (!texture || !texture.valid || !font.rawSize)
            return;
        var glData = msdfText.glDatas[renderer.CONTEXT_UID];
        if (!glData) {
            // renderer.bindVao(null);
            glData = {
                shader: this.shader,
                vertexBuffer: pixi_js_1.glCore.GLBuffer.createVertexBuffer(gl, msdfText.vertices, gl.STREAM_DRAW),
                uvBuffer: pixi_js_1.glCore.GLBuffer.createVertexBuffer(gl, msdfText.uvs, gl.STREAM_DRAW),
                indexBuffer: pixi_js_1.glCore.GLBuffer.createIndexBuffer(gl, msdfText.indices, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: null,
                dirty: msdfText.dirty,
                indexDirty: msdfText.indexDirty,
            };
            glData.vao = new pixi_js_1.glCore.VertexArrayObject(gl)
                .addIndex(glData.indexBuffer)
                .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                .addAttribute(glData.uvBuffer, glData.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);
            msdfText.glDatas[renderer.CONTEXT_UID] = glData;
        }
        renderer.bindVao(glData.vao);
        if (msdfText.dirty !== glData.dirty) {
            glData.dirty = msdfText.dirty;
            glData.uvBuffer.upload(msdfText.uvs);
        }
        if (msdfText.indexDirty !== glData.indexDirty) {
            glData.indexDirty = msdfText.indexDirty;
            glData.indexBuffer.upload(msdfText.indices);
        }
        glData.vertexBuffer.upload(msdfText.vertices);
        renderer.bindShader(glData.shader);
        glData.shader.uniforms.uSampler = renderer.bindTexture(texture);
        if (renderer.state)
            renderer.state.setBlendMode(msdfText.blendMode);
        glData.shader.uniforms.translationMatrix = msdfText.worldTransform.toArray(true);
        glData.shader.uniforms.u_alpha = msdfText.worldAlpha;
        glData.shader.uniforms.u_color = PIXI.utils.hex2rgb(font.color);
        glData.shader.uniforms.u_fontSize = font.fontSize * msdfText.scale.x;
        glData.shader.uniforms.u_fontInfoSize = 1;
        glData.shader.uniforms.u_weight = font.weight;
        glData.shader.uniforms.u_pxrange = font.pxrange;
        glData.shader.uniforms.strokeWeight = font.strokeWeight;
        glData.shader.uniforms.strokeColor = PIXI.utils.hex2rgb(font.strokeColor);
        glData.shader.uniforms.tint = PIXI.utils.hex2rgb(msdfText.tint);
        glData.shader.uniforms.hasShadow = font.dropShadow;
        glData.shader.uniforms.shadowOffset = new Float32Array([font.dropShadowOffset.x, font.dropShadowOffset.x]);
        glData.shader.uniforms.shadowColor = PIXI.utils.hex2rgb(font.dropShadowColor);
        glData.shader.uniforms.shadowAlpha = font.dropShadowAlpha;
        glData.shader.uniforms.shadowSmoothing = font.dropShadowBlur;
        var drawMode = msdfText.drawMode = gl.TRIANGLES;
        glData.vao.draw(drawMode, msdfText.indices.length, 0);
    };
    return MSDFRenderer;
}(PIXI.ObjectRenderer));
exports.MSDFRenderer = MSDFRenderer;
PIXI.WebGLRenderer.registerPlugin("msdf", MSDFRenderer);


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = "#define GLSLIFY 1\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\nuniform float u_fontInfoSize;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    vTextureCoord = aTextureCoord;\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition * u_fontInfoSize, 1.0)).xy, 0.0, 1.0);\n}\n"

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = "#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform vec3 u_color;\nuniform sampler2D uSampler;\nuniform float u_alpha;\nuniform float u_fontSize;\nuniform float u_weight;\nuniform float u_pxrange;\n\nuniform vec3 tint;\n// Stroke effect parameters\nuniform float strokeWeight;\nuniform vec3 strokeColor;\n\n// Shadow effect parameters\nuniform bool hasShadow;\nuniform vec2 shadowOffset;\nuniform float shadowSmoothing;\nuniform vec3 shadowColor;\nuniform float shadowAlpha;\n\nfloat median(float r, float g, float b) {\n    return max(min(r, g), min(max(r, g), b));\n}\n\nvoid main(void)\n{\n    float smoothing = clamp(2.0 * u_pxrange / u_fontSize, 0.0, 0.5);\n\n    vec2 textureCoord = vTextureCoord * 2.;\n    vec3 sample = texture2D(uSampler, vTextureCoord).rgb;\n    float dist = median(sample.r, sample.g, sample.b);\n\n    float alpha;\n    vec3 color;\n\n    // dirty if statment, will change soon\n    if (strokeWeight > 0.0) {\n        alpha = smoothstep(strokeWeight - smoothing, strokeWeight + smoothing, dist);\n        float outlineFactor = smoothstep(u_weight - smoothing, u_weight + smoothing, dist);\n        color = mix(strokeColor, u_color, outlineFactor) * alpha;\n    } else {\n        alpha = smoothstep(u_weight - smoothing, u_weight + smoothing, dist);\n        color = u_color * alpha;\n    }\n    vec4 text = vec4(color * tint, alpha) * u_alpha;\n    if (hasShadow == false) {\n        gl_FragColor = text;\n    } else {\n        vec3 shadowSample = texture2D(uSampler, vTextureCoord - shadowOffset).rgb;\n        float shadowDist = median(shadowSample.r, shadowSample.g, shadowSample.b);\n        float distAlpha = smoothstep(0.5 - shadowSmoothing, 0.5 + shadowSmoothing, shadowDist);\n        vec4 shadow = vec4(shadowColor, shadowAlpha * distAlpha);\n        gl_FragColor = mix(shadow, text, text.a);\n    }\n}"

/***/ })
/******/ ]);
});
//# sourceMappingURL=pixi-msdf-text.js.map