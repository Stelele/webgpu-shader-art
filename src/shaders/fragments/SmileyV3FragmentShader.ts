import { Uniforms, VertexOut } from "../vertices";

export const SmileyV3FragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = 2 * in.cell / grid - 1;
        uv.x *= resolution.x / resolution.y;

        let smiley = smiley(uv);

        return smiley;
    }

    fn smiley(uv: vec2f) -> vec4f {
        var col = head(uv);
        let eyes = eyes(uv);
        let mouth = mouth(uv);

        col = mix(col, eyes, eyes.a);
        col = mix(col, mouth, mouth.a);

        return col;
    }

    fn head(uv: vec2f) -> vec4f {
        var col = vec4f(.9, .65, .1, 1.);
        var d = length(uv);

        col = mix(col, vec4f(0.), s(.49, .5, d));

        var fade = remap01(.2, .5, d);
        fade *= fade * fade;
        fade = 1 - fade * .5;
        col.r *= fade;
        col.g *= fade;
        col.b *= fade;

        var upperInnerHighlight = s(.4, .3, d);
        upperInnerHighlight *= remap(.4, -.2, .5, 0., uv.y);
        col.r = mix(col.r, .9, upperInnerHighlight);
        col.g = mix(col.g, .9, upperInnerHighlight);
        col.b = mix(col.b, .1, upperInnerHighlight);

        var upperHighlight = s(.35, -.1, length(uv - vec2f(.0, .1))) * .45;
        col.r = mix(col.r, 1., upperHighlight);
        col.g = mix(col.g, 1., upperHighlight);
        col.b = mix(col.b, 1., upperHighlight);

        return col;
    }

    fn eyes(uv0: vec2f) -> vec4f {
        var uv = uv0;
        uv.x = abs(uv.x);
        uv = within(uv, vec4f(.19, .12, 1., 1.2));

        var d = length(uv);
        var col = vec4f(.0);

        var scleraLining = vec4f(.0, .0, .0, 1.);
        scleraLining = mix(scleraLining, vec4f(.0), s(.15, .16, d));
        col = mix(col, scleraLining, scleraLining.a);

        var sclera = vec4f(1.);
        sclera = mix(sclera, vec4f(.0), s(.14, .15, d));
        col = mix(col, sclera, sclera.a);

        var lining = s(.1, .09, d);
        col = mix(col, vec4f(.0, .0, .0, 1.), lining);

        var irisD = s(.08, .09, d);
        var iris = mix(vec4f(.3, .3, 1., 1.), vec4f(.0), irisD);
        iris *= remap(.0, .09, 1., .9, d);
        iris *= iris;
        col = mix(col, iris, iris.a);

        var pupilD = s(.03, .04, d);
        var pupils = mix(vec4f(.0, .0, .0, 1), vec4f(.0), pupilD);
        col = mix(col, pupils, pupils.a);

        var pd = s(.01, .02, length(uv - vec2f(.0, .04)));
        var pupilHighlight = mix(vec4f(1.), vec4f(0.), pd);
        col = mix(col, pupilHighlight, pupilHighlight.a);

        var pd2 = s(.01, .02, length(uv - vec2f(.05, .0)));
        var pupilHighlight2 = mix(vec4f(1.), vec4f(0.), pd2);
        col = mix(col, pupilHighlight2, pupilHighlight2.a);

        return col;
    }

    fn mouth(uv0: vec2f) -> vec4f {
        var uv = uv0 - vec2f(.0, .1); 

        var col = vec4f(1., 0., 0., 1);
        
        var blur = 0.01;
        var uv1 = uv - vec2f(.0, -.2);
        uv1.y -= (uv1.x - .35) * (uv1.x + .35);
        var upperMouth = s(.0 + blur, .0 - blur, uv1.y);
        upperMouth *= s(-.5, -.45, uv1.x) * s(.5, .45, uv1.x);

        var d = s(.3, .31, length(uv - vec2f(0., -.2)));
        var lowerMouth = mix(vec4f(1.), vec4f(0.), d);

        var mouth = upperMouth *  lowerMouth;

        col = mix(vec4f(0.), col, mouth);
        col.r *= remap(.1, .0, .85, 1, abs(uv1.x));

        var uv2 = uv - vec2f(.0, -.2);
        uv2.y -= (uv2.x - .35) * (uv2.x + .35);
        var teethD = s(.0 + blur, .0 - blur, uv2.y);
        teethD *= s(-.25, -.24, uv2.x) * 
                 s(.25, .24, uv2.x) *
                 s(-.05, -.04, uv2.y) *
                 s(.1, .09, uv2.y);

        var teeth = mix(vec4f(0.), vec4f(1.), teethD);
        col = mix(col, teeth, teeth.a);
        
        return col;
    }

    fn s(a: f32, b: f32, t: f32) -> f32 {
        return smoothstep(a, b, t);
    }

    fn remap(a: f32, b: f32, c: f32, d: f32, t: f32) -> f32 {
        return remap01(a, b, t) * (d - c) + c;
    }

    fn remap01(a: f32, b: f32, t: f32) -> f32 {
        return clamp((t - a) / (b - a), 0, 1.); 
    }

    fn within(uv: vec2f, rect: vec4f) -> vec2f {
        return (uv - rect.xy) / (rect.zw - rect.xy);
    }
`