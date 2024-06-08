import { Uniforms, VertexOut } from "../vertices";

export const OneDShaderKataFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = 2 * in.cell / grid - 1;
        var t = f32(timeStep) / 1000;

        var y = 1. - pow(abs(uv.x), 2.);

        var pct = plot(uv, y);
        var col = (1 - pct) * vec3f(y) + pct * vec3f(0., 1., .0);
        
        return vec4f(col, 1.);
    }

    fn plot(uv: vec2f, pct: f32) -> f32 {
        return s(pct - .02, pct, uv.y) -
               s(pct, pct + .02, uv.y);
    }

    fn s(a: f32, b: f32, t:f32) -> f32 {
        return smoothstep(a, b, t);
    }
`