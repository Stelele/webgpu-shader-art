import { CircleFunc, PolygonFunc, RYBToRYBFunc, RectFunc, TransformationFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const MatrixKataFragementShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${CircleFunc}
    ${RYBToRYBFunc}
    ${RectFunc}
    ${TransformationFunc}
    ${PolygonFunc}

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
`