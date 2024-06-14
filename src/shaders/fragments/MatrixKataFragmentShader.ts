import { Uniforms, VertexOut } from "../vertices";

export const MatrixKataFragementShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var col = vec3f(1.);

        return vec4f(col, 1);
    }
`