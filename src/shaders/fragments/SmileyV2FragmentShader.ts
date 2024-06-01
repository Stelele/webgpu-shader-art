import { Uniforms, VertexOut } from "../vertices";

export const SmileyV2FragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}

    @fragment
    fn vertexMain(in: VertexOut) -> @location(0) vec4f {
        var uv = 2 * in.cell / grid - 1;
        uv.x *= resolution.x / resolution.y;

        let smiley = smiley(uv);
        let color = vec4f(0.);
        var finalColor = mix(color, smiley, smiley.a);
        return finalColor;
    }

    fn smiley(uv: vec2f) -> vec4f {
        var base = head(uv);
        let eyes = eyes(uv);
        let mouth = mouth(uv);

        base = mix(base, eyes, eyes.a);
        base = mix(base, mouth, mouth.a);

        return base;
    }

    fn head(uv: vec2f) -> vec4f {
        var col = vec4f(.9, .65, .1, 1);

        var d = length(uv);
        col.a = s(0.5, 0.49, d);

        var edgeShadow = remap01(0.35, .5, d);
        edgeShadow *= edgeShadow;
        edgeShadow = 1 - edgeShadow * .5;
        col.r *= edgeShadow;
        col.g *= edgeShadow;
        col.b *= edgeShadow; 

        col.r = mix(col.r, .6, s(.47, .48, d));
        col.g = mix(col.g, .3, s(.47, .48, d));
        col.b = mix(col.b, .1, s(.47, .48, d));

        var lowerHighlight = s(.5, .45, d);
        lowerHighlight *= remap(-0.5, 0.05, .75, 0., uv.y);

        col.r = mix(col.r, .9, lowerHighlight);
        col.g = mix(col.g, .8, lowerHighlight);
        col.b = mix(col.b, .1, lowerHighlight);

        var upperHighlight = s(.42, .40, length(uv));
        upperHighlight *= remap(.41, 0., .75, 0., uv.y);

        col.r = mix(col.r, .9, upperHighlight);
        col.g = mix(col.g, .9, upperHighlight);
        col.b = mix(col.b, .9, upperHighlight);

        return col;
    }

    fn eyes(uv0: vec2f) -> vec4f {
        var uv = uv0;
        uv.x = abs(uv0.x);
        uv = within(uv, vec4f(.1, -.1, .31, .3));
        uv -= .5;
        let d = length(uv);
        
        var eye = s(.35, .3, d);
        var col = mix(vec4f(0.), vec4f(0., 0., 0., 1), eye);
        
        var highLight = s(.35, .3, d);
        highLight *= remap(.35, -.1, .3, .1, uv.y);
        col.r = mix(col.r, 1., highLight);
        col.g = mix(col.g, 1., highLight);
        col.b = mix(col.b, 1., highLight);

        var d2 = length(uv - vec2f(.0, .13));
        var accent = s(.15, .0, d2);
        var col2 = mix(vec4f(0.), vec4f(1.), accent);
        col2 *= remap(.14, .1, .25, .1, uv.y);
        
        return col + col2;
    }

    fn mouth(uv: vec2f) -> vec4f {
        var mouthUpper = length(uv - vec2f(0., -.1));
        mouthUpper = s(.25, .24, mouthUpper);

        var px = uv;
        px.y += .7;
        px.y -= px.x * px.x;
        var mouthLower = s(.5, .45, px.y);

        var mouth =  mouthLower * mouthUpper;
        var col = vec4f(.9, .1, .1, 1) * mouth;
        
        var pq = uv;
        pq.y += .72;
        pq.y -= pq.x * px.x;
        var teethUpper = s(.5, .49, pq.y);

        var pq2 = uv;
        pq2.y += .75;
        pq2.y -= pq2.x * pq2.x;
        var teethLower = s(.5, .49, pq2.y);

        var teeth = teethUpper - teethLower;
        teeth *= s(.21, .20, uv.x);
        teeth *= s(-.21, -.20, uv.x);
        
        col = mix(col, vec4f(1.), teeth);

        return col;
    }

    fn s(a: f32, b: f32, t: f32) -> f32 {
        return smoothstep(a, b, t);
    }

    fn remap(a: f32, b: f32, c: f32, d: f32, t: f32) -> f32 {
        return clamp(remap01(a, b, t) * (d - c) + c, 0., 1.);
    }

    fn remap01(a: f32, b: f32, t: f32) -> f32 {
        return clamp((t - a) / (b - a), 0., 1.);
    }

    fn within(uv: vec2f, rect: vec4f) -> vec2f {
        return (uv - rect.xy) / (rect.zw - rect.xy);
    }
`