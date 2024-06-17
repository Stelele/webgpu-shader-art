import { TWO_PI } from "../constants";

export const CircleFunc = /* wgsl */ `
    ${TWO_PI}
    
    fn circle(uv: vec2f, v0: vec2f, r: f32, blur: f32) -> f32 {
        let d = length(uv - v0) - r;
        return smoothstep(r, r - blur, d);
    }

    fn circle2(uv: vec2f, center: vec2f, radius: f32, blur: f32) -> f32 {
        let toCenter = center - uv;
        return smoothstep(radius + blur, radius - blur, dot(toCenter, toCenter) / radius);
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

    fn circleOutline(uv: vec2f, center: vec2f, r: f32, thickness: f32, blur: f32) -> f32 {
        var circle1 = circle2(uv, center, r, blur);
        var circle2 = circle2(uv, center, r - thickness, blur);

        return circle1 - circle2;
    }
`