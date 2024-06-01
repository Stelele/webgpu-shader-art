export const CircleFunc = /* wgsl */ `
    fn circle(uv: vec2f, v0: vec2f, r: f32, blur: f32) -> f32 {
        let d = length(uv - v0) - r;
        return smoothstep(r, r - blur, d);
    }
`