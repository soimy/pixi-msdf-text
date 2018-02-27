import { ObservablePoint, extras, Point, Texture, utils, Graphics, Rectangle } from "pixi.js";

export interface MSDFTextOption {
    // Basic
    fontFace: string;
    fontSize: number;
    fillColor?: number;
    weight?: number;
    // Effect
    texture?: Texture;
    strokeColor?: number;
    strokeThickness?: number;
    dropShadow?: boolean;
    dropShadowColor?: number;
    dropShadowAlpha?: number;
    dropShadowOffset?: Point;
    dropShadowBlur?: number;
    // Layout
    align?: "left" | "right" | "center";
    baselineOffset?: number;
    letterSpacing?: number;
    kerning?: boolean;
    lineSpacing?: number;
    maxWidth?: number;
    // Debug
    debugLevel?: 1 | 2 | 3;
    pxrange?: number;
}

export class MSDFText extends PIXI.mesh.Mesh {

    private _text: string;
    // Font data passed to renderer
    private _font: any;
    private _textWidth: number;
    private _textHeight: number;
    private _maxWidth: number;
    // private _maxLineHeight: number;
    private _anchor: ObservablePoint;
    // TODO: add Effect & Layout
    private _baselineOffset: number;
    private _letterSpacing: number;
    private _lineSpacing: number;
    // private _rawFontSize: number;
    // Debug
    private _debugLevel: number;
    // TODO: Metrics object
    private _textMetricsBound: Rectangle;

    constructor(text: string, options: MSDFTextOption) {
        super(options.texture || PIXI.Texture.WHITE);
        this._text = text;
        this._font = {
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
            dropShadowOffset: options.dropShadowOffset || new Point(2, 2),
            pxrange: options.pxrange === undefined ? 3 : options.pxrange,
        };
        if (options.strokeThickness === undefined || options.strokeThickness === 0) {
            this._font.strokeWeight = 0;
        } else {
            this._font.strokeWeight = this._font.weight - options.strokeThickness;
        }

        // TODO: layout option initialze
        this._baselineOffset = options.baselineOffset === undefined ? 0 : options.baselineOffset;
        this._letterSpacing = options.letterSpacing === undefined ? 0 : options.letterSpacing;
        this._lineSpacing = options.lineSpacing === undefined ? 0 : options.lineSpacing;

        this._textWidth = this._textHeight = 0;
        this._maxWidth = options.maxWidth || 0;
        this._anchor = new ObservablePoint(() => { this.dirty++; }, this, 0, 0);
        this._textMetricsBound = new Rectangle();

        // Debug initialize
        this._debugLevel = options.debugLevel || 0;
        this.pluginName = `msdf`;
        this.dirty = 0;
        this.updateText();
    }

    public updateText() {
        const fontData = extras.BitmapText.fonts[this._font.fontFace];
        if (!fontData) throw new Error("Invalid fontFace: " + this._font.fontFace);
        // No beauty way to get bitmap font texture
        this._texture = this.getBitmapTexture(this._font.fontFace);
        this._font.rawSize = fontData.size;

        const scale = this._font.fontSize / fontData.size;
        const pos = new Point(0, -this._baselineOffset * scale);
        const chars = [];
        const lineWidths: number[] = [];
        const texWidth = this._texture.width;
        const texHeight = this._texture.height;

        let prevCharCode = -1;
        let lastLineWidth = 0;
        let maxLineWidth = 0;
        let line = 0;
        let lastSpace = -1;
        let lastSpaceWidth = 0;
        let spacesRemoved = 0;
        let maxLineHeight = 0;

        for (let i = 0; i < this._text.length; i++) {
            const charCode = this._text.charCodeAt(i);

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

            const charData = fontData.chars[charCode];

            if (!charData) continue;

            if (this._font.kerning && prevCharCode !== -1 && charData.kerning[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode] * scale;
            }

            chars.push({
                line,
                charCode,
                drawRect: new Rectangle(
                    pos.x + charData.xOffset * scale,
                    pos.y + charData.yOffset * scale,
                    charData.texture.width * scale,
                    charData.texture.height * scale,
                ),
                rawRect: new Rectangle(
                    charData.texture.orig.x,
                    charData.texture.orig.y,
                    charData.texture.width,
                    charData.texture.height,
                ),
            });
            // lastLineWidth = pos.x + (charData.texture.width * scale + charData.xOffset);
            pos.x += (charData.xAdvance + this._letterSpacing) * scale;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, pos.y + fontData.lineHeight * scale);
            prevCharCode = charCode;
        }

