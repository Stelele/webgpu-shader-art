export const PolygonFunc = /* wgsl */ `
    fn polygon(uv: vec2f, sides: f32) -> f32 {
        var a = atan2(uv.x, uv.y) + PI;
        var r = TWO_PI / sides;

        var d = cos(floor(.5 + a / r) * r - a) * length(uv);

        var col = 1. - smoothstep(.4, .41, d);
        return col;
    }
`