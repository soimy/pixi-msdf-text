import { MSDFText, MSDFTextOption } from "./MSDFText";
import { glCore } from "pixi.js";

// Shader loader
const vertShader = require("./msdf.vert");
const fragShader = require("./msdf.frag");

export class MSDFRenderer extends PIXI.ObjectRenderer {

    private shader: PIXI.Shader;

    constructor(renderer: PIXI.WebGLRenderer) {
        super(renderer);
    }

    public onContextChange(): void {
        const gl = this.renderer.gl;
        this.shader = new PIXI.Shader(gl, vertShader, fragShader);
    }

    public render(msdfText: MSDFText) {
        const renderer = this.renderer;
        const texture = msdfText.texture;
        const font = msdfText.fontData;
        const gl = renderer.gl;

        // validate
        if (!texture || !texture.valid || !font.rawSize) return;

        let glData = msdfText.glDatas[renderer.CONTEXT_UID];

        if (!glData) {
            // renderer.bindVao(null);
            glData = {
                shader: this.shader,
                vertexBuffer: PIXI.glCore.GLBuffer.createVertexBuffer(gl, msdfText.vertices, gl.STREAM_DRAW),
                uvBuffer: PIXI.glCore.GLBuffer.createVertexBuffer(gl, msdfText.uvs, gl.STREAM_DRAW),
                indexBuffer: PIXI.glCore.GLBuffer.createIndexBuffer(gl, msdfText.indices, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: null,
                dirty: msdfText.dirty,
                indexDirty: msdfText.indexDirty,
            };
            glData.vao = new PIXI.glCore.VertexArrayObject(gl)
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

        if (renderer.state) renderer.state.setBlendMode(msdfText.blendMode);

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

        const drawMode = msdfText.drawMode = gl.TRIANGLES;
        glData.vao.draw(drawMode, msdfText.indices.length, 0);
    }
}

PIXI.WebGLRenderer.registerPlugin("msdf", MSDFRenderer);
