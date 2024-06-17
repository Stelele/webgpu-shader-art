import { PI } from "../constants";
import { CircleFunc, RectFunc, TransformationFunc } from "../functions";
import { Uniforms, VertexOut } from "../vertices";

export const PatternsKataFragmentShader = /* wgsl */ `
    ${VertexOut}
    ${Uniforms}
    ${CircleFunc}
    ${RectFunc}
    ${TransformationFunc}
    ${PI}

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
        var uv = in.cell / grid;
        uv.x *= resolution.x / resolution.y;
        var t = f32(timeStep) / 1000;

        var col = vec3f(.0);
        
        // col = pattern1(uv);
        // col = pattern2(uv);
        // col = pattern3(uv);
        // col = pattern4(uv);
        // col = pattern5(uv);
        // col = pattern6(uv);
        col = pattern7(uv);
        
        return vec4f(col, 1.);
    }
    
    fn pattern7(uv0: vec2f) -> vec3f {
        var t = f32(timeStep)  / 1000;
        var tileNum = 10.;
        var uv = 2 * tile(uv0, tileNum) - 1;
        var d = 1.;

        var cell = uv0 * tileNum - fract(uv0 * tileNum);
        
        // first design
        // d = truchet(rotate2D(uv, PI/2));

        // second design
        // if(cell.x % 2 == 0 && cell.y % 2 == 0) {
        //     d = truchet(rotate2D(uv, -PI/2));
        // } else if(cell.x % 2 == 1 && cell.y % 2 == 0) {
        //     d = truchet(rotate2D(uv, PI));
        // } else if(cell.x % 2 == 0 && cell.y % 2 == 1) {
        //     d = truchet(uv);
        // } else if(cell.x % 2 == 1 && cell.y % 2 == 1) {
        //     d = truchet(rotate2D(uv, PI/2));
        // }

        // third design
        var x = cell.x % 4;
        var y = cell.y % 4;


        if (y == 0) {
            d = truchet(rotate2D(uv, PI/2 - x * PI/2));
        } else if(y == 1) {
            d = truchet(rotate2D(uv, PI + x * PI/2));
        } else if(y == 2) {
            d = truchet(rotate2D(uv, -PI/2 - x * PI/2));
        } else if(y == 3) {
            d = truchet(rotate2D(uv, x * PI/2));
        }

        var col = vec3f(sin(t * PI/2 + cell.x/tileNum), sin(t * PI/2 - PI + cell.y/tileNum), abs(sin(t * PI/4 + length(2 * cell / tileNum - 1)))) * d;
    
        return col;
    }

    fn truchet(uv: vec2f) -> f32 {
        return smoothstep(uv.y, uv.y + .1, uv.x);
    }

    fn pattern6(uv0: vec2f) -> vec3f {
        var t = f32(timeStep) / 1000;
        var offset = vec2f(
            step(0, -sin(t * PI)) * t * .1, 
            step(0, sin(t * PI)) * t * .1
        );
        var _offset = vec2f(
            step(0, sin(-t * PI)) * -t * 3, 
            step(0, -sin(-t * PI)) * -t * 3
        );
        var uv = 2 * tileWithOffset(
            uv0 + offset, 20, 
            _offset, vec2f(2)
        ) - 1;

        var r = .6;
        var blur = .1;
        var d = smoothstep(r, r + blur, length(uv));

        return vec3f(1.) * d;
    }

    fn pattern5(uv0: vec2f) -> vec3f {
        var t = f32(timeStep) / 1000; 
        var uv = uv0 / vec2f(2.15, .65) / 1.5;
        uv = 2 * tileWithOffset(uv + vec2f(-t * .1, 0), 10, vec2f(.5 + t * 1.65, .0), vec2f(2, 0)) - 1;

        var l = .95;
        var blur = .01;
        var r = rect(uv, -l, l, l, -l, blur);
        return mix(vec3f(.7), vec3f(.9, .3, .0), r);
    }


    fn pattern4(uv0: vec2f) -> vec3f {
        var uv = 2 * tileWithOffset(uv0, 5, vec2f(.5, .5), vec2f(2, 2)) - 1;

        var l = .95;
        var blur = .01;
        var r = rect(uv, -l, l, l, -l, blur);
        return vec3f(1.) * r;
    }

    fn pattern3(uv0: vec2f) -> vec3f {
        var uv = 2 * tile(uv0, 5) - 1;

        var l = .3;
        var thickness = .1;
        var blur = .01;
        var w = .05;
        var s = lines(uv, w, l, thickness);
        s += lines(rotate2D(uv, PI/2), w, l, thickness);
        s += rectOutline(rotate2D(uv, PI/4), -l, l, l, -l, thickness, blur);

        return vec3f(1) * s;
    }

    fn lines(uv: vec2f, w: f32, l: f32, thickness: f32) -> f32 {
        return rect(uv, -w, w, 1, l + thickness, .01) + rect(uv, -w, w, -l - thickness, -1, .01);
    }

    fn pattern2(uv0: vec2f) -> vec3f {
        var t = f32(timeStep) / 1000;
        var uv = 2 * tile(uv0, 4) - 1;
    
        var l = -.65 + abs(sin(t * PI/2)) + sin(length(uv) * PI);
        var r = rect(rotate2D(uv, PI/4 + t), -l, l, l, -l, .01);

        return vec3f(1., sin(t * PI), cos(t * PI)) * r;
    }

    fn pattern1(uv0: vec2f) -> vec3f {
        var uv = uv0;
        var tileNum = 5.;

        uv = 2 * tile(uv, tileNum) - 1;

        var cell = tileNum * uv0 - fract(tileNum * uv0);

        var blue = 1. - length(cell);
        var other = cell % tileNum;
        if(blue <= .0 && other.x == .0 && other.y == .0) {
            blue = abs(blue);
        }


        var col = vec3f(other, blue);
        
        if(cell.x % 2 == 0 && cell.y % 2 == 0) {
            col *= cross(uv);
        } else if(cell.y % 2 == 1 && cell.x % 2 == 1 ) {
            col *= cross(uv);
        } else if(cell.y % 2 == 1) {
            col *= _circle(uv);
        } else if(cell.x % 2 == 1 && cell.y % 2 == 0) {
            col *= _circle(uv);
        }

        return col;
    }

    fn cross(uv0: vec2f) -> f32 {
        var uv = rotate2D(uv0, PI / 4);

        var box1 = rect(uv, -.8, .8, .2, -.2, .1);
        var box2 = rect(uv, -.2, .2, .8, -.8, .1);

        return box1 + box2;
    }

    fn _circle(uv: vec2f) -> f32 {
        return circleOutline(uv, vec2f(.0), .8, .2, .1);
    }

    fn tile(uv: vec2f, num: f32) -> vec2f {
        return fract(uv * num);
    }

    fn tileWithOffset(uv: vec2f, num: f32, offset: vec2f, freq: vec2f) -> vec2f {
        var st = uv * num;
        st += step(vec2f(1.), st.yx % freq) * offset;

        return fract(st);
    }
`