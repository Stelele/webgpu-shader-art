export const RemapFunc = /* wgsl */ `
    fn remap(a: f32, b: f32, c: f32, d: f32, t: f32) -> f32 {
        return remap01(a, b, t) * (d - c) + c;
    }

    fn remap01(a: f32, b: f32, t: f32) -> f32 {
        return (t - a) / (b - a);
    }
`;