        lineWidths.push(lastLineWidth);
        maxLineWidth = Math.max(maxLineWidth, lastLineWidth);

        const lineAlignOffsets = [];
        for (let i = 0; i <= line; i++) {
            let alignOffset = 0;

            if (this._font.align === "right") {
                alignOffset = maxLineWidth - lineWidths[i];
            } else if (this._font.align === "center") {
                alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }
            lineAlignOffsets.push(alignOffset);
        }

        const tint = this.tint;

        // Update line alignment and fontSize
        let lineNo = -1;
        for (const char of chars) {
            char.drawRect.x = char.drawRect.x + lineAlignOffsets[char.line];
            if (lineNo !== char.line) {
                lineNo = char.line;
                // draw line gizmo
                if (this._debugLevel > 1) {
                    this.drawGizmoRect(new Rectangle(
                        char.drawRect.x - fontData.chars[char.charCode].xOffset * scale,
                        char.drawRect.y - fontData.chars[char.charCode].yOffset * scale,
                        lineWidths[lineNo],
                        fontData.lineHeight * scale
                    ), 1, 0x00FF00, 0.5);
                }
            }
        }
        // draw text bound gizmo
        if (this._debugLevel > 0) {
            this.drawGizmoRect(this.getLocalBounds(), 1, 0xFFFFFF, 0.5);
        }

        this._textWidth = maxLineWidth;
        this._textHeight = maxLineHeight;
        this._textMetricsBound = new Rectangle(0, 0, maxLineWidth, maxLineHeight);

        this.vertices = this.toVertices(chars);
        this.uvs = this.toUVs(chars, texWidth, texHeight);
        this.indices = this.createIndicesForQuads(chars.length);

        this.dirty++;
        this.indexDirty++;
    }

    public get text(): string { return this._text; }
    public set text(value) { this._text = value; this.updateText(); }
    public get fontData(): any { return this._font; }
    public get glDatas(): any { return this._glDatas; }
    public get textWidth(): number { return this._textWidth; }
    public get textHeight(): number { return this._textHeight; }
    public get maxWidth(): number { return this._maxWidth; }
    public get textMetric(): Rectangle { return this._textMetricsBound; }

    private getBitmapTexture(fontFace: string): Texture {
        const fontData = extras.BitmapText.fonts[fontFace];
        if (!fontData) return Texture.EMPTY;
        // No beauty way to get bitmap font texture, hack needed
        const texturePath: string = fontData.chars[Object.keys(fontData.chars)[0]].texture.baseTexture.imageUrl;
        return PIXI.utils.TextureCache[texturePath];
    }

    private toVertices(chars: any[]): Float32Array {
        const positions = new Float32Array(chars.length * 4 * 2);
        let i = 0;
        chars.forEach(char => {
            // top left position
            const x = char.drawRect.x;
            const y = char.drawRect.y;
            // quad size
            const w = char.drawRect.width;
            const h = char.drawRect.height;

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
            if (this._debugLevel > 2) this.drawGizmoRect(char.drawRect, 1, 0x0000AA, 0.5);
        });
        return positions;
    }

    private toUVs(chars: any[], texWidth: number, texHeight: number): Float32Array {
        const uvs = new Float32Array(chars.length * 4 * 2);
        let i = 0;
        chars.forEach(char => {
            // Note: v coordinate is reversed 2D space Y coordinate
            const u0 = char.rawRect.x / texWidth;
            const u1 = (char.rawRect.x + char.rawRect.width) / texWidth;
            const v0 = (char.rawRect.y + char.rawRect.height) / texHeight;
            const v1 = char.rawRect.y / texHeight;
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
    }

    private createIndicesForQuads(size: number): Uint16Array {
        // the total number of indices in our array, there are 6 points per quad.
        const totalIndices = size * 6;
        const indices = new Uint16Array(totalIndices);

        // fill the indices with the quads to draw
        for (let i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
            indices[i + 0] = j + 0;
            indices[i + 1] = j + 1;
            indices[i + 2] = j + 2;
            indices[i + 3] = j + 0;
            indices[i + 4] = j + 2;
            indices[i + 5] = j + 3;
        }
        return indices;
    }

    private drawGizmoRect(rect: PIXI.Rectangle, lineThickness: number = 1, lineColor: number = 0xFFFFFF, lineAlpha: number = 1): void {
        const gizmo = new Graphics();
        gizmo.nativeLines = true;
        gizmo
        .lineStyle(lineThickness, lineColor, lineAlpha)
        .drawRect(rect.x, rect.y, rect.width, rect.height);
        this.addChild(gizmo);
    }
}
