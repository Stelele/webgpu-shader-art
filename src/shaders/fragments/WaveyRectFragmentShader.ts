import { PI } from "../constants";
import { CircleFunc, PalletFunc, TransformationFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const WaveyRectFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${CircleFunc}
    ${PalletFunc}
    ${TransformationFunc}
    ${PI}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = 2 * in.cell / grid - 1;
        let iTime = f32(timeStep) / 1000;
        uv.x *= resolution.x / resolution.y;

        let finalColor = waveyRect(uv, iTime);

        return finalColor;
    }

    fn waveyRect(uv0: vec2f, iTime: f32) -> vec4f {
        var uv = uv0;
        uv.y -= sin(uv.x * 8. + iTime) * .1; 
        uv.x -= cos(uv.y * 3. + iTime) * .1;
        var mask = rect(uv, -.8, .8, -.2, .2, 0.01);
        var col = vec4f(palette(uv.x + iTime*.1), 1);
        var finalColor = col * mask;

        return finalColor;
    }

    fn rect(uv: vec2f, left: f32, right: f32, bottom: f32, top: f32, blur: f32) -> f32 {
        var mask = smoothstep(bottom - blur, bottom + blur , uv.y);
        mask *=  smoothstep(top + blur, top - blur, uv.y);
        mask *= smoothstep(left - blur, left + blur, uv.x);
        mask *=  smoothstep(right + blur, right - blur, uv.x);
        mask = clamp(mask, 0, 1); 

        return mask;
    }
`