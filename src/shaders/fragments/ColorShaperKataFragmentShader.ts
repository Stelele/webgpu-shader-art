import { PI, TWO_PI } from "../constants";
import { RYBToRYBFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const ColorShaperKataFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${PI}
    ${TWO_PI}
    ${RYBToRYBFunc}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = in.cell / grid;

        var col = colInt1(uv); 

        return vec4f(col, 1.);
    }

    fn colorWheel(uv: vec2f) -> vec3f {
        var fromCenter = vec2f(.5) - uv;
        var r = length(fromCenter) * 2.;
        var theta = .5 + (atan2(fromCenter.y, fromCenter.x) / TWO_PI);

        var col = ryb2rgb(vec3f(theta, r, 1.));

        return col;
    }

    fn colInt0(uv: vec2f) -> vec3f {
        var col = vec3f(.0);

        var leftCol = hsb2rgb(vec3f(.55, .5, .9));
        col = mix(col, leftCol, 1. - step(.5, uv.x));

        var rightCol = hsb2rgb(vec3f(.1, .8, .8));
        col = mix(col, rightCol, step(.5, uv.x));

        var boxCol = hsb2rgb(vec3f(.1, .4, .6));

        var leftBox = rect(uv, .2, .25, .6, .3);
        col = mix(col, boxCol, leftBox);

        var rightBox = rect(uv, .7, .75, .6, .3);
        col = mix(col, boxCol, rightBox);

        return col;
    }

    fn colInt1(uv: vec2f) -> vec3f {
        var col = vec3f(.0);
        var toCenter = vec2f(.5) - uv;
        var r = 2 * length(toCenter);
        var theta = (atan2(toCenter.y, toCenter.x) / TWO_PI) + .5;

        var leftCol = ryb2rgb(vec3f(.83, .8, .5));
        col = mix(col, leftCol, 1. - step(.5, uv.x));

        var rightCol = ryb2rgb(vec3f(.83, .8, .9));
        col = mix(col, rightCol, step(.5, uv.x));

        var boxCol = ryb2rgb(vec3f(.83, .8, .7));

        var leftBox = rect(uv, .2, .25, .6, .3);
        col = mix(col, boxCol, leftBox);

        var rightBox = rect(uv, .7, .75, .6, .3);
        col = mix(col, boxCol, rightBox);

        return col;
    }

    fn rect(uv: vec2f, left: f32, right: f32, top: f32, bottom: f32) -> f32 {
        return step(left, uv.x) *
               (1 - step(right, uv.x)) *
               step(bottom, uv.y) *
               (1 - step(top, uv.y));
    }

    

    

    
`