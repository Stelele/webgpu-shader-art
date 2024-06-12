import { Maps } from "./MapFunc"

export const HSB2RGPFunc = /* wgsl */ `
    fn hsb2rgb(hsb: vec3f) -> vec3f {
        var rgb = clamp(
                    abs(
                        ((hsb.x * 6. + vec3f(.0, 4., 2.)) % 6.) - 3.
                    ) - 1.,
                    vec3f(.0),
                    vec3f(1.)
                );

        rgb = rgb * rgb * (3. - 2. * rgb);
        return hsb.z * mix(vec3f(1.), rgb, hsb.y);
    }
`

export const RYBToRYBFunc = /* wgsl */ `
    ${HSB2RGPFunc}
    ${Maps}

    fn ryb2rgb(ryb: vec3f) -> vec3f {
        var theta = ryb[0];
        var r = ryb[1];
        var b = ryb[2];

        theta = hsbCorrection1(theta * 360) / 360;

        var col = hsb2rgb(vec3f(theta, r, b));

        return col;
    }

    fn hsbCorrection(hue0: f32) -> f32 {
        return map3(hue0 % 360, 0, 360, 0, 360, 1.6, EASE_IN);
    }

    fn hsbCorrection1(hue0: f32) -> f32 {
        var ryb_hue: f32 = .0;

        var ryb_wheel: array<vec2f, 25> = array(
            vec2f(0,     0), vec2f(15,    8), vec2f(30,   17), vec2f(45,   26),
            vec2f(60,   34), vec2f(75,   41), vec2f(90,   48), vec2f(105,  54),
            vec2f(120,  60), vec2f(135,  81), vec2f(150, 103), vec2f(165, 123),
            vec2f(180, 138), vec2f(195, 155), vec2f(210, 171), vec2f(225, 187),
            vec2f(240, 204), vec2f(255, 219), vec2f(270, 234), vec2f(285, 251),
            vec2f(300, 267), vec2f(315, 282), vec2f(330, 298), vec2f(345, 329),
            vec2f(360,   0) 
        );

        var hue = hue0 % 360;

        for(var i = 0; i < 23; i++) {
            var x0 = ryb_wheel[i][0];
            var y0 = ryb_wheel[i][1];
            var x1 = ryb_wheel[i + 1][0];
            var y1 = ryb_wheel[i + 1][1];

            // Ensure that y1 > y0
            if(y1 < y0) {
                y1 += 360;
            }

            // if hue lies between y0 and y1, do linear mapping
            if (hue >= x0 && hue < x1) {
                ryb_hue = map(hue, x0, x1, y0, y1) % 360;
                break;
            }
        }

        return ryb_hue;
    }
`