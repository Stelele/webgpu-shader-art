export const PalletFunc = /* wgsl */ `
    fn palette(t: f32) -> vec3f {
        let a = vec3(0.5, 0.5, 0.5);
        let b = vec3(0.5, 0.5, 0.5);
        let c = vec3(1.0, 1.0, 1.0);
        let d = vec3(0.263, 0.416, 0.557);

        return a + b * cos(6.28318 * (c * t + d));
    }
`