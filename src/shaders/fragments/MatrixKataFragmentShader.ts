import { TWO_PI } from "../constants";
import { CircleFunc, RYBToRYBFunc, RectFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const MatrixKataFragementShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${CircleFunc}
    ${RYBToRYBFunc}
    ${RectFunc}
    ${TWO_PI}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var col = vec3f(.0);
        var uv = 2 * in.cell / grid - 1;
        uv.x *= resolution.x / resolution.y;

        var t = f32(timeStep) / 1000;

        col = oblivionRador(uv, t);

        return vec4f(col, 1);
    }

    fn oblivionRador(uv: vec2f, t: f32) -> vec3f {
        var col = vec3f(.0);
        var center = vec2f(.0);

        let primaryColor = ryb2rgb(vec3f(.6, .8, .8));
        let secondaryColor = vec3f(.8, .8, .8);
        let thickness = .01;
        let blur = .01;


        let line1 = rect(rotate2D(uv, PI / 4), -.001, .001, 1., -1., .01);
        col = mix(col, secondaryColor, line1);

        let line2 = rect(rotate2D(uv, -PI / 4), -.001, .001, 1., -1, .01);
        col = mix(col, secondaryColor, line2);

        let circle0 = circle2(uv, center, .007, .005);
        col = mix(col, primaryColor, circle0);

        let circle1 = circleOutline(uv, center, .05, thickness, blur);
        col = mix(col, primaryColor, circle1);

        let _circle2 = circleOutline(uv, center, .1, thickness, blur);
        col = mix(col, primaryColor, _circle2);

        let circle3 = circleOutline(uv, center, .7, thickness, blur);
        col = mix(col, primaryColor, circle3);

        let circle4 = circleOutline(uv, center, 1.1, thickness, blur);
        col = mix(col, secondaryColor, circle4);

        let circle5 = circleLineSegment(uv, center, 1.6, .1, thickness, blur);
        col = mix(col, primaryColor * 1.5, circle5);

        let circle6 = circleLineSegment(uv, center, 1.2, 1.5 - abs(sin(t)), thickness, blur);
        col = mix(col, primaryColor * .5, circle6);

        let rader = circleSegment(rotate2D(uv, -t), vec2f(.0), 1.09, blur);
        col = mix(col, primaryColor, rader);

        var triangle = twoTriangles(uv, t);
        col = mix(col, secondaryColor, triangle);

        for(var i = 0; i < 3; i++) {
            var uv0 = uv;
            uv0.x += sin(t * .8 + f32(i) * PI) + f32(i) / 3;
            uv0.y += cos(t * .7+ f32(i) * PI) + f32(i) / 3;
            var spawn = circle2(uv0, vec2f(f32(i)/5), .02, blur);
            col = mix(col, secondaryColor, spawn);
        }

        var tgt = targetMark(uv, t);
        col = mix(col, tgt, tgt.x);

        return col;
    }

    fn targetMark(uv0: vec2f, t: f32) -> vec3f {
        var uv = uv0;
        uv.x += sin(t * .8) * .8;
        uv.y += cos(t * .8);
        
        var col = vec3f(.0);
        var center = vec2f(.3);

        var primaryColor = vec3f(.8, .0, .0);

        var c = circle2(uv, center, .02, .01);
        col = mix(col, primaryColor + .8 * vec3f(sin(t * PI * 2), .0, .0), c);

        var outline = circleOutline(uv, center, .04, .01, .01);
        col = mix(col, primaryColor, outline);

        var outline1 = circleOutline(uv, center, .06 + .15 * abs(sin(t * PI)), .01 + .05 * abs(sin(t * PI)), .01);
        col = mix(col, primaryColor, outline1);

        return col;
    }

    fn twoTriangles(uv: vec2f, t: f32) -> f32 {
        var scaledUV = scale2D(uv, vec2f(10));
        var uv1 = scaledUV + vec2f(-16. + 1.5 * sin(2 * t), .0);
        var uv2 = scaledUV + vec2f(16   - 1.5 * sin(2 * t), .0);

        var triangle1 = polygon(rotate2D(uv1, PI/2), 3);
        var triangle2 = polygon(rotate2D(uv2, -PI/2), 3);

        return triangle1 + triangle2;
    }

    fn polygon(uv: vec2f, sides: f32) -> f32 {
        var a = atan2(uv.x, uv.y) + PI;
        var r = TWO_PI / sides;

        var d = cos(floor(.5 + a / r) * r - a) * length(uv);

        var col = 1. - smoothstep(.4, .41, d);
        return col;
    }

    fn circleLineSegment(uv: vec2f, center: vec2f, radius: f32, theta: f32, thickness: f32, blur: f32) ->  f32 {
        var uv0 = rotate2D(uv, theta/2);
        var theta0 = atan2(uv0.y, uv0.x);
        var segment0 = circleOutline(uv0, center, radius, thickness, blur);
        segment0 *= smoothstep(-theta, -theta - .01, theta0);

        var uv1 = rotate2D(uv, PI + theta /2);
        var theta1 = atan2(uv1.y, uv1.x);
        var segment1 = circleOutline(uv1, center, radius, thickness, blur);
        segment1 *= smoothstep(-theta, -theta - .01, theta1);

        return segment0 + segment1;
    }

    fn circleSegment(uv: vec2f, center: vec2f, radius: f32, blur: f32) -> f32 {
        var r = length(uv);
        var theta = atan2(uv.y, uv.x) / TWO_PI + .5;

        var circle = 3. * (.25 - theta) * smoothstep(radius, radius - .1, r) * smoothstep(.2, .2 - .1, theta);

        var line = rect(rotate2D(uv, 1.57), -.007, .007, radius -.05, center.y, .01);


        return circle + line;
    }

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

    fn circleOutline(uv: vec2f, center: vec2f, r: f32, thickness: f32, blur: f32) -> f32 {
        var circle1 = circle2(uv, center, r, blur);
        var circle2 = circle2(uv, center, r - thickness, blur);

        return circle1 - circle2;
    }
`