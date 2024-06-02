import { PalletFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const SecondArtFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${PalletFunc}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = 2 * in.cell / grid - 1;
        uv.x *= resolution.x / resolution.y;
        var t = f32(timeStep) / 1000;

        var uv0 = uv;
        var col = vec3f(0.);
        for(var i = 0; i < 3; i++) {
            uv.y -= sin(t *.4);
            uv.x -= cos(t * .5);
            var d = .4;
            uv = 2 * fract(uv) - 1;
            var rect = sdRect(uv, vec2f(d, d));
            rect = tan(rect * 8. + t + f32(i));
            rect = abs(rect);
            rect = s(.11, .1, rect);

            col += palette(sdRect(uv,  vec2f(.1 * f32(i), .2)) + t *.1) * rect;
        }

        return vec4f(col, 1);
    }

    fn sdRect(uv: vec2f, b: vec2f) -> f32 {
        var d = abs(uv) - b;
        return length(max(d, vec2f(.0))) + min(max(d.x, d.y), .0);
    }   

    fn s(a: f32, b: f32, t: f32) -> f32 {
        return smoothstep(a, b, t);
    }
`