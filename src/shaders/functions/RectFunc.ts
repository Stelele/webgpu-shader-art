export const RectFunc = /* wgsl */ `
    fn rect(uv: vec2f, left: f32, right: f32, top: f32, bottom: f32, blur: f32) -> f32 {
        return smoothstep(left - blur, left + blur, uv.x) *
               smoothstep(right + blur, right - blur, uv.x) *
               smoothstep(bottom - blur, bottom + blur, uv.y) *
               smoothstep(top + blur, top - blur, uv.y);

    }

    fn rectOutline(uv: vec2f, left: f32, right: f32, top: f32, bottom: f32, thickness: f32, blur: f32) -> f32 {
        var rect1 = rect(uv, left, right, top, bottom, blur);
        var rect2 = rect(uv, left + thickness, right - thickness, top - thickness, bottom + thickness, blur);

        return rect1 - rect2;
    }
`