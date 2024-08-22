import { PI } from "../constants";
import { CircleFunc, RectFunc, RemapFunc, TransformationFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const SmileyV1FragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${CircleFunc}
    ${RemapFunc}
    ${TransformationFunc}
    ${PI}
    ${RectFunc}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = 2 * in.cell / grid - 1;
        let iTime = f32(timeStep) / 1000;
        uv.x *= resolution.x / resolution.y;

        var pos = vec2f(0., 0.);
        let d = length(pos) - sin(iTime + .4);
        pos.x += cos(d * 8. + iTime);
        pos.y += sin(d * 8. + iTime);
        let size = remap(0., 1., .1, .7, sin(iTime * .6));
        let mask = smiley(uv, pos, size);
        let finalColor = vec4f(1.0, 1.0, 0, 1.0) * mask;

        return finalColor;
    }

    fn smiley(uv0: vec2f, pos: vec2f, size: f32) -> f32 {
        let uv =  uv0 / size - pos;

        let d = circle(uv, vec2f(0, 0), 0.4, 0.02);

        let eye1 = circle(uv, vec2f(-.3, 0.2), 0.1, 0.03);
        let eye2 = circle(uv, vec2f(.3, 0.2), 0.1, 0.03);
        
        let upper = circle(uv, vec2f(0., -0.1), 0.2, 0.03);
        let lower = circle(uv, vec2f(0., -0.155), 0.2, 0.03);
        let mouth = clamp(lower - upper, 0., 1.);

        var mask = d - eye1 - eye2 - mouth;
        mask = clamp(mask, 0., 1.);

        return mask;
    }
`