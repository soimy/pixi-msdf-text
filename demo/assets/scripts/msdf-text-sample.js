//@ts-check

const options = { 
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    backgroundColor: 0x000000
}
const app = new PIXI.Application(options);
document.body.appendChild(app.view);
app.stop();

const resourceList = [
    "../fonts/DimboR.fnt"
];
app.loader.add(resourceList).load(onAssetsLoaded);

function onAssetsLoaded() {
    const textOptions = {
        fontFace: "DimboR",
        fontSize: 150,
        fillColor: 0x051855,
        weight: 0.4,
        strokeThickness: 0.4,
        strokeColor: 0x051855,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowOffset: new PIXI.Point(0.006, 0.006),
        dropShadowAlpha: 0.4,
        dropShadowBlur: 0.0,
        align: "center",
        letterSpacing: 0,
        baselineOffset: 8,
        debugLevel: 3
    }
    const sampleText = new MSDFText.MSDFText("PixiJS powered", textOptions);
    app.stage.addChild(sampleText);
    sampleText.pivot.set(sampleText.textWidth / 2, sampleText.textHeight / 2);
    sampleText.position.set(app.stage.width / 2, app.stage.height / 2);

}
