// import { TWO_PI } from "../constants";
import { CircleFunc, RYBToRYBFunc, RectFunc, TransformationFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const ShapeShaperKataFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${RectFunc}
    ${CircleFunc}
    ${RYBToRYBFunc}
    ${TransformationFunc}
    

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = in.cell / grid;
        uv.x *= resolution.x / resolution.y;
        var t = f32(timeStep) / 1000.;
        var col = vec3f(.0);

        col = circleFunnies(uv, t);
        // col = fields(uv);
        // col = tableau(uv);
        // col = polarFields(uv, vec2f(.5), t);

        return vec4f(col, 1.);
    }

    fn polarFields(uv: vec2f, center: vec2f, t: f32) -> vec3f {
        var pos = center - uv;

        var r = length(pos) * 2.;
        var a = atan2(pos.y, pos.x);

        var f = cos(a * (3 * sin(t) + 5) + t * 25.);
        f = abs(cos(a * 5 * sin(a * uv.y + t)));
        // f = abs(cos(a * 3.5 * sin(t + uv.x * 2 + a * a))) * .5 + .1;
        // f = abs(cos(a*12. + t * 2)*sin(a*8. + t * 2))*.8 + .1;
        // f = smoothstep(-.5 + abs(cos(t)), .1 + abs(cos(t)) + r + .1, cos(a*10. + t * 5))*.2 + 0.3
        ;

        var col = vec3f(1. - smoothstep(f, f + .05, r));

        return col;
    }

    fn fields(uv: vec2f) -> vec3f {
        var st = 2 * uv - 1;

        var d = .0;
        
        d = length(abs(st) - .3);
        d = length(min(abs(st) - .3, vec2f(.0)));
        // d = length(max(abs(st) - .3, vec2f(.0)));

        var col = vec3f(fract(d * 10.));

        return col;
    }

    fn circleFunnies(uv: vec2f, t: f32) -> vec3f {
        // var col = tableau(uv);

        var r = .4 * abs(sin(t)) + .1;
        var shape = circle2(uv, vec2f(.5, .5), r, .01);
        var col = ryb2rgb(vec3f(abs(sin(r)), abs(cos(r)), 1.)) * shape;

        // var pct = distance(uv,vec2(0.4)) + distance(uv,vec2(0.6));
        // pct = distance(uv,vec2(0.4)) * distance(uv,vec2(0.6));
        // pct = min(distance(uv,vec2(0.4)),distance(uv,vec2(0.6)));
        // pct = max(distance(uv,vec2(0.4)),distance(uv,vec2(0.6)));
        // pct = pow(distance(uv,vec2(0.4)),distance(uv,vec2(0.6)));

        // var col = vec3f(1.) * pct;

        return col;
    }

    fn tableau(uv: vec2f) -> vec3f {
        var col = vec3f(.0);

        var background = ryb2rgb(vec3f(.0, .1, .9));
        var base = rect(uv, .1, .9, .9, .1, .005);
        col = mix(col, background, base);

        var borderCol = vec3f(.0);
        var borderThickness = .03;

        let redCell = rect(uv, .1, .3, .9, .5, .005);
        col = mix(col, ryb2rgb(vec3f(.0, .8, .5)), redCell);

        let yellowCell = rect(uv, .8, .9, .9, .5, .005);
        col = mix(col, ryb2rgb(vec3f(.2, .9, .9)), yellowCell);

        let blueCell = rect(uv, .65, .9, .2, .1, .005);
        col = mix(col, ryb2rgb(vec3f(.7, .8, .55)), blueCell);
        
        let border1 = rect(uv, .1, .9, .73, .73 - borderThickness, .005);
        col = mix(col, borderCol, border1);
        
        let border2 = rect(uv, .1, .9, .5, .5 - borderThickness, .005);
        col = mix(col, borderCol, border2);
        
        let border3 = rect(uv, .3, .3 + borderThickness, .9, .1, .005);
        col = mix(col, borderCol, border3);

        let border4 = rect(uv, .15, .15 + borderThickness, .9, .5 - borderThickness, .005);
        col = mix(col, borderCol, border4);

        let border5 = rect(uv, .65, .65 + borderThickness, .9, .1, .005);
        col = mix(col, borderCol, border5);

        let border6 = rect(uv, .8, .8 + borderThickness, .9, .1, .005);
        col = mix(col, borderCol, border6);

        let border7 = rect(uv, .3, .9, .2, .2 - borderThickness, .005);
        col = mix(col, borderCol, border7);

        return col;
    }
`