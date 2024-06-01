import { PalletFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const FirstArtFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${PalletFunc}

    @fragment
    fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
        var iTime = f32(timeStep) / 1000;
        var uv = 2 * input.cell / grid - 1;
        uv.x *= resolution.x / resolution.y;
        let uv0 = uv;
        var finalColor: vec3f;

        
        for(var i = 0; i < 4; i++) {
            uv = fract(uv * 1.5) - 0.5;
            var d = length(uv) * exp(-length(uv0));
            var col = palette(length(uv0) + f32(i) * 0.4 + iTime * 0.4);
            d = sin(d * 8 + iTime) / 8;
            d = abs(d);
            d = smoothstep(0.0, 0.1, d);

            d = pow(0.01 / d, 1.2);

            finalColor += d * col;
        }
        return vec4f(finalColor, 1);
    }
`