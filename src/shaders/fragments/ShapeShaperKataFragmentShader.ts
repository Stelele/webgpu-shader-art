import { Uniforms, VertexOut } from "../vertices";

export const ShapeShaperKataFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var col = vec4f(1.);

        return col;
    }
`