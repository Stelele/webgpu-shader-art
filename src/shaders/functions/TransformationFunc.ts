export const TransformationFunc = /* wgsl */ `
    fn rotate2D(uv: vec2f, theta: f32) -> vec2f{
        let rotation = mat2x2f(
            cos(theta), -sin(theta),
            sin(theta), cos(theta)
        );

        return  rotation * uv;
    }

    fn scale2D(uv: vec2f, scale: vec2f) -> vec2f {
        var s = mat2x2f(scale.x, .0,
                        .0     , scale.y
        );

        return scale * uv;
    }
`